import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import getBilling from "@/lib/admin/getBilling";
import { getClients } from "@/lib/admin/getClients";
import { getPlansComplete } from "@/lib/admin/getplans";
import { NextResponse } from "next/server";


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }
    const [billing, clients, plans] = await Promise.all([
        getBilling(),
        getClients(),
        getPlansComplete()
    ]);
    return NextResponse.json({ billing, clients, plans }, { status: 200 });
}