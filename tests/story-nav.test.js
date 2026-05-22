import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { pickActiveSectionId, setCurrentLink, updateSectionState } from "../src/utils/storyNav.js";

describe("story nav scrollspy", () => {
  it("selects the most visible intersecting section", () => {
    const a = { id: "c1" };
    const b = { id: "c2" };
    const entries = [
      { isIntersecting: true, intersectionRatio: 0.35, target: { getAttribute: () => a.id } },
      { isIntersecting: true, intersectionRatio: 0.62, target: { getAttribute: () => b.id } }
    ];

    expect(pickActiveSectionId(entries)).toBe("c2");
  });

  it("clears previous active link when a new chapter becomes current", () => {
    const dom = new JSDOM(`
      <a data-chapter-link="c1" data-current aria-current="true"></a>
      <a data-chapter-link="c2"></a>
    `);
    const links = Array.from(dom.window.document.querySelectorAll("[data-chapter-link]"));

    setCurrentLink(links, "c2");

    const first = links[0];
    const second = links[1];

    expect(first.hasAttribute("data-current")).toBe(false);
    expect(first.hasAttribute("aria-current")).toBe(false);
    expect(second.hasAttribute("data-current")).toBe(true);
    expect(second.getAttribute("aria-current")).toBe("true");
  });

  it("keeps stable active chapter when callback only includes changed entries", () => {
    const state = new Map();
    updateSectionState(state, [
      {
        isIntersecting: true,
        intersectionRatio: 0.7,
        boundingClientRect: { top: 40 },
        target: { getAttribute: () => "c2" }
      },
      {
        isIntersecting: true,
        intersectionRatio: 0.6,
        boundingClientRect: { top: 180 },
        target: { getAttribute: () => "c3" }
      }
    ]);

    updateSectionState(state, [
      {
        isIntersecting: true,
        intersectionRatio: 0.2,
        boundingClientRect: { top: 20 },
        target: { getAttribute: () => "c1" }
      }
    ]);

    expect(pickActiveSectionId(Array.from(state.values()))).toBe("c2");
  });
});
