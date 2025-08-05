import { getClients } from "@/lib/admin/getClients";
import { getUsers } from "@/lib/admin/getUsers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).rol !== 'admin') {
        return new Response("Unauthorized", { status: 403 });
    }
    const [users, clients] = await Promise.all([
        getUsers(),
        getClients()
    ]);
    return Response.json({ users, clients });
}