import { beforeEach, describe, expect, it, vi } from "vitest";

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("export the values when they are valid", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/test");

    const { env } = await import("@/lib/env");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws when the URL is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not-a-url");
    vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/test");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("DATABASE_URL", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });
});
