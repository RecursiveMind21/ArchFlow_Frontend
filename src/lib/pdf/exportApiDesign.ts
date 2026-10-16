import { jsPDF } from "jspdf";

interface ApiParameter {
  name: string;
  in: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiResponse {
  status: number;
  description: string;
}

interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  tag: string;
  auth: boolean;
  parameters?: ApiParameter[];
  requestBody?: ApiField[];
  responseFields?: ApiField[];
  responses: ApiResponse[];
  example?: string;
}

interface ApiDesign {
  projectId: number;
  baseUrl: string;
  endpoints: ApiEndpoint[];
  stats: {
    totalEndpoints: number;
    resources: number;
    protectedEndpoints: number;
    publicEndpoints: number;
  };
}

const TEXT: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];
const ACCENT: [number, number, number] = [59, 130, 246];
const DIVIDER: [number, number, number] = [229, 231, 235];
const BOX_BG: [number, number, number] = [249, 250, 251];
const MONO_TEXT: [number, number, number] = [30, 41, 59];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const stripMarkdown = (text: string): string =>
  text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

const getMethodColor = (method: string): [number, number, number] => {
  switch (method.toUpperCase()) {
    case "GET":
      return [34, 197, 94];
    case "POST":
      return [59, 130, 246];
    case "PUT":
      return [249, 115, 22];
    case "PATCH":
      return [168, 85, 247];
    case "DELETE":
      return [239, 68, 68];
    default:
      return [107, 114, 128];
  }
};

export function exportApiDesignPdf(design: ApiDesign) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const setRegular = (size: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
  };
  const setBold = (size: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
  };
  const setMono = (size: number) => {
    doc.setFont("courier", "normal");
    doc.setFontSize(size);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const hr = (gapAfter = 20) => {
    ensureSpace(gapAfter);
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += gapAfter;
  };

  const sectionHeading = (text: string) => {
    ensureSpace(30);
    setBold(14);
    doc.setTextColor(...TEXT);
    doc.text(text, margin, y);
    y += 20;
  };

  const subHeading = (text: string) => {
    ensureSpace(28);
    setBold(10);
    doc.setTextColor(...TEXT);
    doc.text(stripMarkdown(text), margin, y);
    y += 16;
  };

  const paragraph = (raw: string, indent = 0) => {
    const text = stripMarkdown(raw);
    if (!text) return;
    setRegular(10);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * 13 + 12);
    doc.text(lines, margin + indent, y);
    y += lines.length * 13 + 12;
  };

  const monoBlock = (text: string, indent = 0) => {
    setMono(9);
    doc.setTextColor(...MONO_TEXT);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * 12 + 4);
    doc.text(lines, margin + indent, y);
    y += lines.length * 12 + 4;
  };

  // HEADER
  setBold(26);
  doc.setTextColor(...TEXT);
  doc.text("API Design", margin, y);
  y += 30;

  setRegular(11);
  doc.setTextColor(...MUTED);
  doc.text(`Project #${design.projectId}`, margin, y);
  y += 14;
  if (design.baseUrl) {
    doc.text(`Base URL: ${design.baseUrl}`, margin, y);
    y += 14;
  }
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    y,
  );
  y += 20;

  setRegular(10);
  doc.setTextColor(...MUTED);
  const intro = doc.splitTextToSize(
    "A complete reference of the REST API — endpoints, authentication requirements, request/response schemas, and example calls.",
    contentWidth,
  );
  doc.text(intro, margin, y);
  y += intro.length * 13 + 16;

  hr(24);

  // OVERVIEW
  sectionHeading("Overview");

  const stats = [
    { label: "Endpoints", value: String(design.stats.totalEndpoints) },
    { label: "Resources", value: String(design.stats.resources) },
    { label: "Protected", value: String(design.stats.protectedEndpoints) },
    { label: "Public", value: String(design.stats.publicEndpoints) },
  ];

  const boxHeight = 56,
    boxGap = 8;
  const boxWidth = (contentWidth - boxGap * 3) / 4;
  ensureSpace(boxHeight + 24);

  stats.forEach((stat, i) => {
    const x = margin + i * (boxWidth + boxGap);
    doc.setFillColor(...BOX_BG);
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, boxWidth, boxHeight, 5, 5, "FD");
    setBold(18);
    doc.setTextColor(...TEXT);
    doc.text(stat.value, x + boxWidth / 2, y + 26, { align: "center" });
    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(stat.label.toUpperCase(), x + boxWidth / 2, y + 44, {
      align: "center",
    });
  });
  y += boxHeight + 28;

  // ENDPOINTS
  sectionHeading("Endpoints");

  design.endpoints.forEach((ep, idx) => {
    setRegular(10);
    doc.setTextColor(...TEXT);
    ensureSpace(80);

    // Method + path
    const [r, g, b] = getMethodColor(ep.method);
    setBold(11);
    doc.setTextColor(r, g, b);
    doc.text(ep.method, margin, y);

    setMono(10);
    doc.setTextColor(...TEXT);
    doc.text(ep.path, margin + 52, y);
    y += 16;

    setRegular(9);
    doc.setTextColor(...MUTED);
    doc.text(
      `${capitalize(ep.tag)}  ·  ${ep.auth ? "Auth required" : "Public"}`,
      margin,
      y,
    );
    y += 14;

    if (ep.summary) {
      setBold(10);
      doc.setTextColor(...TEXT);
      const summaryLines = doc.splitTextToSize(
        stripMarkdown(ep.summary),
        contentWidth,
      );
      ensureSpace(summaryLines.length * 13 + 6);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 13 + 6;
    }

    if (ep.description) {
      paragraph(ep.description);
    }

    // Parameters
    if (ep.parameters && ep.parameters.length > 0) {
      subHeading("Parameters");
      ep.parameters.forEach((p) => {
        setMono(9);
        doc.setTextColor(...TEXT);
        doc.text(
          `${p.name}  (${p.in}, ${p.type}${p.required ? ", required" : ""})`,
          margin + 12,
          y,
        );
        y += 12;
        if (p.description) {
          paragraph(p.description, 12);
        }
        y += 2;
      });
      y += 4;
    }

    // Request body
    if (ep.requestBody && ep.requestBody.length > 0) {
      subHeading("Request Body");
      ep.requestBody.forEach((f) => {
        setMono(9);
        doc.setTextColor(...TEXT);
        doc.text(
          `${f.name}  :  ${f.type}${f.required ? " (required)" : ""}`,
          margin + 12,
          y,
        );
        y += 12;
        if (f.description) paragraph(f.description, 12);
        y += 2;
      });
      y += 4;
    }

    // Response fields
    if (ep.responseFields && ep.responseFields.length > 0) {
      subHeading("Response Schema");
      ep.responseFields.forEach((f) => {
        setMono(9);
        doc.setTextColor(...TEXT);
        doc.text(
          `${f.name}  :  ${f.type}${f.required ? " (required)" : ""}`,
          margin + 12,
          y,
        );
        y += 12;
        if (f.description) paragraph(f.description, 12);
        y += 2;
      });
      y += 4;
    }

    // Responses
    if (ep.responses && ep.responses.length > 0) {
      subHeading("Responses");
      ep.responses.forEach((r) => {
        setMono(10);
        doc.setTextColor(...TEXT);
        doc.text(String(r.status), margin + 12, y);
        setRegular(10);
        doc.setTextColor(...MUTED);
        const lines = doc.splitTextToSize(
          stripMarkdown(r.description),
          contentWidth - 60,
        );
        doc.text(lines, margin + 52, y);
        y += lines.length * 13 + 3;
      });
      y += 6;
    }

    // Example
    if (ep.example) {
      subHeading("Example");
      // Box background
      const cleanExample = ep.example.replace(/\r/g, "");
      setMono(9);
      const exampleLines = doc.splitTextToSize(cleanExample, contentWidth - 24);
      const boxPad = 10;
      const boxH = exampleLines.length * 12 + boxPad * 2;
      ensureSpace(boxH + 6);

      doc.setFillColor(...BOX_BG);
      doc.setDrawColor(...DIVIDER);
      doc.roundedRect(margin, y, contentWidth, boxH, 4, 4, "FD");

      doc.setTextColor(...MONO_TEXT);
      doc.text(exampleLines, margin + boxPad, y + boxPad + 10);
      y += boxH + 12;
    }

    if (idx < design.endpoints.length - 1) {
      y += 8;
      hr(20);
    }
  });

  // FOOTER
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `API Design  ·  Project #${design.projectId}  ·  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
  }

  doc.save(`api-design-project-${design.projectId}.pdf`);
}

/**
 * Converts the API design to an OpenAPI 3.0 JSON document.
 */
export function exportApiDesignOpenApi(design: ApiDesign) {
  const paths: Record<string, any> = {};

  design.endpoints.forEach((ep) => {
    const method = ep.method.toLowerCase();
    if (!paths[ep.path]) paths[ep.path] = {};

    const parameters = (ep.parameters ?? []).map((p) => ({
      name: p.name,
      in: p.in,
      required: p.required,
      description: p.description,
      schema: { type: p.type },
    }));

    const requestBody =
      ep.requestBody && ep.requestBody.length > 0
        ? {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: Object.fromEntries(
                    ep.requestBody.map((f) => [
                      f.name,
                      { type: f.type, description: f.description },
                    ]),
                  ),
                },
              },
            },
          }
        : undefined;

    const responses = Object.fromEntries(
      (ep.responses ?? []).map((r) => [
        String(r.status),
        { description: r.description },
      ]),
    );

    paths[ep.path][method] = {
      summary: ep.summary,
      description: ep.description,
      tags: [ep.tag],
      security: ep.auth ? [{ bearerAuth: [] }] : [],
      parameters,
      requestBody,
      responses,
    };
  });

  const openapi = {
    openapi: "3.0.3",
    info: {
      title: `API Design — Project ${design.projectId}`,
      version: "1.0.0",
    },
    servers: design.baseUrl ? [{ url: design.baseUrl }] : [],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths,
  };

  const blob = new Blob([JSON.stringify(openapi, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `openapi-project-${design.projectId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
