import { MongoClient, ObjectId, type Document } from "mongodb"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

type BlogInput = {
  slug?: string
  title?: string
  description?: string
  publishDate?: string
  updatedDate?: string
  tags?: string[]
  draft?: boolean
  body?: string
  author?: {
    name?: string
    role?: string
    url?: string
    bio?: string
  }
  howTo?: {
    name?: string
    steps?: { title?: string; desc?: string }[]
  }
  faqs?: { tag?: string; question?: string; answer?: string }[]
}

const globalForMongo = globalThis as typeof globalThis & {
  waichattMongoClient?: Promise<MongoClient>
}

const getBlogs = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI no configurado")

  globalForMongo.waichattMongoClient ??= new MongoClient(uri).connect()
  const client = await globalForMongo.waichattMongoClient
  return client
    .db(process.env.MONGODB_DB || "waichatt")
    .collection(process.env.MONGODB_BLOGS_COLLECTION || "blogs")
}

const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  return Boolean(session && (session.user as any).rol === "admin")
}

const clean = (value: unknown) => String(value ?? "").trim()

// Normaliza el slug al mismo formato que acepta el sync del blog estático
// (^[a-z0-9]+(?:-[a-z0-9]+)*$). Sin esto, un slug con mayúsculas/espacios/acentos
// se guarda en Mongo pero el sync lo descarta en silencio y el post nunca se publica.
const slugify = (value: string) =>
  clean(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const normalizeBlog = (input: BlogInput) => {
  const slug = slugify(input.slug ?? "")
  const title = clean(input.title)
  const description = clean(input.description)
  const publishDate = clean(input.publishDate)
  const body = clean(input.body)

  if (!slug || !title || !description || !publishDate || !body) {
    return { error: "slug, title, description, publishDate y body son obligatorios" }
  }

  const authorName = clean(input.author?.name)
  const howToName = clean(input.howTo?.name)
  const howToSteps = (input.howTo?.steps || [])
    .map((step) => ({ title: clean(step.title), desc: clean(step.desc) }))
    .filter((step) => step.title && step.desc)
  const faqs = (input.faqs || [])
    .map((faq) => ({
      tag: clean(faq.tag),
      question: clean(faq.question),
      answer: clean(faq.answer),
    }))
    .filter((faq) => faq.question && faq.answer)

  return {
    blog: {
      slug,
      title,
      description,
      publishDate,
      ...(clean(input.updatedDate) ? { updatedDate: clean(input.updatedDate) } : {}),
      tags: (input.tags || []).map(clean).filter(Boolean),
      draft: Boolean(input.draft),
      body,
      ...(authorName
        ? {
            author: {
              name: authorName,
              ...(clean(input.author?.role) ? { role: clean(input.author?.role) } : {}),
              ...(clean(input.author?.url) ? { url: clean(input.author?.url) } : {}),
              ...(clean(input.author?.bio) ? { bio: clean(input.author?.bio) } : {}),
            },
          }
        : {}),
      ...(howToName && howToSteps.length ? { howTo: { name: howToName, steps: howToSteps } } : {}),
      ...(faqs.length ? { faqs } : {}),
    },
  }
}

const toJson = (blog: Document) => ({
  ...blog,
  id: blog._id.toString(),
  _id: undefined,
})

export async function GET() {
  if (!(await requireAdmin())) return new Response("No autorizado", { status: 401 })

  try {
    const blogs = await (await getBlogs())
      .find({})
      .sort({ publishDate: -1, createdAt: -1 })
      .toArray()

    return NextResponse.json({ blogs: blogs.map(toJson) })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Error al obtener los blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return new Response("No autorizado", { status: 401 })

  try {
    const normalized = normalizeBlog(await request.json())
    if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 })

    const blogs = await getBlogs()
    const exists = await blogs.findOne({ slug: normalized.blog.slug })
    if (exists) return NextResponse.json({ error: "El slug ya existe" }, { status: 409 })

    const now = new Date().toISOString()
    const result = await blogs.insertOne({ ...normalized.blog, createdAt: now, updatedAt: now })
    const blog = await blogs.findOne({ _id: result.insertedId })

    return NextResponse.json({ blog: blog ? toJson(blog) : null }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Error al crear el blog" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return new Response("No autorizado", { status: 401 })

  try {
    const body = await request.json()
    if (!ObjectId.isValid(body.id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const normalized = normalizeBlog(body)
    if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 })

    const blogs = await getBlogs()
    const id = new ObjectId(body.id)
    const duplicate = await blogs.findOne({ slug: normalized.blog.slug, _id: { $ne: id } })
    if (duplicate) return NextResponse.json({ error: "El slug ya existe" }, { status: 409 })

    await blogs.updateOne(
      { _id: id },
      { $set: { ...normalized.blog, updatedAt: new Date().toISOString() } },
    )

    const blog = await blogs.findOne({ _id: id })
    return NextResponse.json({ blog: blog ? toJson(blog) : null })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ error: "Error al actualizar el blog" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return new Response("No autorizado", { status: 401 })

  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    await (await getBlogs()).deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ message: "Blog eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ error: "Error al eliminar el blog" }, { status: 500 })
  }
}
