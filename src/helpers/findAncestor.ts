export const findAncestor = (element, selector: string) => {
  if (!element) {
    return null;
  }
  if (typeof element.closest === 'function') {
    return element.closest(selector) || null;
  }
  while (element) {
    if (element.matches(selector)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
};
