/** Find the actual scrollport, excluding the document's implicit overflow. */
export function findScrollContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight) return parent;
    parent = parent.parentElement;
  }
  return null;
}

/** Keep shell chrome fixed when navigating inside a Desktop or Pocket app. */
export function scrollWithinContainer(target: HTMLElement, behavior: ScrollBehavior = "instant") {
  const container = findScrollContainer(target);
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  if (container) {
    const top = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - margin;
    container.scrollTo({ top, behavior });
    // A browser's initial fragment scroll may have moved the outer document.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  } else {
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - margin, behavior });
  }
}
