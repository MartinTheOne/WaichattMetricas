import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface PaymentLoadingDialogProps {
  isOpen: boolean
  onClose: () => void
  status: 'loading' | 'success' | 'error' | null
}

export function PaymentLoadingDialog({ isOpen, onClose, status }: PaymentLoadingDialogProps) {
  const [autoClose, setAutoClose] = useState(false)

  useEffect(() => {
    if (status === 'success' && !autoClose) {
      setAutoClose(true)
      const timer = setTimeout(() => {
        onClose()
        setAutoClose(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, onClose, autoClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === 'loading' && 'Generando Pago'}
            {status === 'success' && 'Pago Generado'}
            {status === 'error' && 'Error al Generar Pago'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground text-center">
                Procesando el pago, por favor espere...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600 animate-in zoom-in duration-300" />
              <p className="text-sm font-medium text-center">
                El pago se ha generado correctamente
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 animate-in zoom-in duration-300" />
              <p className="text-sm font-medium text-center text-red-600">
                No se pudo generar el pago
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Por favor, intente nuevamente
              </p>
              <Button onClick={onClose} variant="outline" className="mt-4">
                Cerrar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}