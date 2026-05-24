import { File } from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Incident } from "../store/useIncidentStore";

const imageToBase64 = async (uri: string) => {
  try {
    if (!uri) return null;
    const base64 = await File.readAsStringAsync(uri, {
      encoding: "base64",
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

export const exportIncidentToPdf = async (incident: Incident) => {
  try {
    // Convert all photos to base64 for PDF embedding
    const partiesWithBase64 = await Promise.all(
      incident.involvedParties.map(async (party) => {
        const photos = { ...party.photos };
        const base64Photos: any = {};

        if (photos.dniFront)
          base64Photos.dniFront = await imageToBase64(photos.dniFront);
        if (photos.dniBack)
          base64Photos.dniBack = await imageToBase64(photos.dniBack);
        if (photos.licenseFront)
          base64Photos.licenseFront = await imageToBase64(photos.licenseFront);
        if (photos.licenseBack)
          base64Photos.licenseBack = await imageToBase64(photos.licenseBack);
        if (photos.plate)
          base64Photos.plate = await imageToBase64(photos.plate);
        if (photos.damage) {
          base64Photos.damage = await Promise.all(
            photos.damage.map((uri) => imageToBase64(uri)),
          );
        }

        return { ...party, base64Photos };
      }),
    );

    const html = formatIncidentBody(incident, partiesWithBase64);
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: "Guardar Reporte Kiago",
      });
    }
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};

export const exportIncidentToMail = async (
  incident: Incident,
  recipient?: string,
) => {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    alert("La aplicación de correo no está disponible en este dispositivo.");
    return;
  }

  try {
    // 1. Generate the PDF first to attach it
    const partiesWithBase64 = await Promise.all(
      incident.involvedParties.map(async (party) => {
        const photos = { ...party.photos };
        const base64Photos: any = {};
        if (photos.dniFront)
          base64Photos.dniFront = await imageToBase64(photos.dniFront);
        if (photos.dniBack)
          base64Photos.dniBack = await imageToBase64(photos.dniBack);
        if (photos.licenseFront)
          base64Photos.licenseFront = await imageToBase64(photos.licenseFront);
        if (photos.licenseBack)
          base64Photos.licenseBack = await imageToBase64(photos.licenseBack);
        if (photos.plate)
          base64Photos.plate = await imageToBase64(photos.plate);
        if (photos.damage) {
          base64Photos.damage = await Promise.all(
            photos.damage.map((uri) => imageToBase64(uri)),
          );
        }
        return { ...party, base64Photos };
      }),
    );

    const html = formatIncidentBody(incident, partiesWithBase64);
    const { uri: pdfUri } = await Print.printToFileAsync({ html });

    // 2. Collect all individual images + the PDF
    const attachments = collectAttachments(incident);
    attachments.push(pdfUri);

    // 3. Simple professional email body
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #E11D48;">Reporte de Siniestro - Kiago</h2>
        <p>Se adjunta el <strong>informe PDF</strong> con todos los datos pertinentes del siniestro, junto con las fotografías originales capturadas en el lugar.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">ID del Reporte: ${incident.id.toUpperCase()}<br>Fecha: ${new Date(incident.createdAt).toLocaleString()}</p>
      </div>
    `;

    await MailComposer.composeAsync({
      recipients: recipient ? [recipient] : [],
      subject: `DENUNCIA DE SINIESTRO - KIAGO - ${new Date(incident.createdAt).toLocaleDateString()} - ID: ${incident.id.slice(0, 8)}`,
      body: emailHtml,
      isHtml: true,
      attachments: attachments,
    });
  } catch (error) {
    console.error("Full Export Error:", error);
    alert("Ocurrió un error al preparar el envío completo.");
  }
};

const formatIncidentBody = (incident: Incident, partiesWithImages?: any[]) => {
  const accentColor = "#E11D48";
  const grayColor = "#64748b";

  let html = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white;">
      <div style="background-color: ${accentColor}; padding: 30px; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">DENUNCIA DE SINIESTRO</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Generado por Kiago App • ID: ${incident.id.toUpperCase()}</p>
      </div>

      <div style="padding: 30px;">
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 18px; color: ${accentColor}; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;">Resumen del Incidente</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; color: ${grayColor}; font-size: 13px; font-weight: bold; width: 35%;">FECHA Y HORA</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; font-weight: 600;">${new Date(incident.createdAt).toLocaleString()}</td>
            </tr>
            ${Object.entries(incident.responses)
              .map(([key, value]) => {
                if (typeof value === "object" || !value) return "";
                return `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; color: ${grayColor}; font-size: 13px; font-weight: bold;">${key.replace(/_/g, " ").toUpperCase()}</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; font-weight: 600;">${value}</td>
                  </tr>
                `;
              })
              .join("")}
          </table>
        </div>

        <h2 style="font-size: 18px; color: ${accentColor}; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 20px;">Partes Involucradas</h2>
  `;

  const partiesToRender = partiesWithImages || incident.involvedParties;

  partiesToRender.forEach((party: any, index: number) => {
    const isMe = index === 0 && incident.flowId === "crash-report";
    const partyColor = isMe ? "#2563eb" : "#dc2626";

    html += `
      <div style="background-color: #f8fafc; border-left: 4px solid ${partyColor}; border-radius: 6px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 15px 0; color: ${partyColor}; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          ${isMe ? "Parte Asegurada (Titular)" : `Tercero Involucrado #${index}`}
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold; width: 35%;">CONDUCTOR</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.name || "---"} ${party.surname || ""}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">DNI / ID</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.dni || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">TELÉFONO</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.phone || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">VEHÍCULO / PATENTE</td>
            <td style="padding: 6px 0; font-size: 14px;"><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 13px;">${party.plate || "---"}</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">ASEGURADORA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.insuranceCompany || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">Nº PÓLIZA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.policyNumber || "---"}</td>
          </tr>
        </table>

        ${
          party.base64Photos
            ? `
          <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
            <p style="width: 100%; margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: ${grayColor};">DOCUMENTACIÓN Y VEHÍCULO</p>
            ${party.base64Photos.dniFront ? `<img src="${party.base64Photos.dniFront}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}
            ${party.base64Photos.dniBack ? `<img src="${party.base64Photos.dniBack}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}
            ${party.base64Photos.licenseFront ? `<img src="${party.base64Photos.licenseFront}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}
            ${party.base64Photos.licenseBack ? `<img src="${party.base64Photos.licenseBack}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}
            ${party.base64Photos.plate ? `<img src="${party.base64Photos.plate}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}
            
            ${
              party.base64Photos.damage?.length > 0
                ? `
              <p style="width: 100%; margin: 15px 0 10px 0; font-size: 11px; font-weight: bold; color: ${grayColor};">DAÑOS Y EVIDENCIA</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${party.base64Photos.damage
                  .filter(Boolean)
                  .map(
                    (src: string) =>
                      `<img src="${src}" style="width: 140px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;" />`,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>
        `
            : ""
        }
      </div>
    `;
  });

  html += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #f1f5f9;">
          <p style="margin-top: 10px; text-align: center; font-size: 12px; color: ${grayColor};">
            Este informe fue generado de forma segura desde la aplicación móvil <strong>Kiago</strong>.
          </p>
        </div>
      </div>
    </div>
  `;

  return html;
};

const collectAttachments = (incident: Incident) => {
  const photos: string[] = [];

  incident.involvedParties.forEach((party) => {
    if (party.photos.dniFront) photos.push(party.photos.dniFront);
    if (party.photos.dniBack) photos.push(party.photos.dniBack);
    if (party.photos.licenseFront) photos.push(party.photos.licenseFront);
    if (party.photos.licenseBack) photos.push(party.photos.licenseBack);
    if (party.photos.plate) photos.push(party.photos.plate);
    if (party.photos.damage) {
      party.photos.damage.forEach((uri) => photos.push(uri));
    }
  });

  return photos.filter((uri) => uri && uri.startsWith("file://"));
};
