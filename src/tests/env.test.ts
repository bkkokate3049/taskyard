import { beforeEach, describe, expect, it, vi } from "vitest";

function stubValidEnv() {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/test");
  vi.stubEnv("AUTH_SECRET", "test-secret-test-secret-test-secret-1234");
  vi.stubEnv("AUTH_GITHUB_ID", "test-id");
  vi.stubEnv("AUTH_GITHUB_SECRET", "test-secret");
}

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("exports the values when they are valid", async () => {
    stubValidEnv();

    const { env } = await import("@/lib/env");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws when the app URL is invalid", async () => {
    stubValidEnv();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not-a-url");

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });

  it("throws when DATABASE_URL is missing", async () => {
    stubValidEnv();
    vi.stubEnv("DATABASE_URL", "");

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });

  it("throws when AUTH_SECRET is too short", async () => {
    stubValidEnv();
    vi.stubEnv("AUTH_SECRET", "short");

    await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
  });
});
