import * as MailComposer from "expo-mail-composer";
import * as FileSystem from "expo-file-system/legacy";
import { Incident } from "../store/useIncidentStore";
import { flows } from "../data/flows";

export const exportIncidentToMail = async (
  incident: Incident,
  recipient?: string,
) => {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    alert("La aplicación de correo no está disponible en este dispositivo.");
    return;
  }

  const isSpectator = incident.responses["rol"] === "Soy un espectador";
  const body = formatIncidentBody(incident);
  const attachments = collectAttachments(incident);

  try {
    const report = await generateStructuredReport(incident);
    const reportJsonString = JSON.stringify(report, null, 2);
    const jsonPath = `${FileSystem.cacheDirectory}report_incidente_${incident.id}.json`;
    await FileSystem.writeAsStringAsync(jsonPath, reportJsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    attachments.push(jsonPath);
  } catch (error) {
    console.error(
      "Error generating and attaching structured report JSON:",
      error,
    );
  }

  const subject = isSpectator
    ? `REPORTE DE ACCIDENTE (TESTIGO) - KIAGO - ${new Date(incident.createdAt).toLocaleDateString()} - ID: ${incident.id.slice(0, 8)}`
    : `DENUNCIA DE SINIESTRO - KIAGO - ${new Date(incident.createdAt).toLocaleDateString()} - ID: ${incident.id.slice(0, 8)}`;

  await MailComposer.composeAsync({
    recipients: recipient ? [recipient] : [],
    subject: subject,
    body: body,
    isHtml: true,
    attachments: attachments,
  });
};

const formatIncidentBody = (incident: Incident) => {
  const isSpectator = incident.responses["rol"] === "Soy un espectador";
  const title = isSpectator
    ? "Reporte de Accidente (Testigo)"
    : "Denuncia de Siniestro Automotor";
  const flow = flows.find((f) => f.id === incident.flowId);

  let html = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
      <h1 style="color: #E11D48; border-bottom: 2px solid #E11D48; padding-bottom: 10px;">${title}</h1>
      <p>A continuación se detalla la información recopilada mediante la plataforma <strong>Kiago</strong> referente al siniestro ocurrido.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">Resumen del Hecho</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px 0; width: 40%;"><strong>Fecha y Hora:</strong></td><td>${new Date(incident.createdAt).toLocaleString()}</td></tr>
          ${Object.entries(incident.responses)
            .map(([key, value]) => {
              if (typeof value === "object" && value !== null) {
                const matchingStep = flow?.steps.find((s) => s.id === key);
                if (matchingStep && matchingStep.type === "checklist") {
                  let subRows = `<tr><td colspan="2" style="padding: 8px 0 4px 0; border-top: 1px solid #e2e8f0; font-weight: bold;">${matchingStep.text}</td></tr>`;
                  subRows += Object.entries(value)
                    .map(([itemId, itemValue]) => {
                      const checklistItem = matchingStep.checklistItems?.find(
                        (item) =>
                          typeof item !== "string" && item.id === itemId,
                      );
                      const label =
                        typeof checklistItem === "object" && checklistItem
                          ? checklistItem.label
                          : itemId;
                      const displayValue = Array.isArray(itemValue)
                        ? `${itemValue.length} fotos`
                        : String(itemValue).startsWith("file://")
                          ? "Foto capturada 📸"
                          : String(itemValue);
                      return `<tr><td style="padding: 3px 0 3px 15px; width: 40%; font-size: 14px; color: #475569;">• ${label}:</td><td style="font-size: 14px;">${displayValue}</td></tr>`;
                    })
                    .join("");
                  return subRows;
                }
                return "";
              }
              return `<tr><td style="padding: 5px 0; width: 40%;"><strong>${key.replace(/_/g, " ").toUpperCase()}:</strong></td><td>${String(value).startsWith("file://") ? "Foto capturada 📸" : value}</td></tr>`;
            })
            .join("")}
        </table>
      </div>
  `;

  if (!isSpectator && incident.involvedParties.length > 0) {
    html += `<h2 style="color: #1e293b;">Vehículos e Involucrados</h2>`;
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
            <tr><td style="padding: 2px 0;"><strong>Email:</strong></td><td>${party.email || "---"}</td></tr>
            <tr><td style="padding: 2px 0;"><strong>Vehículo / Patente:</strong></td><td><span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${party.plate && party.plate.startsWith("file://") ? "Foto capturada 📸" : party.plate || "---"}</span></td></tr>
            <tr><td style="padding: 2px 0;"><strong>Compañía Seguro:</strong></td><td>${party.insuranceCompany && party.insuranceCompany.startsWith("file://") ? "Foto capturada 📸" : party.insuranceCompany || "---"}</td></tr>
            <tr><td style="padding: 2px 0;"><strong>Nº de Póliza:</strong></td><td>${party.policyNumber && party.policyNumber.startsWith("file://") ? "Foto capturada 📸" : party.policyNumber || "---"}</td></tr>
            <tr><td style="padding: 2px 0;"><strong>Titular:</strong></td><td>${party.ownerName && party.ownerName.startsWith("file://") ? "Foto capturada 📸" : party.ownerName || "---"}</td></tr>
            ${party.missingDataReason ? `<tr><td style="padding: 2px 0; color: #b91c1c;"><strong>Obs. de Datos:</strong></td><td style="color: #b91c1c;">${party.missingDataReason}</td></tr>` : ""}
          </table>
        </div>
      `;
    });
  }

  html += `
      <div style="margin-top: 30px; padding: 15px; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #64748b;">
          <strong>Nota de Evidencia:</strong> Se han adjuntado a este correo las fotografías capturadas en el lugar.
        </p>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
          Generado automáticamente por Kiago App.
        </p>
      </div>
    </div>
  `;

  return html;
};

const findFileUris = (val: any): string[] => {
  const uris: string[] = [];
  if (typeof val === "string" && val.startsWith("file://")) {
    uris.push(val);
  } else if (Array.isArray(val)) {
    val.forEach((item) => uris.push(...findFileUris(item)));
  } else if (val && typeof val === "object") {
    Object.values(val).forEach((item) => uris.push(...findFileUris(item)));
  }
  return uris;
};

const collectAttachments = (incident: Incident) => {
  const photos: string[] = [];

  incident.involvedParties.forEach((party) => {
    // Scan all properties of the party object
    Object.values(party).forEach((val) => {
      if (typeof val === "string" && val.startsWith("file://")) {
        photos.push(val);
      }
    });

    // Scan photos nested object
    if (party.photos) {
      Object.values(party.photos).forEach((val) => {
        if (typeof val === "string" && val.startsWith("file://")) {
          photos.push(val);
        } else if (Array.isArray(val)) {
          val.forEach((item) => {
            if (typeof item === "string" && item.startsWith("file://")) {
              photos.push(item);
            }
          });
        }
      });
    }
  });

  Object.values(incident.responses).forEach((val) => {
    photos.push(...findFileUris(val));
  });

  return Array.from(
    new Set(photos.filter((uri) => uri && uri.startsWith("file://"))),
  );
};

const getFileBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = uri.split(".").pop()?.toLowerCase() || "jpeg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.error("Error reading file as base64:", uri, error);
    return null;
  }
};

export const generateStructuredReport = async (
  incident: Incident,
): Promise<any> => {
  const processValue = async (val: any): Promise<any> => {
    if (typeof val === "string" && val.startsWith("file://")) {
      const base64 = await getFileBase64(val);
      return { uri: val, base64 };
    }
    if (Array.isArray(val)) {
      return Promise.all(val.map(processValue));
    }
    if (val && typeof val === "object") {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        res[k] = await processValue(v);
      }
      return res;
    }
    return val;
  };

  const processedResponses = await processValue(incident.responses);
  const processedParties = await Promise.all(
    incident.involvedParties.map((party) => processValue(party)),
  );

  return {
    id: incident.id,
    flowId: incident.flowId,
    createdAt: incident.createdAt,
    responses: processedResponses,
    involvedParties: processedParties,
  };
};
