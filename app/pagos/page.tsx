import PagosPage from "./pagos";
import { IFacturacion } from "@/types/IFacturacion";
import { obtenerFacturacion } from "@/lib/obtenerFacturacion";

export default async function Pagos() {
  const payments: IFacturacion[] = [];
  const data = await obtenerFacturacion();

  return (
    <PagosPage payments={data} />
  );
}