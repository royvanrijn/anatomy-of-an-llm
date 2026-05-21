export function pickActiveSectionId(entries) {
  const visibleEntries = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visibleEntries.length === 0) return null;
  return visibleEntries[0].target.getAttribute("id");
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
