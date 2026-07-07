import { File } from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getFlowTitle } from "../data/flows";
import { ChecklistItem, Step } from "../engine/types";
import { Incident } from "../store/useIncidentStore";
import { useSettingsStore } from "../store/useSettingsStore";

// Título del reporte según el tipo de flujo (el choque conserva su nombre formal).
const getReportTitle = (flowId: string): string =>
  flowId === "choque"
    ? "DENUNCIA DE SINIESTRO"
    : `REPORTE — ${getFlowTitle(flowId).toUpperCase()}`;

const imageToBase64 = async (uri: string) => {
  try {
    if (!uri) return null;
    // API moderna de expo-file-system (SDK 54): la clase File expone base64().
    // El viejo File.readAsStringAsync no existe y hacía fallar silenciosamente
    // la incrustación de fotos en el PDF (ver FABLE_BRIEF.md §7.4).
    const base64 = await new File(uri).base64();
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

// Convierte a base64 TODAS las imágenes del incidente: las de cada involucrado
// (DNI, licencia, patente, seguro, daños) y las sueltas en responses
// (ej: fotos de la escena), para incrustarlas en el PDF.
const prepareIncidentImages = async (incident: Incident) => {
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
      if (photos.plate) base64Photos.plate = await imageToBase64(photos.plate);
      if (photos.insurance)
        base64Photos.insurance = await imageToBase64(photos.insurance);
      if (photos.damage) {
        base64Photos.damage = await Promise.all(
          photos.damage.map((uri) => imageToBase64(uri)),
        );
      }

      return { ...party, base64Photos };
    }),
  );

  const sceneImages: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(incident.responses)) {
    if (Array.isArray(value)) {
      const uris = value.filter(
        (v): v is string => typeof v === "string" && v.startsWith("file://"),
      );
      if (uris.length > 0) {
        const converted = await Promise.all(uris.map(imageToBase64));
        sceneImages[key] = converted.filter(Boolean) as string[];
      }
    }
  }

  return { partiesWithBase64, sceneImages };
};

// Genera un PDF compartible con el contenido informativo de un step
// (derechos, marcos legales, guías) para guardarlo o reenviarlo.
export const exportGuideToPdf = async (step: Step) => {
  try {
    const accentColor = "#E11D48";
    const grayColor = "#64748b";

    const itemsHtml = (step.checklistItems || [])
      .map((item) => {
        const it: ChecklistItem =
          typeof item === "string"
            ? { id: "", label: item, type: "note" }
            : item;
        if (it.type === "section") {
          return `<h2 style="font-size: 15px; color: ${accentColor}; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin: 22px 0 10px 0; letter-spacing: 0.5px;">${it.label}</h2>`;
        }
        return `
          <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: #1e293b;">• ${it.label}${
            it.hint
              ? `<br/><span style="font-size: 12px; color: ${grayColor};">${it.hint}</span>`
              : ""
          }</p>`;
      })
      .join("");

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white;">
        <div style="background-color: ${accentColor}; padding: 26px 30px; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${step.text.toUpperCase()}</h1>
          ${step.subtitle ? `<p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;">${step.subtitle}</p>` : ""}
        </div>
        <div style="padding: 26px 30px;">
          ${itemsHtml}
          <div style="margin-top: 30px; padding-top: 16px; border-top: 2px dashed #f1f5f9;">
            <p style="margin: 0; text-align: center; font-size: 11px; color: ${grayColor};">
              Guía generada por la aplicación móvil <strong>Kiago</strong> • ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: "Compartir guía Kiago",
      });
    }
  } catch (error) {
    console.error("Guide PDF Error:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};

export const exportIncidentToPdf = async (incident: Incident) => {
  try {
    const { partiesWithBase64, sceneImages } =
      await prepareIncidentImages(incident);

    const html = formatIncidentBody(incident, partiesWithBase64, sceneImages);
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
): Promise<MailComposer.MailComposerStatus | null> => {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    alert("La aplicación de correo no está disponible en este dispositivo.");
    return null;
  }

  try {
    // 1. Generate the PDF first to attach it
    const { partiesWithBase64, sceneImages } =
      await prepareIncidentImages(incident);

    const html = formatIncidentBody(incident, partiesWithBase64, sceneImages);
    const { uri: pdfUri } = await Print.printToFileAsync({ html });

    // 2. Collect all individual images + the PDF
    const attachments = collectAttachments(incident);
    attachments.push(pdfUri);

    // 3. Simple professional email body
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #E11D48;">${getReportTitle(incident.flowId)} - Kiago</h2>
        <p>Se adjunta el <strong>informe PDF</strong> con todos los datos pertinentes del incidente, junto con las fotografías originales capturadas en el lugar.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">ID del Reporte: ${incident.id.toUpperCase()}<br>Fecha: ${new Date(incident.createdAt).toLocaleString()}</p>
      </div>
    `;

    const result = await MailComposer.composeAsync({
      recipients: recipient ? [recipient] : [],
      subject: `${getReportTitle(incident.flowId)} - KIAGO - ${new Date(incident.createdAt).toLocaleDateString()} - ID: ${incident.id.slice(0, 8)}`,
      body: emailHtml,
      isHtml: true,
      attachments: attachments,
    });
    // "sent" | "saved" | "cancelled" | "undetermined" (Android suele devolver
    // undetermined porque no informa el resultado real del cliente de correo).
    return result.status;
  } catch (error) {
    console.error("Full Export Error:", error);
    alert("Ocurrió un error al preparar el envío completo.");
    return null;
  }
};

// Etiquetas legibles de los campos obligatorios (para el bloque de datos
// no obtenidos del PDF).
const FIELD_LABELS: Record<string, string> = {
  aseguradora: "Aseguradora",
  poliza_num: "Nº de póliza",
  vigencia_seguro: "Vigencia del seguro",
  dominio_patente: "Patente",
  nombre_titular: "Titular del vehículo",
  conductor_nombre: "Nombre del conductor",
  conductor_tel: "Teléfono",
  dni_photos: "DNI",
  licencia_img: "Licencia de conducir",
  fotos_danos: "Fotos del daño",
};

const formatIncidentBody = (
  incident: Incident,
  partiesWithImages?: any[],
  sceneImages?: Record<string, string[]>,
) => {
  const accentColor = "#E11D48";
  const grayColor = "#64748b";

  // Fotos sueltas del incidente (ej: fotos de la escena), incrustadas.
  const sceneSectionsHtml = Object.entries(sceneImages || {})
    .map(
      ([key, imgs]) => `
      <div style="margin-top: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: ${grayColor};">${key.replace(/_/g, " ").toUpperCase()} (${imgs.length})</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${imgs
            .map(
              (src) =>
                `<img src="${src}" style="width: 140px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;" />`,
            )
            .join("")}
        </div>
      </div>`,
    )
    .join("");

  let html = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white;">
      <div style="background-color: ${accentColor}; padding: 30px; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${getReportTitle(incident.flowId)}</h1>
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
              .flatMap(([key, value]) => {
                if (!value) return [];
                const row = (label: string, val: string) => `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; color: ${grayColor}; font-size: 13px; font-weight: bold;">${label.replace(/_/g, " ").toUpperCase()}</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f8fafc; font-weight: 600;">${val}</td>
                  </tr>
                `;
                // Arrays (fotos): se incrustan como imágenes más abajo.
                if (Array.isArray(value)) return [];
                // Objetos (respuestas de FormStep) → una fila por campo.
                if (typeof value === "object") {
                  return Object.entries(value as Record<string, unknown>)
                    .filter(([, v]) => typeof v === "string" && v)
                    .map(([subKey, subValue]) => row(subKey, String(subValue)));
                }
                return [row(key, String(value))];
              })
              .join("")}
          </table>
          ${sceneSectionsHtml}
        </div>

  `;

  const partiesToRender = partiesWithImages || incident.involvedParties;
  const isChoque = incident.flowId === "choque";

  if (partiesToRender.length > 0 || isChoque) {
    html += `<h2 style="font-size: 18px; color: ${accentColor}; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 20px;">Partes Involucradas</h2>`;
  }

  // Parte Asegurada (Titular): son los datos propios del usuario, cargados en
  // Ajustes. Los involucrados del flow son siempre terceros.
  if (isChoque) {
    const settings = useSettingsStore.getState().settings;
    const hasTitularData = !!(
      settings.userName ||
      settings.userPlate ||
      settings.userPolicy ||
      settings.insuranceName
    );

    html += `
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 15px 0; color: #2563eb; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Parte Asegurada (Titular)</h3>
        ${
          hasTitularData
            ? `
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold; width: 35%;">NOMBRE</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${settings.userName || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">EMAIL</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${settings.userEmail || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">VEHÍCULO / PATENTE</td>
            <td style="padding: 6px 0; font-size: 14px;"><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 13px;">${settings.userPlate || "---"}</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">ASEGURADORA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${settings.insuranceName || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">Nº PÓLIZA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${settings.userPolicy || "---"}</td>
          </tr>
        </table>`
            : `<p style="margin: 0; font-size: 13px; color: ${grayColor};">Sin datos cargados. Completá tu nombre, patente, póliza y aseguradora en la pestaña <strong>Ajustes</strong> de Kiago para incluirlos automáticamente en el reporte.</p>`
        }
      </div>
    `;
  }

  partiesToRender.forEach((party: any, index: number) => {
    // Los involucrados cargados en el flow son siempre terceros: los datos
    // propios del usuario (titular) salen de Ajustes y ya se renderizaron.
    const partyColor = "#dc2626";
    const partyLabel = isChoque
      ? `Tercero Involucrado #${index + 1}`
      : `Involucrado #${index + 1}`;

    const unavailable: string[] = party.unavailableFields || [];
    const missingBlock =
      unavailable.length > 0
        ? `
        <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 12px 16px; margin-bottom: 15px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #92400E;">DATOS QUE NO SE PUDIERON OBTENER</p>
          <p style="margin: 0; font-size: 13px; color: #92400E;">${unavailable.map((f) => FIELD_LABELS[f] || f).join(", ")}</p>
          ${party.missingDataReason ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #92400E;"><strong>Motivo declarado:</strong> ${party.missingDataReason}</p>` : ""}
        </div>`
        : "";

    html += `
      <div style="background-color: #f8fafc; border-left: 4px solid ${partyColor}; border-radius: 6px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 15px 0; color: ${partyColor}; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          ${partyLabel}
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
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">TITULAR DEL VEHÍCULO</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.ownerName || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">ASEGURADORA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.insuranceCompany || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">Nº PÓLIZA</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.policyNumber || "---"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: ${grayColor}; font-weight: bold;">VIGENCIA DEL SEGURO</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${party.insuranceValidity || (party.base64Photos?.insurance ? "Ver foto adjunta" : "---")}</td>
          </tr>
        </table>

        ${missingBlock}

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
            ${party.base64Photos.insurance ? `<img src="${party.base64Photos.insurance}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />` : ""}

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

  // Fotos sueltas del incidente (ej: fotos de la escena).
  Object.values(incident.responses).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "string") photos.push(v);
      });
    }
  });

  incident.involvedParties.forEach((party) => {
    if (party.photos.dniFront) photos.push(party.photos.dniFront);
    if (party.photos.dniBack) photos.push(party.photos.dniBack);
    if (party.photos.licenseFront) photos.push(party.photos.licenseFront);
    if (party.photos.licenseBack) photos.push(party.photos.licenseBack);
    if (party.photos.plate) photos.push(party.photos.plate);
    if (party.photos.insurance) photos.push(party.photos.insurance);
    if (party.photos.damage) {
      party.photos.damage.forEach((uri) => photos.push(uri));
    }
  });

  return photos.filter((uri) => uri && uri.startsWith("file://"));
};
