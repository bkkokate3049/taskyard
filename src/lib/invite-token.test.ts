import { describe, expect, it } from "vitest";
import {
  generateInviteToken,
  hashInviteToken,
  INVITE_TOKEN_PATTERN,
} from "./invite-token";

describe("invite tokens", () => {
  it("generates tokens that match the expected pattern", () => {
    expect(INVITE_TOKEN_PATTERN.test(generateInviteToken())).toBe(true);
  });

  it("generates a different token each time", () => {
    expect(generateInviteToken()).not.toBe(generateInviteToken());
  });

  it("hashes the same token to the same value", () => {
    expect(hashInviteToken("abc")).toBe(hashInviteToken("abc"));
    expect(hashInviteToken("abc")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashes different tokens to different values", () => {
    expect(hashInviteToken("abc")).not.toBe(hashInviteToken("abd"));
  });

  it("rejects malformed tokens", () => {
    expect(INVITE_TOKEN_PATTERN.test("short")).toBe(false);
    expect(INVITE_TOKEN_PATTERN.test("a".repeat(43) + "!")).toBe(false);
  });
});
