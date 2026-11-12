import { describe, expect, it } from "vitest";
import { telHref } from "./tel";

describe("telHref", () => {
  it("turns every hotline format on the site into a dialable link", () => {
    expect(telHref("1553")).toBe("tel:1553");
    expect(telHref("0966-351-4518")).toBe("tel:09663514518");
    expect(telHref("(02) 8804-4673")).toBe("tel:0288044673");
    expect(telHref("+63 917 558 4673")).toBe("tel:+639175584673");
  });
});
