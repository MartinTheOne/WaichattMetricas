"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Eye, Save, ArrowLeft, ImageIcon, Video, Pencil, FileText } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddMediaDialog } from "@/components/admin/crear-blog/add-media-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteBlogDialog } from "@/components/admin/crear-blog/delete-blog-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface MediaItem {
  url: string
  size: "small" | "medium" | "large" | "full"
}

interface Section {
  id: string
  title: string
  subtitle: string
  description: string
  images: MediaItem[]
  videos: MediaItem[]
}

interface BlogForm {
  slug: string
  title: string
  subtitle: string
  description: string
  main_image: string
  sections: Section[]
  status: string
  recommendations: number[]
}

export default function CrearBlogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mainTab, setMainTab] = useState("crear")
  const [activeTab, setActiveTab] = useState("editor")
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null)
  const [availableBlogs, setAvailableBlogs] = useState<any[]>([])
  const [allBlogs, setAllBlogs] = useState<any[]>([])
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<any>(null)
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null)
  const [form, setForm] = useState<BlogForm>({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    main_image: "",
    sections: [],
    status: "draft",
    recommendations: [],
  })

  useEffect(() => {
    fetchAllBlogs()
  }, [])

  const fetchAllBlogs = async () => {
    setIsLoadingBlogs(true)
    try {
      const response = await fetch("/api/admin/blogs")
      const data = await response.json()
      setAllBlogs(data.blogs || [])
      setAvailableBlogs(data.blogs.filter((blog: any) => blog.status === "published"))
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast.error("Error al cargar los artículos")
    } finally {
      setIsLoadingBlogs(false)
    }
  }

  const updateForm = (field: keyof BlogForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addSection = () => {
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      title: "",
      subtitle: "",
      description: "",
      images: [],
      videos: [],
    }
    updateForm("sections", [...form.sections, newSection])
  }

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updatedSections = [...form.sections]
    updatedSections[index] = { ...updatedSections[index], [field]: value }
    updateForm("sections", updatedSections)
  }

  const removeSection = (index: number) => {
    updateForm(
      "sections",
      form.sections.filter((_, i) => i !== index),
    )
  }

  const openImageDialog = (index: number) => {
    setCurrentSectionIndex(index)
    setImageDialogOpen(true)
  }

  const handleAddImage = (url: string, size: "small" | "medium" | "large" | "full") => {
    if (currentSectionIndex !== null) {
      const updatedSections = [...form.sections]
      updatedSections[currentSectionIndex].images.push({ url, size })
      updateForm("sections", updatedSections)
    }
  }

  const openVideoDialog = (index: number) => {
    setCurrentSectionIndex(index)
    setVideoDialogOpen(true)
  }

  const handleAddVideo = (url: string, size: "small" | "medium" | "large" | "full") => {
    if (currentSectionIndex !== null) {
      const updatedSections = [...form.sections]
      updatedSections[currentSectionIndex].videos.push({ url, size })
      updateForm("sections", updatedSections)
    }
  }

  const updateImageSize = (sectionIndex: number, imageIndex: number, size: "small" | "medium" | "large" | "full") => {
    const updatedSections = [...form.sections]
    updatedSections[sectionIndex].images[imageIndex].size = size
    updateForm("sections", updatedSections)
  }

  const removeImageFromSection = (sectionIndex: number, imageIndex: number) => {
    const updatedSections = [...form.sections]
    updatedSections[sectionIndex].images = updatedSections[sectionIndex].images.filter((_, i) => i !== imageIndex)
    updateForm("sections", updatedSections)
  }

  const updateVideoSize = (sectionIndex: number, videoIndex: number, size: "small" | "medium" | "large" | "full") => {
    const updatedSections = [...form.sections]
    updatedSections[sectionIndex].videos[videoIndex].size = size
    updateForm("sections", updatedSections)
  }

  const removeVideoFromSection = (sectionIndex: number, videoIndex: number) => {
    const updatedSections = [...form.sections]
    updatedSections[sectionIndex].videos = updatedSections[sectionIndex].videos.filter((_, i) => i !== videoIndex)
    updateForm("sections", updatedSections)
  }

  const handleSubmit = async (status: string) => {
    if (!form.title || !form.slug) {
      toast.error("El título y el slug son obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      const method = editingBlogId ? "PUT" : "POST"
      const body = editingBlogId ? { ...form, status, id: editingBlogId } : { ...form, status }

      const response = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error("Error al guardar el blog")

      toast.success(
        editingBlogId
          ? "Blog actualizado exitosamente"
          : status === "published"
            ? "Blog publicado exitosamente"
            : "Blog guardado como borrador",
      )

      // Reset form and refresh blogs list
      setForm({
        slug: "",
        title: "",
        subtitle: "",
        description: "",
        main_image: "",
        sections: [],
        status: "draft",
        recommendations: [],
      })
      setEditingBlogId(null)
      fetchAllBlogs()
      setMainTab("gestionar")
    } catch (error) {
      toast.error("Error al guardar el blog")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (blog: any) => {
    setForm({
      slug: blog.slug,
      title: blog.title,
      subtitle: blog.subtitle || "",
      description: blog.description || "",
      main_image: blog.main_image || "",
      sections: blog.sections || [],
      status: blog.status,
      recommendations: blog.recommendations || [],
    })
    setEditingBlogId(blog.id)
    setMainTab("crear")
    setActiveTab("editor")
    toast.info("Editando artículo: " + blog.title)
  }

  const handleDelete = async () => {
    if (!blogToDelete) return

    try {
      const response = await fetch(`/api/admin/blogs?id=${blogToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar el blog")

      toast.success("Artículo eliminado exitosamente")
      fetchAllBlogs()
    } catch (error) {
      toast.error("Error al eliminar el artículo")
      console.error(error)
    }
  }

  const handleCancelEdit = () => {
    setForm({
      slug: "",
      title: "",
      subtitle: "",
      description: "",
      main_image: "",
      sections: [],
      status: "draft",
      recommendations: [],
    })
    setEditingBlogId(null)
    toast.info("Edición cancelada")
  }

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "max-w-sm"
      case "medium":
        return "max-w-2xl"
      case "large":
        return "max-w-4xl"
      case "full":
        return "max-w-full"
      default:
        return "max-w-4xl"
    }
  }

  const toggleRecommendation = (blogId: number) => {
    setForm((prev) => ({
      ...prev,
      recommendations: prev.recommendations.includes(blogId)
        ? prev.recommendations.filter((id) => id !== blogId)
        : [...prev.recommendations, blogId],
    }))
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
          <h1 className="text-4xl font-bold text-white">{editingBlogId ? "Editar Artículo" : "Gestión de Blog"}</h1>
          <p className="text-white/90 mt-2">
            {editingBlogId ? "Actualiza tu artículo" : "Crea, edita y gestiona tus artículos"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="crear">
              <FileText className="w-4 h-4 mr-2" />
              {editingBlogId ? "Editar" : "Crear Nuevo"}
            </TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar Artículos</TabsTrigger>
          </TabsList>

          <TabsContent value="crear">
            {editingBlogId && (
              <div className="mb-4">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar edición
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => updateForm("title", e.target.value)}
                          placeholder="Título del artículo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL) *</Label>
                        <Input
                          id="slug"
                          value={form.slug}
                          onChange={(e) => updateForm("slug", e.target.value)}
                          placeholder="guia-turboscribe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        value={form.subtitle}
                        onChange={(e) => updateForm("subtitle", e.target.value)}
                        placeholder="Breve descripción del artículo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        placeholder="Descripción completa del artículo"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="main_image">Imagen Principal (URL)</Label>
                      <Input
                        id="main_image"
                        value={form.main_image}
                        onChange={(e) => updateForm("main_image", e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Secciones del Artículo</CardTitle>
                    <Button onClick={addSection} size="sm" className="bg-[#268656] hover:bg-[#1F6B49]">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Sección
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.sections.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay secciones. Haz clic en "Agregar Sección" para comenzar.
                      </p>
                    ) : (
                      form.sections.map((section, index) => (
                        <Card key={section.id} className="border-2">
                          <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-lg">Sección {index + 1}</CardTitle>
                            <Button
                              onClick={() => removeSection(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Título</Label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(index, "title", e.target.value)}
                                placeholder="Título de la sección"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Subtítulo</Label>
                              <Input
                                value={section.subtitle}
                                onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                                placeholder="Subtítulo (opcional)"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Descripción</Label>
                              <Textarea
                                value={section.description}
                                onChange={(e) => updateSection(index, "description", e.target.value)}
                                placeholder="Contenido de la sección"
                                rows={4}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Imágenes</Label>
                                <Button
                                  onClick={() => openImageDialog(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-[#268656]"
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Agregar Imagen
                                </Button>
                              </div>
                              {section.images.length > 0 && (
                                <div className="space-y-3">
                                  {section.images.map((img, imgIndex) => (
                                    <div key={imgIndex} className="flex items-center gap-2 p-3 border rounded-lg">
                                      <div className="flex-1 space-y-2">
                                        <Input value={img.url} readOnly className="text-sm" />
                                        <Select
                                          value={img.size}
                                          onValueChange={(value: any) => updateImageSize(index, imgIndex, value)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tamaño" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="small">Pequeño (33%)</SelectItem>
                                            <SelectItem value="medium">Mediano (50%)</SelectItem>
                                            <SelectItem value="large">Grande (75%)</SelectItem>
                                            <SelectItem value="full">Completo (100%)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        onClick={() => removeImageFromSection(index, imgIndex)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Videos</Label>
                                <Button
                                  onClick={() => openVideoDialog(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-[#268656]"
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Agregar Video
                                </Button>
                              </div>
                              {section.videos.length > 0 && (
                                <div className="space-y-3">
                                  {section.videos.map((vid, vidIndex) => (
                                    <div key={vidIndex} className="flex items-center gap-2 p-3 border rounded-lg">
                                      <div className="flex-1 space-y-2">
                                        <Input value={vid.url} readOnly className="text-sm" />
                                        <Select
                                          value={vid.size}
                                          onValueChange={(value: any) => updateVideoSize(index, vidIndex, value)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tamaño" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="small">Pequeño (33%)</SelectItem>
                                            <SelectItem value="medium">Mediano (50%)</SelectItem>
                                            <SelectItem value="large">Grande (75%)</SelectItem>
                                            <SelectItem value="full">Completo (100%)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        onClick={() => removeVideoFromSection(index, vidIndex)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Artículos Recomendados</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Selecciona hasta 3 artículos relacionados para mostrar al final
                    </p>
                  </CardHeader>
                  <CardContent>
                    {availableBlogs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No hay artículos publicados disponibles para recomendar
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {availableBlogs
                          .filter((blog) => blog.id !== editingBlogId)
                          .map((blog) => (
                            <div
                              key={blog.id}
                              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`blog-${blog.id}`}
                                checked={form.recommendations.includes(blog.id)}
                                onCheckedChange={() => toggleRecommendation(blog.id)}
                                disabled={!form.recommendations.includes(blog.id) && form.recommendations.length >= 3}
                              />
                              <label htmlFor={`blog-${blog.id}`} className="flex-1 cursor-pointer">
                                <div className="font-medium">{blog.title}</div>
                                {blog.subtitle && <div className="text-sm text-muted-foreground">{blog.subtitle}</div>}
                              </label>
                            </div>
                          ))}
                      </div>
                    )}
                    {form.recommendations.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {form.recommendations.length} de 3 artículos seleccionados
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
                  <Button
                    onClick={() => handleSubmit("draft")}
                    variant="outline"
                    disabled={isSubmitting}
                    className="rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Borrador
                  </Button>
                  <Button
                    onClick={() => handleSubmit("published")}
                    disabled={isSubmitting}
                    className="bg-[#268656] hover:bg-[#1F6B49] rounded-xl"
                  >
                    {editingBlogId ? "Actualizar Artículo" : "Publicar Artículo"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-br from-[#1F6B49] via-[#268656] to-[#2D9F6F] py-16 px-6">
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                        {form.title || "Título del artículo"}
                      </h1>
                      {form.subtitle && <p className="text-xl text-white/90 mb-6 text-pretty">{form.subtitle}</p>}
                    </div>
                  </div>

                  {form.main_image && (
                    <div className="max-w-5xl mx-auto px-6 -mt-12">
                      <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        <img
                          src={form.main_image || "/placeholder.svg"}
                          alt={form.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-w-4xl mx-auto px-6 py-16">
                    {form.description && (
                      <p className="text-xl text-muted-foreground leading-relaxed mb-12 text-pretty">
                        {form.description}
                      </p>
                    )}

                    <div className="space-y-16">
                      {form.sections.map((section, index) => (
                        <div key={section.id} className="space-y-6">
                          {section.title && <h2 className="text-3xl font-bold text-balance">{section.title}</h2>}
                          {section.subtitle && (
                            <h3 className="text-2xl font-semibold text-balance">{section.subtitle}</h3>
                          )}
                          {section.description && (
                            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                              {section.description}
                            </p>
                          )}

                          {section.images.length > 0 && (
                            <div className="flex flex-col items-center gap-6 my-8">
                              {section.images.map((image, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className={`rounded-xl overflow-hidden border shadow-md w-full ${getSizeClass(image.size)}`}
                                >
                                  <img
                                    src={image.url || "/placeholder.svg"}
                                    alt={`Imagen ${imgIndex + 1}`}
                                    className="w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {section.videos.length > 0 && (
                            <div className="flex flex-col items-center gap-6 my-8">
                              {section.videos.map((video, vidIndex) => (
                                <div
                                  key={vidIndex}
                                  className={`aspect-video rounded-xl overflow-hidden border shadow-md w-full ${getSizeClass(video.size)}`}
                                >
                                  <iframe
                                    src={video.url.replace("watch?v=", "embed/")}
                                    title={`Video ${vidIndex + 1}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {index < form.sections.length - 1 && <hr className="border-border my-12" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="gestionar">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Todos los Artículos</CardTitle>
                <p className="text-sm text-muted-foreground">Gestiona tus artículos publicados y borradores</p>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-20 w-32 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                      </div>
                    ))}
                  </div>
                ) : allBlogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay artículos. Crea tu primer artículo en la pestaña "Crear Nuevo".
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allBlogs.map((blog) => (
                      <div
                        key={blog.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {blog.main_image && (
                          <img
                            src={blog.main_image || "/placeholder.svg"}
                            alt={blog.title}
                            className="w-32 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{blog.title}</h3>
                            <Badge variant={blog.status === "published" ? "default" : "secondary"} className="shrink-0">
                              {blog.status === "published" ? "Publicado" : "Borrador"}
                            </Badge>
                          </div>
                          {blog.subtitle && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{blog.subtitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Creado: {new Date(blog.created_at).toLocaleDateString("es-ES")}
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

      <AddMediaDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen} onAdd={handleAddImage} type="image" />
      <AddMediaDialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen} onAdd={handleAddVideo} type="video" />
      <DeleteBlogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blog={blogToDelete}
        onDelete={handleDelete}
      />
    </div>
  )
}
