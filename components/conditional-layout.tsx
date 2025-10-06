"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Páginas que  necesitan sidebar
  const publicPages = ["/dashboard", "/pagos", "/admin/clientes", "/admin/ingresos", "/admin/dashboard","/admin/egresos","/admin/cuenta-bancaria"]
  const isPublicPage = publicPages.includes(pathname)

  // Si es una página pública o el usuario no está autenticado, mostrar sin sidebar
  if (!isPublicPage) {
    return <>{children}</>
  }

  // Si el usuario está autenticado y no es una página pública, mostrar con sidebar
  return (
    <SidebarProvider >
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
