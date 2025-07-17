"use client"

import { MessageSquare, BarChart3, CreditCard, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

const items = [
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

export function AppSidebar() {
  const pathname = usePathname()

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
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
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
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
