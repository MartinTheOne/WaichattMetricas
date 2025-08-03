"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"
import { useEffect,useState } from "react"

export default function NotFound() {
   const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    if (segundos === 0) {
      window.location.href = "/";
      return;
    }

    const intervalo = setInterval(() => {
      setSegundos((prevSegundos) => prevSegundos - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [segundos]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-xl">Página no encontrada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">La página que buscas no existe o ha sido movida.</p>
          <p className="text-muted-foreground">Seras redirigido en {segundos} segundos.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
