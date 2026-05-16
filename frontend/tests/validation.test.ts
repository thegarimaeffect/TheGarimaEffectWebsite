import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidRole,
  validateCreateUser,
} from "@/lib/validation";

describe("isValidEmail", () => {
  it.each([
    ["a@b.co", true],
    ["foo.bar+tag@example.org", true],
    ["pm@garimaeffect.local", true],
    ["no-at-sign", false],
    ["@nope.com", false],
    ["x@y", false],
    ["", false],
    [null, false],
    [123, false],
  ])("%j → %s", (input, expected) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});

describe("isValidPassword", () => {
  it("rejects < 8 chars", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("1234567")).toBe(false);
  });
  it("accepts 8+ chars", () => {
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("Garima@Pass25")).toBe(true);
  });
  it("rejects non-strings", () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(undefined)).toBe(false);
    expect(isValidPassword(12345678)).toBe(false);
  });
});

describe("isValidRole", () => {
  it.each([
    ["admin", true],
    ["product_manager", true],
    ["intern", true],
    ["client", true],
    ["PM", false],
    ["superuser", false],
    ["", false],
    [null, false],
  ])("%j → %s", (input, expected) => {
    expect(isValidRole(input)).toBe(expected);
  });
});

describe("validateCreateUser", () => {
  const valid = {
    email: "test@garimaeffect.local",
    password: "Garima@Test25",
    full_name: "Test User",
    role: "intern",
  };

  it("accepts a valid payload + trims fields", () => {
    const r = validateCreateUser({
      email: "  Test@GarimaEffect.local ",
      password: "Garima@Test25",
      full_name: "  Test User  ",
      role: "intern",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe("test@garimaeffect.local");
      expect(r.data.full_name).toBe("Test User");
    }
  });

  it("rejects missing email", () => {
    const r = validateCreateUser({ ...valid, email: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/email/);
  });

  it("rejects weak password", () => {
    const r = validateCreateUser({ ...valid, password: "short" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/password/);
  });

  it("rejects invalid role", () => {
    const r = validateCreateUser({ ...valid, role: "superuser" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/role/);
  });

  it("rejects short full_name", () => {
    const r = validateCreateUser({ ...valid, full_name: "x" });
    expect(r.ok).toBe(false);
  });

  it("passes through optional company_name + phone", () => {
    const r = validateCreateUser({
      ...valid,
      company_name: "Lumen",
      phone: "+91 99999",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.company_name).toBe("Lumen");
      expect(r.data.phone).toBe("+91 99999");
    }
  });

  it("treats empty optional fields as undefined", () => {
    const r = validateCreateUser({
      ...valid,
      company_name: "   ",
      phone: "",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.company_name).toBeUndefined();
      expect(r.data.phone).toBeUndefined();
    }
  });

  it("rejects non-object body", () => {
    expect(validateCreateUser(null).ok).toBe(false);
    expect(validateCreateUser("foo").ok).toBe(false);
    expect(validateCreateUser(undefined).ok).toBe(false);
  });
});
