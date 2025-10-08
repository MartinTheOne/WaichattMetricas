"use client"

import { MessageSquare, User, BarChart3, CreditCard, LogOut, Pen, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { memo } from "react"

const itemsUser = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Pagos",
    url: "/pagos",
    icon: CreditCard,
  },
]

const itemsAdmin = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Clientes",
    url: "/admin/clientes",
    icon: User,
  },
  {
    title: "Ingresos",
    url: "/admin/ingresos",
    icon: ArrowDownCircle,
  },
  {
    title: "Egresos",
    url: "/admin/egresos",
    icon: ArrowUpCircle,
  },
  {
    title: "Cuenta Bancaria",
    url: "/admin/cuenta-bancaria",
    icon: Wallet,
  },
  {
    title: "Crear Blogs",
    url: "/admin/crear-blog",
    icon: Pen,
  },
]

// Componente Skeleton
const SidebarSkeleton = () => {
  return (
    <Sidebar className="border-r bg-white">
      <VisuallyHidden.Root>
        <h2>Menú de navegación de Waichatt</h2>
      </VisuallyHidden.Root>

      <SidebarHeader className="bg-white border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="bg-gray-200 p-2 rounded-lg animate-pulse">
            <div className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-32" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold text-gray-700 px-4 py-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {[1, 2, 3, 4].map((item) => (
                <SidebarMenuItem key={item}>
                  <div className="flex items-center gap-3 py-3 px-4 mx-2 my-1">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse flex-1" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t p-4">
        <div className="w-full py-3 px-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 bg-gray-200 rounded animate-pulse flex-1" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

// Memoizar el componente para evitar re-renders innecesarios
export const AppSidebar = memo(function AppSidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleItemClick = () => {
    // Cierra el sidebar solo en vista móvil
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Mostrar skeleton mientras carga
  if (status === "loading") {
    return <SidebarSkeleton />
  }

  const isAdmin = (session?.user as any)?.rol == "admin"
  const items = isAdmin ? itemsAdmin : itemsUser

  return (
    <Sidebar className="border-r bg-white">
      {/* Título oculto para accesibilidad */}
      <VisuallyHidden.Root>
        <h2>Menú de navegación de Waichatt</h2>
      </VisuallyHidden.Root>

      <SidebarHeader className="bg-white border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="bg-primary p-2 rounded-lg shadow-sm">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Waichatt</h2>
            <p className="text-sm text-gray-600">WhatsApp Automation</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold text-gray-700 px-4 py-2">Navegación</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-base py-3 px-4 mx-2 my-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:shadow-sm"
                  >
                    <Link href={item.url} className="flex items-center gap-3" onClick={handleItemClick}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-base py-3 px-4 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          onClick={() => {
            signOut({ callbackUrl: "/login" })
            // También cerrar el sidebar al hacer logout en móvil
            if (isMobile) {
              setOpenMobile(false)
            }
          }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
})