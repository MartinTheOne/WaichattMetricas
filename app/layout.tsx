import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ConditionalLayout } from "@/components/conditional-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Waichatt - Automatización de WhatsApp",
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
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
