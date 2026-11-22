import { describe, expect, it } from "vitest";
import { withVerifiedSsl } from "./database-url";

describe("withVerifiedSsl", () => {
  it("upgrades sslmode=require to verify-full", () => {
    expect(withVerifiedSsl("postgresql://u:p@host/db?sslmode=require")).toBe(
      "postgresql://u:p@host/db?sslmode=verify-full",
    );
  });

  it("keeps other parameters", () => {
    expect(
      withVerifiedSsl("postgresql://u:p@host/db?sslmode=require&channel_binding=require"),
    ).toBe("postgresql://u:p@host/db?sslmode=verify-full&channel_binding=require");
  });

  it("leaves other modes and plain URLs unchanged", () => {
    expect(withVerifiedSsl("postgresql://u:p@host/db?sslmode=disable")).toContain(
      "sslmode=disable",
    );
    expect(withVerifiedSsl("postgresql://u:p@host/db")).toBe("postgresql://u:p@host/db");
  });
});
