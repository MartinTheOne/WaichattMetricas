import jsPDF from 'jspdf';
import { InvoiceData, CompanyData, ClientData } from '../types/IDownloadInvoice';


export const generateInvoicePDF = async (
  invoiceData: InvoiceData,
  clientData: ClientData,
  companyData: CompanyData = {
    nombre: 'WAICHATT',
    email: 'waichatt@gmail.com',
    telefono: '+5493816814079',
    direccion: 'San Miguel de Tucumán, Argentina'
  }
) => {
  const doc = new jsPDF();

  // Colores actualizados
  const primaryGreen = '#268656'; // Verde principal
  const textColor = '#374151';
  const grayColor = '#6b7280';

  // Crear el fondo verde superior más bajo
  doc.setFillColor(38, 134, 86); // Verde principal
  doc.rect(0, 0, 210, 50, 'F');

  // Crear curva inferior del header (simulada con rectángulos)
  doc.setFillColor(38, 134, 86);
  for (let i = 0; i < 210; i += 2) {
    const height = 8 * Math.sin((i / 210) * Math.PI);
    doc.rect(i, 45, 2, height, 'F');
  }

  // Logo y nombre de la empresa en el header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');

  // Simular logo con círculo
  doc.setFillColor(255, 255, 255);
  doc.circle(175, 20, 8, 'F');
  doc.setTextColor(38, 134, 86);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('W', 172, 23);

  // Nombre de la empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WAICHATT', 130, 35);

  // Secciones de datos del cliente y empresa
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  // DATOS DEL CLIENTE
  doc.text('DATOS DEL CLIENTE', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${clientData.nombre}`, 20, 85);
  doc.text(`Mail: ${clientData.email}`, 20, 95);

  // DATOS DE LA EMPRESA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DATOS DE LA EMPRESA', 120, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${companyData.nombre}`, 120, 85);
  doc.text(`Dirección: ${companyData.direccion}`, 120, 95);
  doc.text(`Mail: ${companyData.email}`, 120, 105);
  doc.text(`Teléfono: ${companyData.telefono}`, 120, 115);

  // Fecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Fecha: ${invoiceData.fecha}`, 20, 135);

  // Tabla de servicios
  const tableY = 155;
  const tableHeight = 20;

  // Header de la tabla
  doc.setFillColor(38, 134, 86);
  doc.rect(20, tableY, 170, tableHeight, 'F');

  // Columnas de la tabla (sin cantidad)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Concepto', 25, tableY + 12);
  doc.text('Precio', 120, tableY + 12);
  doc.text('Total', 160, tableY + 12);

  // Contenido de la tabla
  doc.setFillColor(255, 255, 255);
  doc.rect(20, tableY + tableHeight, 170, 30, 'F');

  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Servicio de Automatización WhatsApp con IA (${invoiceData.plan})`, 25, tableY + 32);
  doc.text(`$${invoiceData.monto}`, 120, tableY + 32);
  doc.text(`$${invoiceData.monto}`, 160, tableY + 32);

  // Líneas de la tabla
  doc.setDrawColor(200, 200, 200);
  doc.line(20, tableY + tableHeight, 190, tableY + tableHeight);
  doc.line(20, tableY + tableHeight + 30, 190, tableY + tableHeight + 30);
  doc.line(115, tableY, 115, tableY + tableHeight + 30);
  doc.line(155, tableY, 155, tableY + tableHeight + 30);

  // Información de pago
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Forma de pago: Transferencia', 20, 215);
  doc.text('Nota: El servicio tiene una validez de 30 días.', 20, 225);

  // Total final (sin impuestos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total', 120, 245);
  doc.text(`$${invoiceData.monto}`, 160, 245);

  // Línea para firma
  doc.setDrawColor(0, 0, 0);
  doc.line(120, 260, 180, 260);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Waichatt Support', 135, 267);

  // Fondo verde inferior con curva
  doc.setFillColor(38, 134, 86);
  for (let i = 0; i < 210; i += 2) {
    const height = 8 * Math.sin(((i + 105) / 210) * Math.PI);
    doc.rect(i, 275 - height, 2, height + 22, 'F');
  }

  // Generar y descargar el PDF
  const fileName = `Factura_${invoiceData.facturaId || invoiceData.id}_${invoiceData.fecha.replace(/\//g, '-')}_${clientData.nombre}.pdf`;
  doc.save(fileName);

  return fileName;
};

// Función auxiliar para usar con tus datos específicos
export const downloadInvoicePDF = (invoiceData: InvoiceData, clientData: ClientData) => {
  try {
    generateInvoicePDF(invoiceData, clientData);
    console.log('PDF generado exitosamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

// Ejemplo de uso con tus datos
export const handleDownloadExample = () => {
  const invoiceData: InvoiceData = {
    estado: "pagado",
    facturaId: 2,
    fecha: "2025/07/08",
    id: 2,
    monto: 60,
    plan: "Plan Básico"
  };

  const clientData: ClientData = {
    nombre: 'Cliente Ejemplo',
    email: 'cliente@ejemplo.com'
  };

  downloadInvoicePDF(invoiceData, clientData);
};

// Hook para usar en componentes React
export const useInvoicePDF = () => {
  const downloadPDF = (invoiceData: InvoiceData, clientData: ClientData) => {
    return generateInvoicePDF(invoiceData, clientData);
  };

  return { downloadPDF };
};