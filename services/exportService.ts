import * as MailComposer from "expo-mail-composer";
import { Incident } from "../store/useIncidentStore";

export const exportIncidentToMail = async (
  incident: Incident,
  recipient?: string,
) => {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    alert("La aplicación de correo no está disponible en este dispositivo.");
    return;
  }

  const body = formatIncidentBody(incident);
  const attachments = collectAttachments(incident);

  await MailComposer.composeAsync({
    recipients: recipient ? [recipient] : [],
    subject: `DENUNCIA DE SINIESTRO - KIAGO - ${new Date(incident.createdAt).toLocaleDateString()} - ID: ${incident.id.slice(0, 8)}`,
    body: body,
    isHtml: true,
    attachments: attachments,
  });
};

const formatIncidentBody = (incident: Incident) => {
  let html = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
      <h1 style="color: #E11D48; border-bottom: 2px solid #E11D48; padding-bottom: 10px;">Denuncia de Siniestro Automotor</h1>
      <p>A continuación se detalla la información recopilada mediante la plataforma <strong>Kiago</strong> referente al siniestro ocurrido.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">Resumen del Hecho</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px 0;"><strong>Fecha y Hora:</strong></td><td>${new Date(incident.createdAt).toLocaleString()}</td></tr>
          ${Object.entries(incident.responses)
            .map(([key, value]) => {
              if (typeof value === "object") return "";
              return `<tr><td style="padding: 5px 0; width: 40%;"><strong>${key.replace(/_/g, " ").toUpperCase()}:</strong></td><td>${value}</td></tr>`;
            })
            .join("")}
        </table>
      </div>

      <h2 style="color: #1e293b;">Vehículos e Involucrados</h2>
  `;

  incident.involvedParties.forEach((party, index) => {
    const isMe = index === 0 && incident.flowId === "crash-report"; // Asumimos que el primero es el usuario
    html += `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h3 style="margin-top: 0; color: ${isMe ? "#2563eb" : "#dc2626"};">
          ${isMe ? "PARTE ASEGURADA (YO)" : `TERCERO INVOLUCRADO #${index}`}
        </h3>
        <table style="width: 100%;">
          <tr><td style="padding: 2px 0; width: 40%;"><strong>Conductor:</strong></td><td>${party.name || "---"} ${party.surname || ""}</td></tr>
          <tr><td style="padding: 2px 0;"><strong>DNI:</strong></td><td>${party.dni || "---"}</td></tr>
          <tr><td style="padding: 2px 0;"><strong>Teléfono:</strong></td><td>${party.phone || "---"}</td></tr>
          <tr><td style="padding: 2px 0;"><strong>Vehículo / Patente:</strong></td><td><span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${party.plate || "---"}</span></td></tr>
          <tr><td style="padding: 2px 0;"><strong>Compañía Seguro:</strong></td><td>${party.insuranceCompany || "---"}</td></tr>
          <tr><td style="padding: 2px 0;"><strong>Nº de Póliza:</strong></td><td>${party.policyNumber || "---"}</td></tr>
          ${party.missingDataReason ? `<tr><td style="padding: 2px 0; color: #b91c1c;"><strong>Obs. de Datos:</strong></td><td style="color: #b91c1c;">${party.missingDataReason}</td></tr>` : ""}
        </table>
      </div>
    `;
  });

  html += `
      <div style="margin-top: 30px; padding: 15px; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #64748b;">
          <strong>Nota de Evidencia:</strong> Se han adjuntado a este correo las fotografías capturadas en el lugar (DNI, Licencia de conducir y evidencia de daños materiales).
        </p>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
          Generado automáticamente por Kiago App.
        </p>
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
