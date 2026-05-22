export function pickActiveSectionId(entries) {
  const visibleEntries = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => {
      if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
      const aTop = typeof a.boundingClientRect?.top === "number" ? Math.abs(a.boundingClientRect.top) : Number.POSITIVE_INFINITY;
      const bTop = typeof b.boundingClientRect?.top === "number" ? Math.abs(b.boundingClientRect.top) : Number.POSITIVE_INFINITY;
      return aTop - bTop;
    });

  if (visibleEntries.length === 0) return null;
  const top = visibleEntries[0];
  return top.id ?? top?.target?.getAttribute?.("id") ?? null;
}

export function updateSectionState(stateById, entries) {
  entries.forEach((entry) => {
    const id = entry?.target?.getAttribute?.("id");
    if (!id) return;
    stateById.set(id, {
      id,
      isIntersecting: Boolean(entry.isIntersecting),
      intersectionRatio: Number(entry.intersectionRatio ?? 0),
      boundingClientRect: entry.boundingClientRect ?? null
    });
  });
}

export function setCurrentLink(links, currentId) {
  links.forEach((link) => {
    const isActive = link.getAttribute("data-chapter-link") === currentId;
    link.toggleAttribute("data-current", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
