import { describe, expect, it } from "vitest";
import { extractChatText } from "./puter";

describe("Puter response handling", () => {
  it("normalizes the documented message response", () => {
    expect(extractChatText({ message: { content: "A storm over the Volga" } })).toBe("A storm over the Volga");
  });

  it("normalizes a choices response", () => {
    expect(extractChatText({ choices: [{ message: { content: "Scene 01" } }] })).toBe("Scene 01");
  });

  it("keeps plain text responses intact", () => {
    expect(extractChatText("direct response")).toBe("direct response");
  });
});
