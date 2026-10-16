import { jsPDF } from "jspdf";

interface Component {
  id: string;
  name: string;
  type: string;
  description: string;
  technologies: string[];
  path: string;
  props?: string[];
  features: string[];
}

interface FrontendArchitecture {
  projectId: number;
  components: Component[];
  stats: {
    totalPages: number;
    totalComponents: number;
    totalHooks: number;
    totalUtilities: number;
  };
}

const TEXT: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];
const ACCENT: [number, number, number] = [59, 130, 246];
const DIVIDER: [number, number, number] = [229, 231, 235];
const BOX_BG: [number, number, number] = [249, 250, 251];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const stripMarkdown = (text: string): string =>
  text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

export function exportFrontendArchitecturePdf(
  architecture: FrontendArchitecture,
) {
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

  // HEADER
  setBold(26);
  doc.setTextColor(...TEXT);
  doc.text("Frontend Architecture", margin, y);
  y += 30;

  setRegular(11);
  doc.setTextColor(...MUTED);
  doc.text(`Project #${architecture.projectId}`, margin, y);
  y += 14;
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    y,
  );
  y += 20;

  setRegular(10);
  doc.setTextColor(...MUTED);
  const intro = doc.splitTextToSize(
    "A structured breakdown of the pages, components, hooks, and utilities that make up this project\u2019s frontend system.",
    contentWidth,
  );
  doc.text(intro, margin, y);
  y += intro.length * 13 + 16;

  hr(24);

  // OVERVIEW
  sectionHeading("Overview");

  const stats = [
    { label: "Pages", value: architecture.stats.totalPages },
    { label: "Components", value: architecture.stats.totalComponents },
    { label: "Hooks", value: architecture.stats.totalHooks },
    { label: "Utilities", value: architecture.stats.totalUtilities },
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

  // COMPONENTS
  sectionHeading("Components");

  if (architecture.components.length === 0) {
    setRegular(10);
    doc.setTextColor(...MUTED);
    doc.text("No components defined.", margin, y);
    y += 20;
  }

  architecture.components.forEach((component, idx) => {
    setRegular(10);
    doc.setTextColor(...TEXT);
    ensureSpace(60);

    setBold(13);
    doc.setTextColor(...TEXT);
    const nameLines = doc.splitTextToSize(
      `${idx + 1}. ${stripMarkdown(component.name)}`,
      contentWidth,
    );
    ensureSpace(nameLines.length * 17 + 6);
    doc.text(nameLines, margin, y);
    y += nameLines.length * 17 + 4;

    setRegular(9);
    doc.setTextColor(...ACCENT);
    doc.text(capitalize(component.type), margin, y);
    y += 16;

    if (component.path) {
      setRegular(9);
      doc.setTextColor(...MUTED);
      const pathLines = doc.splitTextToSize(
        `Path: ${component.path}`,
        contentWidth,
      );
      ensureSpace(pathLines.length * 12 + 6);
      doc.text(pathLines, margin, y);
      y += pathLines.length * 12 + 8;
    }

    if (component.description) {
      paragraph(component.description);
    }

    if (component.technologies?.length > 0) {
      subHeading("Technologies");
      const joined = component.technologies.map(stripMarkdown).join("   ·   ");
      setRegular(10);
      doc.setTextColor(...MUTED);
      const lines = doc.splitTextToSize(joined, contentWidth - 12);
      ensureSpace(lines.length * 13 + 12);
      doc.text(lines, margin + 12, y);
      y += lines.length * 13 + 16;
    }

    if (component.props && component.props.length > 0) {
      subHeading("Props");
      component.props.forEach((prop) => {
        setRegular(10);
        doc.setTextColor(...MUTED);
        const lines = doc.splitTextToSize(
          stripMarkdown(prop),
          contentWidth - 12,
        );
        ensureSpace(lines.length * 13 + 3);
        doc.text(lines, margin + 12, y);
        y += lines.length * 13 + 5;
      });
      y += 6;
    }

    if (component.features?.length > 0) {
      subHeading("Features");
      component.features.forEach((f) => bullet(f));
      y += 4;
    }

    if (idx < architecture.components.length - 1) {
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
      `Frontend Architecture  ·  Project #${architecture.projectId}  ·  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
  }

  doc.save(`frontend-architecture-project-${architecture.projectId}.pdf`);
}
