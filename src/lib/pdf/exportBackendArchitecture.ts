import { jsPDF } from "jspdf";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  type: string;
  description: string;
  technologies: string[];
  endpoints?: string[];
  responsibilities: string[];
}

interface BackendArchitecture {
  projectId: number;
  services: Service[];
  stats: {
    totalServices: number;
    authLayers: number;
    cacheLayers: number;
    messageQueues: number;
  };
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const TEXT: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];
const ACCENT: [number, number, number] = [59, 130, 246];
const DIVIDER: [number, number, number] = [229, 231, 235];
const BOX_BG: [number, number, number] = [249, 250, 251];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Strips markdown syntax that sometimes leaks out of LLM-generated fields.
 */
const stripMarkdown = (text: string): string =>
  text
    .replace(/^#{1,6}\s+/gm, "") // ## headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold**
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "$1") // *italic*
    .replace(/^[-*]\s+/gm, "") // - bullets
    .replace(/`([^`]+)`/g, "$1") // `code`
    .trim();

// ─── Main export ─────────────────────────────────────────────────────────────

export function exportBackendArchitecturePdf(
  architecture: BackendArchitecture,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Fonts — one family, ever ────────────────────────────────────────────
  // We never switch to courier. Everything stays helvetica, which
  // eliminates the measurement/draw mismatch entirely.
  const setRegular = (size: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
  };
  const setBold = (size: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
  };

  // ── Page-break guard ────────────────────────────────────────────────────
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Horizontal rule ─────────────────────────────────────────────────────
  const hr = (gapAfter = 20) => {
    ensureSpace(gapAfter);
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += gapAfter;
  };

  // ── Section heading ─────────────────────────────────────────────────────
  const sectionHeading = (text: string) => {
    ensureSpace(30);
    setBold(14);
    doc.setTextColor(...TEXT);
    doc.text(text, margin, y);
    y += 20;
  };

  // ── Small sub-heading ───────────────────────────────────────────────────
  const subHeading = (text: string) => {
    ensureSpace(22);
    setBold(10);
    doc.setTextColor(...TEXT);
    doc.text(text, margin, y);
    y += 14;
  };

  // ── Body paragraph ──────────────────────────────────────────────────────
  const paragraph = (raw: string, indent = 0, color = MUTED) => {
    const text = stripMarkdown(raw);
    if (!text) return;

    setRegular(10);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * 13 + 6);
    doc.text(lines, margin + indent, y);
    y += lines.length * 13 + 8;
  };

  // ── Bullet ──────────────────────────────────────────────────────────────
  const bullet = (raw: string) => {
    const text = stripMarkdown(raw);
    if (!text) return;

    setRegular(10);
    const lines = doc.splitTextToSize(text, contentWidth - 20);
    ensureSpace(lines.length * 13 + 4);

    doc.setTextColor(...ACCENT);
    doc.text("•", margin + 4, y);

    doc.setTextColor(...MUTED);
    doc.text(lines, margin + 16, y);

    y += lines.length * 13 + 4;
  };

  // ════════════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════════════

  setBold(26);
  doc.setTextColor(...TEXT);
  doc.text("Backend Architecture", margin, y);
  y += 30;

  setRegular(11);
  doc.setTextColor(...MUTED);
  doc.text(`Project #${architecture.projectId}`, margin, y);
  y += 14;
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    margin,
    y,
  );
  y += 20;

  setRegular(10);
  doc.setTextColor(...MUTED);
  const intro = doc.splitTextToSize(
    "A structured breakdown of the services, technologies, and responsibilities that make up this project\u2019s backend system.",
    contentWidth,
  );
  doc.text(intro, margin, y);
  y += intro.length * 13 + 16;

  hr(24);

  // ════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ════════════════════════════════════════════════════════════════════════

  sectionHeading("Overview");

  const stats = [
    { label: "Services", value: architecture.stats.totalServices },
    { label: "Auth Layers", value: architecture.stats.authLayers },
    { label: "Cache Layers", value: architecture.stats.cacheLayers },
    { label: "Message Queues", value: architecture.stats.messageQueues },
  ];

  const boxHeight = 56;
  const boxGap = 8;
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
    doc.text(String(stat.value), x + boxWidth / 2, y + 26, { align: "center" });

    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(stat.label.toUpperCase(), x + boxWidth / 2, y + 44, {
      align: "center",
    });
  });

  y += boxHeight + 28;

  // ════════════════════════════════════════════════════════════════════════
  // SERVICES
  // ════════════════════════════════════════════════════════════════════════

  sectionHeading("Services");

  if (architecture.services.length === 0) {
    setRegular(10);
    doc.setTextColor(...MUTED);
    doc.text("No services defined.", margin, y);
    y += 20;
  }

  architecture.services.forEach((service, idx) => {
    // ── Reset font + colors at the top of every service ─────────────────
    // Even though we never switch families now, this is cheap insurance.
    setRegular(10);
    doc.setTextColor(...TEXT);

    ensureSpace(60);

    // ── Service name ────────────────────────────────────────────────────
    setBold(13);
    doc.setTextColor(...TEXT);
    const nameLines = doc.splitTextToSize(
      `${idx + 1}. ${stripMarkdown(service.name)}`,
      contentWidth,
    );
    ensureSpace(nameLines.length * 17 + 6);
    doc.text(nameLines, margin, y);
    y += nameLines.length * 17 + 4;

    // ── Type badge ──────────────────────────────────────────────────────
    setRegular(9);
    doc.setTextColor(...ACCENT);
    doc.text(capitalize(service.type), margin, y);
    y += 16;

    // ── Description ─────────────────────────────────────────────────────
    if (service.description) {
      paragraph(service.description);
    }

    // ── Technologies ────────────────────────────────────────────────────
    if (service.technologies?.length > 0) {
      subHeading("Technologies");
      const joined = service.technologies.map(stripMarkdown).join("  ·  ");
      setRegular(10);
      doc.setTextColor(...MUTED);
      const lines = doc.splitTextToSize(joined, contentWidth - 12);
      ensureSpace(lines.length * 13 + 8);
      doc.text(lines, margin + 12, y);
      y += lines.length * 13 + 12;
    }

    // ── Endpoints ───────────────────────────────────────────────────────
    if (service.endpoints && service.endpoints.length > 0) {
      subHeading("API Endpoints");

      service.endpoints.forEach((ep) => {
        const clean = stripMarkdown(ep);
        setRegular(10);
        doc.setTextColor(...MUTED);
        const lines = doc.splitTextToSize(clean, contentWidth - 12);
        ensureSpace(lines.length * 13 + 3);
        doc.text(lines, margin + 12, y);
        y += lines.length * 13 + 3;
      });
      y += 10;
    }

    // ── Responsibilities ────────────────────────────────────────────────
    if (service.responsibilities?.length > 0) {
      subHeading("Responsibilities");
      service.responsibilities.forEach((resp) => bullet(resp));
      y += 4;
    }

    // ── Divider between services ────────────────────────────────────────
    if (idx < architecture.services.length - 1) {
      y += 8;
      hr(20);
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // FOOTER on every page
  // ════════════════════════════════════════════════════════════════════════

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Backend Architecture  ·  Project #${architecture.projectId}  ·  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
  }

  doc.save(`backend-architecture-project-${architecture.projectId}.pdf`);
}
