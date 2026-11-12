import { describe, expect, it } from "vitest";
import { assessmentItems, scoreAssessment } from "./assessment";
import { generateReferenceCode, normalizeReferenceCode } from "./reference-code";
import { ageOn, consentSchema, interviewSchema, sameName } from "../validation/forms";
import { testimonySchema } from "../validation/testimony";

describe("scoreAssessment", () => {
  const all = (n: number) => assessmentItems.map(() => n);

  it("sums answers and bands the total", () => {
    expect(scoreAssessment(all(0))).toEqual({ totalScore: 0, band: "steady", safetyFlag: false });
    expect(scoreAssessment(all(1)).band).toBe("strained"); // 10
    expect(scoreAssessment(all(3)).totalScore).toBe(30);
    expect(scoreAssessment(all(3)).band).toBe("heavy");
  });

  it("flags any non-zero answer to the safety item even when the total is low", () => {
    const answers = all(0);
    answers[answers.length - 1] = 1;
    expect(scoreAssessment(answers)).toMatchObject({ totalScore: 1, band: "steady", safetyFlag: true });
  });
});

describe("reference codes", () => {
  it("generates codes that round-trip through normalize", () => {
    const code = generateReferenceCode();
    expect(code).toMatch(/^LWN-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(normalizeReferenceCode(code)).toBe(code);
  });

  it("is forgiving about case and spacing, strict about content", () => {
    expect(normalizeReferenceCode("lwn 7k2q 9xma")).toBe("LWN-7K2Q-9XMA");
    expect(normalizeReferenceCode("LWN-7K2Q")).toBeNull();
    expect(normalizeReferenceCode("ABC-7K2Q-9XMA")).toBeNull();
    expect(normalizeReferenceCode("LWN-0O1I-9XMA")).toBeNull();
  });
});

describe("consentSchema", () => {
  const valid = {
    fullName: "Maria Santos",
    birthdate: "2000-01-15",
    agreeVoluntary: "on",
    agreeConfidentiality: "on",
    agreeNotEmergency: "on",
    signature: "maria  santos",
  };

  it("accepts a complete adult form with a loosely matching signature", () => {
    expect(consentSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a guardian for minors", () => {
    const year = new Date().getUTCFullYear() - 12;
    const result = consentSchema.safeParse({ ...valid, birthdate: `${year}-06-01` });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0])).toContain("guardianName");
  });

  it("rejects missing agreements, future birthdates and mismatched signatures", () => {
    const result = consentSchema.safeParse({
      ...valid,
      agreeVoluntary: undefined,
      birthdate: "2999-01-01",
      signature: "Someone Else",
    });
    const fields = result.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["agreeVoluntary", "birthdate", "signature"]));
  });
});

describe("interviewSchema dropdowns", () => {
  const base = { reason: "Feeling stressed", history: "no", preferredContact: "email" };

  it("accepts a listed option or no answer", () => {
    expect(interviewSchema.safeParse({ ...base, pronouns: "they/them", yearLevel: "Grade 10" }).success).toBe(true);
    expect(interviewSchema.safeParse(base).success).toBe(true);
  });

  it("requires typed text when Other is chosen", () => {
    const result = interviewSchema.safeParse({ ...base, pronouns: "other", yearLevel: "other" });
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(["pronounsOther", "yearLevelOther"]);
    expect(
      interviewSchema.safeParse({ ...base, pronouns: "other", pronounsOther: "xe/xem" }).success,
    ).toBe(true);
  });

  it("rejects an option that isn't in the list", () => {
    expect(interviewSchema.safeParse({ ...base, pronouns: "whatever" }).success).toBe(false);
  });
});

describe("extreme input", () => {
  const base = {
    birthdate: "2000-01-15",
    agreeVoluntary: "on",
    agreeConfidentiality: "on",
    agreeNotEmergency: "on",
  };
  const consent = (name: string, signature = name) => consentSchema.safeParse({ ...base, fullName: name, signature });

  it("accepts names in other scripts, with emoji, and with surrounding spaces", () => {
    for (const name of ["محمد علي", "李小龍", "Zoë Ñúñez-O'Brien", "Ana 🌙 Cruz", "  Maria Santos  "]) {
      expect(consent(name).success, name).toBe(true);
    }
  });

  it("rejects an absurdly long name instead of storing it", () => {
    const result = consent("A".repeat(500));
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "fullName")).toBe(true);
  });

  it("rejects whitespace-only and empty required fields", () => {
    expect(consent("   ").success).toBe(false);
    expect(consent("").success).toBe(false);
  });

  it("rejects malformed and unreal birthdates", () => {
    for (const birthdate of ["not-a-date", "2000-13-45", "1800-01-01", "2999-01-01", "15/01/2000"]) {
      expect(consentSchema.safeParse({ ...base, birthdate, fullName: "A B", signature: "A B" }).success, birthdate).toBe(false);
    }
  });
});

describe("testimonySchema", () => {
  const valid = { content: "I felt heard and not judged.", agreePublic: "on" };

  it("accepts a testimony with or without a name", () => {
    expect(testimonySchema.safeParse(valid).success).toBe(true);
    expect(testimonySchema.safeParse({ ...valid, displayName: "Maria" }).success).toBe(true);
  });

  it("requires permission, a real sentence, and a sane length", () => {
    expect(testimonySchema.safeParse({ ...valid, agreePublic: undefined }).success).toBe(false);
    expect(testimonySchema.safeParse({ ...valid, content: "Good." }).success).toBe(false);
    expect(testimonySchema.safeParse({ ...valid, content: "x".repeat(601) }).success).toBe(false);
    expect(testimonySchema.safeParse({ ...valid, displayName: "n".repeat(61) }).success).toBe(false);
  });

  it("keeps markup as plain text rather than interpreting it", () => {
    const result = testimonySchema.safeParse({ ...valid, content: "<script>alert(1)</script> helped me" });
    expect(result.success && result.data.content).toBe("<script>alert(1)</script> helped me");
  });
});

describe("helpers", () => {
  it("compares names ignoring case, accents and spacing", () => {
    expect(sameName("José  Rizal", "jose rizal")).toBe(true);
    expect(sameName("Jose Rizal", "Jose Bonifacio")).toBe(false);
  });

  it("computes age around the birthday", () => {
    const today = new Date("2026-06-15T00:00:00Z");
    expect(ageOn(new Date("2008-06-15T00:00:00Z"), today)).toBe(18);
    expect(ageOn(new Date("2008-06-16T00:00:00Z"), today)).toBe(17);
  });
});
