import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ConditionalLayout } from "@/components/conditional-layout"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Waichatt Metricas",
  description: "Plataforma de automatización de WhatsApp para empresas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
            <Toaster richColors duration={3000} position="top-right" />
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
