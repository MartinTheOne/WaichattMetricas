import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware adicional si es necesario
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

// Actualizar el middleware para proteger todas las rutas excepto login

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)"],
}
