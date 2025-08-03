import { obtenerFacturacion } from "@/lib/obtenerFacturacion";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    return Response.json({
        facturacion: await obtenerFacturacion()
    }, {
        status: 200,
    });
}