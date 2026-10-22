import { describe, expect, it } from "vitest";
import { referralJoinUrl } from "./join-fields";
describe("team referral links", () => {
  it("carries the sponsor and Left Team selection", () => {
    const url = new URL(referralJoinUrl("https://example.test", "ABC123", "L"));
    expect(url.pathname).toBe("/join");
    expect(url.searchParams.get("ref")).toBe("ABC123");
    expect(url.searchParams.get("team")).toBe("L");
  });
  it("produces a distinct Right Team link", () => {
    const right = referralJoinUrl("https://example.test", "ABC123", "R");
    expect(new URL(right).searchParams.get("team")).toBe("R");
    expect(right).not.toBe(referralJoinUrl("https://example.test", "ABC123", "L"));
  });
});