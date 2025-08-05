"use client"

import { useSession } from "next-auth/react"

export function ProtectedRouteAdmin({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

     if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        )
    }

    if (!session || (session.user as any).rol !== 'admin') {
        return <div className="flex item-center justify-center h-screen gap-3"> <h1 className="text-red-500">Acceso Denegado</h1><p>No tienes permisos para acceder a esta página.</p></div>
    }
    
    return <>{children}</>
}