import { describe, expect, it } from "vitest";
import { formatDuration } from "./time";

describe("formatDuration", () => {
  it("formats hours and minutes", () => expect(formatDuration(138)).toBe("2h 18m"));
  it("clamps negative values", () => expect(formatDuration(-10)).toBe("0m"));
});
