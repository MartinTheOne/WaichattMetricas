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
import { Loader2 } from "lucide-react"

interface DeleteBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blog: {
    id: number
    title: string
    status: string
  } | null
  onDelete: () => void
}

export function DeleteBlogDialog({ open, onOpenChange, blog, onDelete }: DeleteBlogDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
    setIsDeleting(false)
    onOpenChange(false)
  }

  if (!blog) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar artículo?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El artículo será eliminado permanentemente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Título:</span>
              <span className="font-medium">{blog.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-medium capitalize">{blog.status === "published" ? "Publicado" : "Borrador"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
