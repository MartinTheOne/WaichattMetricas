"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Video } from "lucide-react"

interface AddMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (url: string, size: "small" | "medium" | "large" | "full") => void
  type: "image" | "video"
}

export function AddMediaDialog({ open, onOpenChange, onAdd, type }: AddMediaDialogProps) {
  const [url, setUrl] = useState("")
  const [size, setSize] = useState<"small" | "medium" | "large" | "full">("large")

  const handleSubmit = () => {
    if (url.trim()) {
      onAdd(url.trim(), size)
      setUrl("")
      setSize("large")
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setUrl("")
    setSize("large")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "image" ? (
              <>
                <ImageIcon className="w-5 h-5 text-[#268656]" />
                Agregar Imagen
              </>
            ) : (
              <>
                <Video className="w-5 h-5 text-[#268656]" />
                Agregar Video
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === "image"
              ? "Ingresa la URL de la imagen y selecciona el tamaño de visualización."
              : "Ingresa la URL del video de YouTube y selecciona el tamaño de visualización."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="media-url">URL {type === "image" ? "de la imagen" : "del video"}</Label>
            <Input
              id="media-url"
              placeholder={type === "image" ? "https://ejemplo.com/imagen.jpg" : "https://www.youtube.com/watch?v=..."}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-size">Tamaño de visualización</Label>
            <Select value={size} onValueChange={(value: any) => setSize(value)}>
              <SelectTrigger id="media-size">
                <SelectValue placeholder="Selecciona un tamaño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeño (33%)</SelectItem>
                <SelectItem value="medium">Mediano (50%)</SelectItem>
                <SelectItem value="large">Grande (75%)</SelectItem>
                <SelectItem value="full">Completo (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {url && type === "image" && (
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={url || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!url.trim()} className="bg-[#268656] hover:bg-[#1F6B49]">
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
