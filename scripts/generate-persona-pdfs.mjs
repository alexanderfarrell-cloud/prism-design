import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERSONAS_DIR = resolve(__dirname, "../product-docs/personas");
const OUTPUT_DIR = resolve(PERSONAS_DIR, "pdf");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  match[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
  });
  const body = content.slice(match[0].length).trim();
  return { meta, body };
}

function parseTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  return /^\|[\s:-]+\|/.test(line) && line.replace(/[\s|:-]/g, "").length === 0;
}

function renderTable(tableLines) {
  const headerCells = parseTableRow(tableLines[0]);
  const dataRows = tableLines.slice(2);

  let html = '<table><thead><tr>';
  for (const cell of headerCells) {
    html += `<th>${applyInlineFormatting(cell)}</th>`;
  }
  html += '</tr></thead><tbody>';
  for (const row of dataRows) {
    const cells = parseTableRow(row);
    html += '<tr>';
    for (const cell of cells) {
      html += `<td>${applyInlineFormatting(cell)}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function applyInlineFormatting(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToHtml(md) {
  let html = md;

  html = html.replace(/!\[.*?\]\(.*?\)\n*/g, "");

  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");

  html = html.replace(/^> (.+)$/gm, '<div class="blockquote-line">$1</div>');
  html = html.replace(
    /(<div class="blockquote-line">.*<\/div>\n?)+/g,
    (match) => `<blockquote>${match}</blockquote>`
  );
  html = html.replace(/<div class="blockquote-line">(.*?)<\/div>/g, "<p>$1</p>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  const lines = html.split("\n");
  let result = [];
  let inList = false;
  let tableBuffer = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableLine) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      tableBuffer.push(trimmed);
      continue;
    }

    if (tableBuffer.length > 0) {
      if (tableBuffer.length >= 2 && isSeparatorRow(tableBuffer[1])) {
        result.push(renderTable(tableBuffer));
      }
      tableBuffer = [];
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      if (
        trimmed &&
        !trimmed.startsWith("<h") &&
        !trimmed.startsWith("<blockquote") &&
        !trimmed.startsWith("<ul") &&
        !trimmed.startsWith("<table") &&
        !trimmed.startsWith("</")
      ) {
        result.push(`<p>${trimmed}</p>`);
      } else {
        result.push(trimmed);
      }
    }
  }

  if (tableBuffer.length >= 2 && isSeparatorRow(tableBuffer[1])) {
    result.push(renderTable(tableBuffer));
  }
  if (inList) result.push("</ul>");

  return result.join("\n");
}

function imageToDataUri(imagePath) {
  if (!existsSync(imagePath)) return "";
  const buf = readFileSync(imagePath);
  const ext = imagePath.split(".").pop();
  const mime =
    ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1B2126;
    font-size: 10.5pt;
    line-height: 1.55;
    background: #fff;
  }

  .content {
    padding: 28px 48px 40px;
    columns: 2;
    column-gap: 36px;
  }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #0063A3;
    margin-top: 20px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid #E0E7ED;
    break-after: avoid;
    column-span: none;
  }

  h2:first-child { margin-top: 0; }

  h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #1B2126;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  p {
    margin-bottom: 8px;
    text-align: left;
    orphans: 3;
    widows: 3;
  }

  ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }

  li {
    margin-bottom: 5px;
    padding-left: 2px;
  }

  blockquote {
    border-left: 3px solid #0063A3;
    padding: 10px 14px;
    margin: 10px 0 14px;
    background: #F6F9FC;
    border-radius: 0 4px 4px 0;
    font-style: italic;
    color: #333D47;
    break-inside: avoid;
  }

  blockquote p { margin-bottom: 4px; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px;
    font-size: 9.5pt;
    line-height: 1.45;
    break-inside: avoid;
  }

  thead {
    background: #F1F3F5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  th {
    text-align: left;
    font-weight: 600;
    color: #1B2126;
    padding: 8px 10px;
    border-bottom: 2px solid #0063A3;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid #E0E7ED;
    vertical-align: top;
    color: #333D47;
  }

  tbody tr:last-child td { border-bottom: none; }

  strong { font-weight: 600; }
  em { font-style: italic; }

  @page { margin-top: 0.75in; }
  @page :first { margin-top: 0; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content { columns: 2; }
  }
`;

function buildPersonaHtml(meta, bodyHtml, imageDataUri) {
  const tagColor = meta.tags === "primary" ? "#0063A3" : "#505E68";
  const tagLabel =
    meta.tags === "primary" ? "PRIMARY PERSONA" : "SECONDARY PERSONA";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  ${BASE_STYLES}

  .header {
    background: linear-gradient(135deg, #0063A3 0%, #004F83 100%);
    color: #fff;
    padding: 40px 48px 36px;
    display: flex;
    gap: 32px;
    align-items: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
  }

  .header-info { flex: 1; }

  .header-info .name {
    font-size: 28pt;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .header-info .job {
    font-size: 12pt;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .header-meta {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-top: 8px;
    font-size: 9.5pt;
    opacity: 0.85;
  }

  .header-meta .sep { opacity: 0.4; }

  .tag {
    display: inline-block;
    background: ${tagColor};
    color: #fff;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1.2px;
    padding: 3px 10px;
    border-radius: 3px;
    border: 1.5px solid rgba(255,255,255,0.35);
  }

  .tech-bar {
    background: #F1F3F5;
    padding: 12px 48px;
    font-size: 9pt;
    color: #505E68;
    border-bottom: 1px solid #DDE3E8;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .tech-bar strong { color: #1B2126; font-weight: 600; }
</style>
</head>
<body>
  <div class="header">
    ${imageDataUri ? `<img class="avatar" src="${imageDataUri}" alt="${meta.name}">` : ""}
    <div class="header-info">
      <div class="name">${meta.name}</div>
      <div class="job">${meta.job}</div>
      <div class="header-meta">
        <span>Age ${meta.age}</span>
        <span class="sep">|</span>
        <span class="tag">${tagLabel}</span>
      </div>
    </div>
  </div>
  <div class="tech-bar">
    <strong>Tech Stack:</strong> ${meta["tech stack"] || "N/A"}
  </div>
  <div class="content">
    ${bodyHtml}
  </div>
</body></html>`;
}

function buildEmpathyHtml(meta, empathyBodyHtml, imageDataUri) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  ${BASE_STYLES}

  .empathy-header {
    background: linear-gradient(135deg, #0063A3 0%, #004F83 100%);
    color: #fff;
    padding: 24px 48px;
    display: flex;
    gap: 20px;
    align-items: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .empathy-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
  }

  .empathy-title {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .empathy-subtitle {
    font-size: 10pt;
    opacity: 0.85;
    margin-top: 2px;
  }
</style>
</head>
<body>
  <div class="empathy-header">
    ${imageDataUri ? `<img class="empathy-avatar" src="${imageDataUri}" alt="${meta.name}">` : ""}
    <div>
      <div class="empathy-title">EMPATHY MAP</div>
      <div class="empathy-subtitle">${meta.name} -- ${meta.job}</div>
    </div>
  </div>
  <div class="content">
    ${empathyBodyHtml}
  </div>
</body></html>`;
}

async function renderPdf(browser, html) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: 0, bottom: "0.75in", left: 0, right: 0 },
  });
  await page.close();
  return pdfBuffer;
}

async function mergePdfs(buffers) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return Buffer.from(await merged.save());
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = [
    { persona: "Liam (Owner Operator 2) - Persona.md", empathy: "Liam (Owner Operator 2) - Empathy Map.md" },
    { persona: "Marty (Owner Operator 1) - Persona.md", empathy: "Marty (Owner Operator 1)- Empathy Map.md" },
    { persona: "Sandra (External Bookkeeper) - Persona.md", empathy: "Sandra (External Bookkeeper) - Empathy Map.md" },
    { persona: "Miguel (Employee W-2) - Persona.md", empathy: "Miguel (Employee W-2) - Empathy Map.md" },
    { persona: "Ray (1099 Subcontractor) - Persona.md", empathy: "Ray (1099 Subcontractor) - Empathy Map.md" },
  ];

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const { persona, empathy } of files) {
    const raw = readFileSync(resolve(PERSONAS_DIR, persona), "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    const imagePath = resolve(PERSONAS_DIR, meta.image || "");
    const imageDataUri = imageToDataUri(imagePath);

    const personaHtml = buildPersonaHtml(meta, markdownToHtml(body), imageDataUri);
    const personaPdf = await renderPdf(browser, personaHtml);

    const pdfParts = [personaPdf];

    const empathyPath = resolve(PERSONAS_DIR, empathy);
    if (existsSync(empathyPath)) {
      const empathyRaw = readFileSync(empathyPath, "utf-8");
      const { body: empathyBody } = parseFrontmatter(empathyRaw);
      const empathyHtml = buildEmpathyHtml(meta, markdownToHtml(empathyBody), imageDataUri);
      const empathyPdf = await renderPdf(browser, empathyHtml);
      pdfParts.push(empathyPdf);
    }

    const pdfName = persona.replace(" - Persona.md", ".pdf");
    const pdfPath = resolve(OUTPUT_DIR, pdfName);

    if (pdfParts.length > 1) {
      const merged = await mergePdfs(pdfParts);
      writeFileSync(pdfPath, merged);
    } else {
      writeFileSync(pdfPath, personaPdf);
    }

    console.log(`Generated: ${pdfName}`);
  }

  await browser.close();
  console.log(`\nAll PDFs saved to: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
