import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { MongoClient } from "mongodb"

const root = process.cwd()
const table = process.env.SUPABASE_BLOGS_TABLE || "waichatt_blogs"
const dryRun = !process.argv.includes("--write")

const loadEnv = async (file) => {
  if (!existsSync(file)) return
  const lines = (await readFile(file, "utf8")).split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
    const [key, ...parts] = trimmed.split("=")
    if (process.env[key]) continue
    process.env[key] = parts.join("=").replace(/^['"]|['"]$/g, "")
  }
}

await loadEnv(path.join(root, ".env.local"))
await loadEnv(path.join(root, ".env"))

const supabaseUrl = (process.env.SUPABASE_URL || process.env.DATABASE_URL || "").replace(/\/+$/, "")
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_ANON_KEY
const mongoUri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "waichatt"
const collectionName = process.env.MONGODB_BLOGS_COLLECTION || "blogs"

if (!supabaseUrl || !supabaseKey) throw new Error("Falta SUPABASE_URL/DATABASE_URL o SUPABASE_*_KEY/PUBLIC_ANON_KEY.")
if (!mongoUri) throw new Error("Falta MONGODB_URI.")

const clean = (value) => String(value ?? "").trim()

const slugify = (value) =>
  clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const toDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10)
}

const excerpt = (value, max = 165) => {
  const text = clean(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ")
  if (text.length <= max) return text
  const cut = text.slice(0, max + 1)
  return `${cut.slice(0, cut.lastIndexOf(" ") > 90 ? cut.lastIndexOf(" ") : max).trim()}...`
}

const mediaUrl = (item) => {
  if (typeof item === "string") return clean(item)
  return clean(item?.url || item?.src || item?.image || item?.video)
}

const mediaAlt = (item, fallback) => clean(item?.alt || item?.title || fallback)

const sectionToMarkdown = (section) => {
  const title = clean(section?.title)
  const subtitle = clean(section?.subtitle)
  const description = clean(section?.description)
  const parts = []

  if (title) parts.push(`## ${title}`)
  if (subtitle && subtitle !== title) parts.push(title ? `### ${subtitle}` : `## ${subtitle}`)
  if (description) parts.push(description)

  for (const image of Array.isArray(section?.images) ? section.images : []) {
    const url = mediaUrl(image)
    if (/^https?:\/\//i.test(url)) parts.push(`![${mediaAlt(image, subtitle || title)}](${url})`)
  }

  for (const video of Array.isArray(section?.videos) ? section.videos : []) {
    const url = mediaUrl(video)
    if (/^https?:\/\//i.test(url)) parts.push(`[Video: ${mediaAlt(video, subtitle || title || "ver contenido")}](${url})`)
  }

  return parts.join("\n\n")
}

const tagsFor = (row) => {
  const text = `${row.title || ""} ${row.subtitle || ""} ${row.description || ""}`.toLowerCase()
  const tags = new Set(["IA inmobiliaria"])
  if (text.includes("crm")) tags.add("CRM inmobiliario")
  if (text.includes("whatsapp")) tags.add("WhatsApp")
  if (text.includes("chatgpt")) tags.add("ChatGPT")
  if (text.includes("claude")) tags.add("Claude")
  if (text.includes("ventas")) tags.add("Ventas inmobiliarias")
  if (text.includes("agente")) tags.add("Agente IA")
  return [...tags]
}

const normalize = (row) => {
  const title = clean(row.title)
  const slug = slugify(row.slug || title)
  const introTitle = clean(row.subtitle)
  const intro = clean(row.description)
  const sections = Array.isArray(row.sections) ? row.sections : []
  const body = [introTitle ? `## ${introTitle}` : "", intro, ...sections.map(sectionToMarkdown)].filter(Boolean).join("\n\n")
  const publishDate = toDate(row.created_at)

  if (!slug || !title || !body) return null

  return {
    legacySupabaseId: row.id,
    legacyRecommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
    slug,
    title,
    description: excerpt(intro || body),
    publishDate,
    tags: tagsFor(row),
    draft: row.status !== "published",
    ...(clean(row.main_image).match(/^https?:\/\//i) ? { image: clean(row.main_image) } : {}),
    body,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const fetchRows = async () => {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&order=created_at.asc.nullslast`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Range: `${from}-${from + 999}`,
      },
    })
    if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
    const chunk = await response.json()
    rows.push(...chunk)
    if (chunk.length < 1000) return rows
  }
}

const rows = await fetchRows()
const posts = rows.map(normalize).filter(Boolean)
const skipped = rows.length - posts.length

console.log(`Supabase: ${rows.length} filas. Migrables: ${posts.length}. Saltadas: ${skipped}.`)
for (const post of posts) {
  console.log(`${dryRun ? "dry-run" : "upsert"}: ${post.slug} (${post.draft ? "draft" : "published"})`)
}

if (dryRun) {
  console.log("No se escribió nada. Corré con --write para migrar a Mongo.")
  process.exit(0)
}

const client = new MongoClient(mongoUri)
await client.connect()
try {
  const collection = client.db(dbName).collection(collectionName)
  let upserted = 0
  let modified = 0

  for (const post of posts) {
    const result = await collection.updateOne(
      { slug: post.slug },
      {
        $set: post,
        $setOnInsert: { migratedFrom: "supabase" },
      },
      { upsert: true },
    )
    upserted += result.upsertedCount
    modified += result.modifiedCount
  }

  console.log(`Mongo listo: ${upserted} insertados, ${modified} actualizados.`)
} finally {
  await client.close()
}
