"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, FileText, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteBlogDialog } from "@/components/admin/crear-blog/delete-blog-dialog"
import { blogAuthors } from "@/data/blog-authors"

type Faq = { tag: string; question: string; answer: string }
type HowToStep = { title: string; desc: string }

type BlogForm = {
  slug: string
  title: string
  description: string
  publishDate: string
  updatedDate: string
  tags: string
  draft: boolean
  body: string
  author: {
    name: string
    role: string
    url: string
    bio: string
  }
  howTo: {
    name: string
    steps: HowToStep[]
  }
  faqs: Faq[]
}

type Blog = Omit<BlogForm, "tags"> & {
  id: string
  tags: string[]
  createdAt?: string
}

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = (): BlogForm => ({
  slug: "",
  title: "",
  description: "",
  publishDate: today(),
  updatedDate: "",
  tags: "",
  draft: true,
  body: "",
  author: { name: "", role: "", url: "", bio: "" },
  howTo: { name: "", steps: [] },
  faqs: [],
})

const splitTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

// Valida lo necesario para que el blog sume al SEO. `publishing` exige el set completo;
// como borrador alcanza con el frontmatter base. Devuelve el primer error o null.
const validateForm = (form: BlogForm, publishing: boolean): string | null => {
  if (!form.title.trim() || !form.slug.trim() || !form.description.trim() || !form.publishDate || !form.body.trim()) {
    return "Título, slug, descripción, fecha y contenido son obligatorios."
  }
  const halfFaq = form.faqs.some((faq) => Boolean(faq.question.trim()) !== Boolean(faq.answer.trim()))
  if (halfFaq) return "Cada FAQ necesita pregunta y respuesta."
  const halfStep = form.howTo.steps.some((step) => Boolean(step.title.trim()) !== Boolean(step.desc.trim()))
  if (halfStep) return "Cada paso del HowTo necesita título y descripción."
  if (form.howTo.name.trim() && !form.howTo.steps.some((step) => step.title.trim() && step.desc.trim())) {
    return "El HowTo necesita al menos un paso completo, o quitá su nombre para no incluirlo."
  }
  if (publishing) {
    if (!splitTags(form.tags).length) return "Agregá al menos un tag: son las palabras clave del artículo."
    if (!form.author.name.trim()) return "Seleccioná un autor: el contenido firmado mejora el SEO (E-E-A-T)."
  }
  return null
}

export default function CrearBlogPage() {
  const [form, setForm] = useState<BlogForm>(emptyForm)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [mainTab, setMainTab] = useState("crear")
  const [activeTab, setActiveTab] = useState("editor")
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchBlogs = async () => {
    setIsLoadingBlogs(true)
    try {
      const response = await fetch("/api/admin/blogs")
      const data = await response.json()
      setBlogs(data.blogs || [])
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast.error("Error al cargar los artículos")
    } finally {
      setIsLoadingBlogs(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const updateForm = (field: keyof BlogForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateAuthor = (field: keyof BlogForm["author"], value: string) => {
    setForm((prev) => ({ ...prev, author: { ...prev.author, [field]: value } }))
  }

  // Selecciona un founder y rellena los campos de autor; "custom" los limpia para edición manual.
  const selectAuthor = (name: string) => {
    const found = name === "custom" ? null : blogAuthors.find((author) => author.name === name)
    setForm((prev) => ({ ...prev, author: found ? { ...found } : { name: "", role: "", url: "", bio: "" } }))
  }

  const selectedAuthor = blogAuthors.some((author) => author.name === form.author.name)
    ? form.author.name
    : "custom"

  const updateFaq = (index: number, field: keyof Faq, value: string) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, [field]: value } : faq)),
    }))
  }

  const updateStep = (index: number, field: keyof HowToStep, value: string) => {
    setForm((prev) => ({
      ...prev,
      howTo: {
        ...prev.howTo,
        steps: prev.howTo.steps.map((step, stepIndex) =>
          stepIndex === index ? { ...step, [field]: value } : step,
        ),
      },
    }))
  }

  const payload = {
    ...form,
    tags: splitTags(form.tags),
    author: form.author.name.trim() ? form.author : undefined,
    howTo: form.howTo.name.trim() && form.howTo.steps.length ? form.howTo : undefined,
    faqs: form.faqs.length ? form.faqs : undefined,
  }

  const handleSubmit = async (draft: boolean) => {
    const error = validateForm(form, !draft)
    if (error) {
      toast.error(error)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/blogs", {
        method: editingBlogId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlogId ? { ...payload, draft, id: editingBlogId } : { ...payload, draft }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al guardar el blog")

      toast.success(draft ? "Blog guardado como borrador" : "Blog publicado")
      setForm(emptyForm())
      setEditingBlogId(null)
      setMainTab("gestionar")
      fetchBlogs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el blog")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (blog: Blog) => {
    setForm({
      slug: blog.slug || "",
      title: blog.title || "",
      description: blog.description || "",
      publishDate: blog.publishDate?.slice(0, 10) || today(),
      updatedDate: blog.updatedDate?.slice(0, 10) || "",
      tags: (blog.tags || []).join(", "),
      draft: Boolean(blog.draft),
      body: blog.body || "",
      author: blog.author || { name: "", role: "", url: "", bio: "" },
      howTo: blog.howTo || { name: "", steps: [] },
      faqs: blog.faqs || [],
    })
    setEditingBlogId(blog.id)
    setMainTab("crear")
    setActiveTab("editor")
  }

  const handleDelete = async () => {
    if (!blogToDelete) return

    try {
      const response = await fetch(`/api/admin/blogs?id=${blogToDelete.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar el blog")
      toast.success("Artículo eliminado")
      fetchBlogs()
    } catch (error) {
      toast.error("Error al eliminar el artículo")
      console.error(error)
    }
  }

  const cancelEdit = () => {
    setForm(emptyForm())
    setEditingBlogId(null)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-r from-[#1F6B49] via-[#268656] to-[#2D9F6F] py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al blog
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white">{editingBlogId ? "Editar artículo" : "Gestión de blog"}</h1>
          <p className="text-white/90 mt-2">Contenido compatible con el blog estático de Waichatt</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="crear">
              <FileText className="w-4 h-4 mr-2" />
              {editingBlogId ? "Editar" : "Crear nuevo"}
            </TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar artículos</TabsTrigger>
          </TabsList>

          <TabsContent value="crear">
            {editingBlogId && (
              <div className="mb-4">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancelar edición
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista previa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Frontmatter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input id="title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input id="slug" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Resumen de 120–160 caracteres. Es la meta description que aparece en Google y en las redes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="publishDate">Fecha de publicación *</Label>
                        <Input
                          id="publishDate"
                          type="date"
                          value={form.publishDate}
                          onChange={(e) => updateForm("publishDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="updatedDate">Fecha de actualización</Label>
                        <Input
                          id="updatedDate"
                          type="date"
                          value={form.updatedDate}
                          onChange={(e) => updateForm("updatedDate", e.target.value)}
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <Checkbox
                          id="draft"
                          checked={form.draft}
                          onCheckedChange={(checked) => updateForm("draft", Boolean(checked))}
                        />
                        <Label htmlFor="draft">Borrador</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={form.tags}
                        onChange={(e) => updateForm("tags", e.target.value)}
                        placeholder="CRM inmobiliario, IA, WhatsApp"
                      />
                      <p className="text-sm text-muted-foreground">
                        Palabras clave separadas por coma. Al menos una para publicar.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="space-y-1">
                    <CardTitle>Contenido Markdown *</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      El cuerpo del artículo. Usá ## para los subtítulos: ayudan a Google y a las IAs a entender la
                      estructura. Apuntá a 600+ palabras para que el contenido posicione.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={form.body}
                      onChange={(e) => updateForm("body", e.target.value)}
                      rows={18}
                      className="font-mono"
                      placeholder="## Título de sección&#10;&#10;Contenido del artículo..."
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="space-y-1">
                    <CardTitle>Autor</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Quién firma el artículo (requerido para publicar). Elegí un founder: el contenido firmado por una
                      persona real mejora el E-E-A-T y suma para el SEO. "Personalizado" permite un autor invitado.
                    </p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Seleccionar founder</Label>
                      <Select value={selectedAuthor} onValueChange={selectAuthor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar autor" />
                        </SelectTrigger>
                        <SelectContent>
                          {blogAuthors.map((author) => (
                            <SelectItem key={author.name} value={author.name}>
                              {author.name} · {author.role}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input placeholder="Nombre" value={form.author.name} onChange={(e) => updateAuthor("name", e.target.value)} />
                    <Input placeholder="Rol" value={form.author.role} onChange={(e) => updateAuthor("role", e.target.value)} />
                    <Input placeholder="URL" value={form.author.url} onChange={(e) => updateAuthor("url", e.target.value)} />
                    <Input placeholder="Bio" value={form.author.bio} onChange={(e) => updateAuthor("bio", e.target.value)} />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle>FAQ</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Preguntas y respuestas sobre el tema. Se muestran al final del post y generan el schema FAQPage,
                        que Google y las IAs citan en sus respuestas. Recomendado: 3–5 preguntas con respuestas claras de
                        2–4 líneas. Si agregás una, completá pregunta y respuesta.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => updateForm("faqs", [...form.faqs, { tag: "", question: "", answer: "" }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.faqs.length === 0 && <p className="text-sm text-muted-foreground">Sin preguntas.</p>}
                    {form.faqs.map((faq, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 border rounded-lg p-4">
                        <div className="flex justify-between gap-3">
                          <Input placeholder="Tag" value={faq.tag} onChange={(e) => updateFaq(index, "tag", e.target.value)} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => updateForm("faqs", form.faqs.filter((_, faqIndex) => faqIndex !== index))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Pregunta"
                          value={faq.question}
                          onChange={(e) => updateFaq(index, "question", e.target.value)}
                        />
                        <Textarea
                          placeholder="Respuesta"
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle>HowTo (opcional)</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Úsalo solo si el artículo explica un proceso paso a paso. Genera el schema HowTo (Google lo
                        muestra como guía). Si el tema no es un procedimiento, dejalo vacío: un HowTo forzado perjudica
                        el SEO. Si le ponés nombre, cargá al menos un paso con título y descripción.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        updateForm("howTo", {
                          ...form.howTo,
                          steps: [...form.howTo.steps, { title: "", desc: "" }],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Paso
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Nombre del HowTo"
                      value={form.howTo.name}
                      onChange={(e) => updateForm("howTo", { ...form.howTo, name: e.target.value })}
                    />
                    {form.howTo.steps.map((step, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 border rounded-lg p-4">
                        <div className="flex justify-between gap-3">
                          <Input
                            placeholder="Título del paso"
                            value={step.title}
                            onChange={(e) => updateStep(index, "title", e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() =>
                              updateForm("howTo", {
                                ...form.howTo,
                                steps: form.howTo.steps.filter((_, stepIndex) => stepIndex !== index),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Descripción del paso"
                          value={step.desc}
                          onChange={(e) => updateStep(index, "desc", e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
                  <Button onClick={() => handleSubmit(true)} variant="outline" disabled={isSubmitting} className="rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar borrador
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-[#268656] hover:bg-[#1F6B49] rounded-xl"
                  >
                    {editingBlogId ? "Actualizar artículo" : "Publicar artículo"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <article className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto p-8 md:p-12">
                  <Badge variant={form.draft ? "secondary" : "default"}>{form.draft ? "Borrador" : "Publicado"}</Badge>
                  <h1 className="text-4xl font-bold mt-4 mb-4">{form.title || "Título del artículo"}</h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">{form.description}</p>
                  <div className="mt-8 whitespace-pre-wrap font-sans leading-7 text-muted-foreground">
                    {form.body || "Contenido Markdown"}
                  </div>
                  {form.faqs.length > 0 && (
                    <div className="mt-10 space-y-4">
                      <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
                      {form.faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{faq.question}</h3>
                          <p className="text-muted-foreground mt-2">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="gestionar">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Todos los artículos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-16 w-24 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : blogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay artículos.</p>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{blog.title}</h3>
                            <Badge variant={blog.draft ? "secondary" : "default"}>
                              {blog.draft ? "Borrador" : "Publicado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{blog.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Fecha: {new Date(blog.publishDate).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button onClick={() => handleEdit(blog)} variant="outline" size="sm">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => {
                              setBlogToDelete(blog)
                              setDeleteDialogOpen(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteBlogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blog={
          blogToDelete
            ? { id: blogToDelete.id, title: blogToDelete.title, status: blogToDelete.draft ? "draft" : "published" }
            : null
        }
        onDelete={handleDelete}
      />
    </div>
  )
}
