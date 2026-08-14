import * as XLSX from "xlsx";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function parseCsvHeaderLine(line: string): string[] {
  return parseCsvLine(line).filter((value) => value.length > 0);
}

function parseExcelHeaders(buffer: ArrayBuffer): string[] {
  const workbook = XLSX.read(buffer, { type: "array", sheetRows: 1 });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The file has no worksheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  }) as (string | null)[][];

  const headerRow = rows[0];
  if (!headerRow?.length) {
    throw new Error("No column headers found in the first row.");
  }

  return headerRow
    .map((cell) => (cell == null ? "" : String(cell).trim()))
    .filter((name) => name.length > 0);
}

async function parseCsvHeaders(file: File): Promise<string[]> {
  const text = await file.text();
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0);
  if (!firstLine) {
    throw new Error("No column headers found in the first row.");
  }

  const headers = parseCsvHeaderLine(firstLine);
  if (headers.length === 0) {
    throw new Error("No column headers found in the first row.");
  }

  return headers;
}

export async function parseSourceHeaders(file: File): Promise<string[]> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return parseCsvHeaders(file);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    return parseExcelHeaders(buffer);
  }

  throw new Error("Unsupported file type. Use .xlsx, .xls, or .csv.");
}

const SAMPLE_LIMIT = 20;
const PREVIEW_ROWS = SAMPLE_LIMIT + 1;

function collectSamples(
  headerRow: (string | null | undefined)[],
  dataRows: (string | null | undefined)[][],
): Record<string, string[]> {
  const samples: Record<string, string[]> = {};
  headerRow.forEach((cell, index) => {
    const name = cell == null ? "" : String(cell).trim();
    if (!name || samples[name]) return;
    const values: string[] = [];
    for (const row of dataRows) {
      const raw = row?.[index];
      const text = raw == null ? "" : String(raw).trim();
      if (!text) continue;
      values.push(text);
      if (values.length >= SAMPLE_LIMIT) break;
    }
    samples[name] = values;
  });
  return samples;
}

async function parseCsvSamples(file: File): Promise<Record<string, string[]>> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return {};
  const headerRow = parseCsvLine(lines[0]);
  const dataRows = lines.slice(1, PREVIEW_ROWS).map((line) => parseCsvLine(line));
  return collectSamples(headerRow, dataRows);
}

async function parseExcelSamples(file: File): Promise<Record<string, string[]>> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", sheetRows: PREVIEW_ROWS });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return {};
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | null)[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  }) as (string | null)[][];
  if (!rows[0]?.length) return {};
  return collectSamples(rows[0], rows.slice(1));
}

/** First ~20 non-empty values per column. Used only for Apply rules with AI. */
export async function parseSourceColumnSamples(
  file: File,
): Promise<Record<string, string[]>> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".csv")) {
    return parseCsvSamples(file);
  }
  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    return parseExcelSamples(file);
  }
  return {};
}
