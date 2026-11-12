import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

const body = (csv: string) => csv.replace(/^﻿/, "").split("\r\n");

describe("toCsv", () => {
  it("writes a header, rows, a BOM and CRLF line endings", () => {
    const csv = toCsv(["a", "b"], [["1", 2]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(body(csv)).toEqual(["a,b", "1,2", ""]);
  });

  it("quotes commas, quotes and line breaks", () => {
    const [, row] = body(toCsv(["x"], [['He said "hi", then\nleft']]));
    expect(row).toBe('"He said ""hi"", then\nleft"');
    expect(toCsv(["x"], [['a,"b"']])).toContain('"a,""b"""');
  });

  it("neutralises spreadsheet formulas in text", () => {
    for (const evil of ["=HYPERLINK(\"http://x\")", "+1+1", "-2", "@SUM(A1)", "\t=1"]) {
      const out = body(toCsv(["x"], [[evil]]))[1];
      expect(out.replace(/^"/, "").startsWith("'")).toBe(true);
    }
  });

  it("keeps real negative numbers as numbers, and renders blanks, booleans and dates", () => {
    const row = body(toCsv(["n", "blank", "undef", "yes", "no", "d"], [[-3, null, undefined, true, false, new Date("2026-11-04T01:02:03Z")]]))[1];
    expect(row).toBe("-3,,,Yes,No,2026-11-04T01:02:03.000Z");
  });

  it("keeps non-Latin text intact", () => {
    expect(toCsv(["n"], [["李小龍 Zoë"]])).toContain("李小龍 Zoë");
  });
});
