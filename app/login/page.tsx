"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2, Bot, BarChart3, CreditCard, Zap, Shield, Users } from "lucide-react"
import { useSession } from "next-auth/react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Mostrar loading mientras NextAuth se inicializa
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <MessageSquare className="h-6 w-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-green-700 font-medium">Waichatt</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, mostrar mensaje de redirección
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <MessageSquare className="h-6 w-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-green-700 font-medium">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales inválidas")
        setIsLoading(false)
      } else if (result?.ok) {
        // Esperar a que la sesión se actualice antes de redirigir
        const updatedSession = await getSession()
        if (updatedSession) {
          router.push("/admin/clientes")
        }
      }
    } catch (error) {
      setError("Error al iniciar sesión")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Bot className="absolute top-20 left-20 h-8 w-8 text-green-300/40 animate-pulse" />
        <BarChart3 className="absolute top-32 right-32 h-6 w-6 text-emerald-300/40 animate-pulse delay-1000" />
        <CreditCard className="absolute bottom-32 left-32 h-7 w-7 text-teal-300/40 animate-pulse delay-2000" />
        <Zap className="absolute bottom-20 right-20 h-5 w-5 text-green-400/40 animate-pulse delay-500" />
        <Users className="absolute top-1/2 left-10 h-6 w-6 text-emerald-400/40 animate-pulse delay-1500" />
        <Shield className="absolute top-1/2 right-10 h-6 w-6 text-teal-400/40 animate-pulse delay-700" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Main login card */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-green-500/10">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Waichatt
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2 text-base">
                Automatización de WhatsApp para empresas
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-3 px-4 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <Bot className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">IA Avanzada</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Estadísticas</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <CreditCard className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Pagos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
