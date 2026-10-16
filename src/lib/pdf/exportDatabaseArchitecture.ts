import { jsPDF } from "jspdf";

interface Field {
  name: string;
  type: string;
  constraints: string[];
  description: string;
}

interface Relationship {
  type: string;
  targetTable: string;
  description: string;
}

interface Table {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  relationships: Relationship[];
}

interface DatabaseArchitecture {
  projectId: number;
  databaseType: string;
  tables: Table[];
  stats: {
    totalTables: number;
    totalPrimaryKeys: number;
    totalRelationships: number;
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

/**
 * Maps a friendly type from the LLM into something that looks like real SQL.
 */
const toSqlType = (type: string): string => {
  const t = type.toLowerCase();
  if (t.includes("bigint") || t.includes("long")) return "BIGINT";
  if (t.includes("int")) return "INTEGER";
  if (t.includes("serial")) return "BIGSERIAL";
  if (t.includes("varchar") || t.includes("string") || t.includes("text"))
    return "TEXT";
  if (t.includes("bool")) return "BOOLEAN";
  if (t.includes("timestamp") || t.includes("datetime")) return "TIMESTAMP";
  if (t.includes("json")) return "JSONB";
  if (t.includes("decimal") || t.includes("float")) return "DECIMAL(10,2)";
  if (t.includes("date")) return "DATE";
  if (t.includes("uuid")) return "UUID";
  return type.toUpperCase();
};

const toSqlConstraint = (c: string): string => {
  const u = c.toUpperCase();
  if (u.includes("PRIMARY")) return "PRIMARY KEY";
  if (u.includes("FOREIGN")) return "REFERENCES";
  if (u.includes("UNIQUE")) return "UNIQUE";
  if (u.includes("INDEX")) return "";
  if (u.includes("NULL")) return "NOT NULL";
  if (u.includes("DEFAULT")) return c;
  return c;
};

export function exportDatabaseArchitecturePdf(
  architecture: DatabaseArchitecture,
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
    // Always reset to helvetica — critical since mono is used elsewhere
    setRegular(10);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * 13 + 12);
    doc.text(lines, margin + indent, y);
    y += lines.length * 13 + 12;
  };

  const monoLine = (text: string, indent = 0) => {
    setMono(9);
    doc.setTextColor(...MONO_TEXT);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    ensureSpace(lines.length * 12 + 3);
    doc.text(lines, margin + indent, y);
    y += lines.length * 12 + 3;
  };

  // HEADER
  setBold(26);
  doc.setTextColor(...TEXT);
  doc.text("Database Architecture", margin, y);
  y += 30;

  setRegular(11);
  doc.setTextColor(...MUTED);
  doc.text(`Project #${architecture.projectId}`, margin, y);
  y += 14;
  doc.text(
    `${architecture.databaseType}  ·  Generated ${new Date().toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )}`,
    margin,
    y,
  );
  y += 20;

  setRegular(10);
  doc.setTextColor(...MUTED);
  const intro = doc.splitTextToSize(
    "A structured view of the database schema — tables, fields, constraints, and relationships. SQL DDL is included at the end for direct use.",
    contentWidth,
  );
  doc.text(intro, margin, y);
  y += intro.length * 13 + 16;

  hr(24);

  // OVERVIEW
  sectionHeading("Overview");

  const stats = [
    { label: "Tables", value: architecture.stats.totalTables },
    { label: "Primary Keys", value: architecture.stats.totalPrimaryKeys },
    { label: "Relationships", value: architecture.stats.totalRelationships },
    { label: "Database", value: architecture.databaseType },
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
    setBold(typeof stat.value === "string" ? 12 : 18);
    doc.setTextColor(...TEXT);
    doc.text(String(stat.value), x + boxWidth / 2, y + 26, { align: "center" });
    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(stat.label.toUpperCase(), x + boxWidth / 2, y + 44, {
      align: "center",
    });
  });

  y += boxHeight + 28;

  // TABLES
  sectionHeading("Tables");

  if (architecture.tables.length === 0) {
    setRegular(10);
    doc.setTextColor(...MUTED);
    doc.text("No tables defined.", margin, y);
    y += 20;
  }

  architecture.tables.forEach((table, idx) => {
    setRegular(10);
    doc.setTextColor(...TEXT);
    ensureSpace(70);

    setBold(13);
    doc.setTextColor(...TEXT);
    doc.text(`${idx + 1}. ${stripMarkdown(table.name)}`, margin, y);
    y += 16;

    if (table.description) {
      paragraph(table.description);
    }

    // FIELDS
    if (table.fields?.length > 0) {
      subHeading("Fields");
      table.fields.forEach((field) => {
        setRegular(10);
        doc.setTextColor(...TEXT);
        const nameAndType = `${field.name}  :  ${field.type}`;
        const nameLines = doc.splitTextToSize(nameAndType, contentWidth - 12);
        ensureSpace(nameLines.length * 13 + 4);
        doc.text(nameLines, margin + 12, y);
        y += nameLines.length * 13 + 3;

        if (field.constraints?.length > 0) {
          setRegular(8);
          doc.setTextColor(...ACCENT);
          const cText = field.constraints.join("  ·  ");
          const cLines = doc.splitTextToSize(cText, contentWidth - 24);
          ensureSpace(cLines.length * 11 + 3);
          doc.text(cLines, margin + 20, y);
          y += cLines.length * 11 + 3;
        }

        if (field.description) {
          paragraph(field.description, 12);
        }
        y += 4;
      });
      y += 4;
    }

    // RELATIONSHIPS
    if (table.relationships?.length > 0) {
      subHeading("Relationships");
      table.relationships.forEach((rel) => {
        setRegular(10);
        doc.setTextColor(...TEXT);
        doc.text(
          `${capitalize(rel.type)}  →  ${rel.targetTable}`,
          margin + 12,
          y,
        );
        y += 14;
        if (rel.description) {
          paragraph(rel.description, 12);
        }
        y += 4;
      });
      y += 4;
    }

    if (idx < architecture.tables.length - 1) {
      y += 8;
      hr(20);
    }
  });

  // SQL DDL SECTION
  y += 12;
  hr(24);
  sectionHeading("SQL DDL");

  setRegular(10);
  doc.setTextColor(...MUTED);
  const sqlIntro = doc.splitTextToSize(
    "Ready-to-run CREATE TABLE statements. Copy the block below into your SQL client.",
    contentWidth,
  );
  doc.text(sqlIntro, margin, y);
  y += sqlIntro.length * 13 + 12;

  architecture.tables.forEach((table) => {
    ensureSpace(20);
    monoLine(`CREATE TABLE ${table.name} (`);
    table.fields.forEach((field, i) => {
      const sqlType = toSqlType(field.type);
      const constraints = (field.constraints ?? [])
        .map(toSqlConstraint)
        .filter((c) => c && c !== "REFERENCES")
        .join(" ");
      const comma = i < table.fields.length - 1 ? "," : "";
      const line = `  ${field.name} ${sqlType}${constraints ? " " + constraints : ""}${comma}`;
      monoLine(line);
    });
    monoLine(");");
    y += 6;
  });

  // FOOTER
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setRegular(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Database Architecture  ·  Project #${architecture.projectId}  ·  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
  }

  doc.save(`database-architecture-project-${architecture.projectId}.pdf`);
}
