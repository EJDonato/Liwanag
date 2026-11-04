// CSV for the submissions export. Pure, so the escaping rules can be tested.

export type CsvCell = string | number | boolean | Date | null | undefined;

// Spreadsheet programs run cells that start with = + - @ (or a tab/CR) as formulas. Names and
// messages come from the public, so a hostile one could do harm on a staff laptop. A leading
// apostrophe makes the cell plain text; it is the standard defence.
function guardFormula(text: string) {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function cell(value: CsvCell) {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  const safe = typeof value === "number" ? text : guardFormula(text);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: readonly string[], rows: readonly (readonly CsvCell[])[]) {
  const lines = [headers.map(cell).join(","), ...rows.map((row) => row.map(cell).join(","))];
  // The BOM makes Excel read the file as UTF-8, so accents and non-Latin names survive.
  return `﻿${lines.join("\r\n")}\r\n`;
}
