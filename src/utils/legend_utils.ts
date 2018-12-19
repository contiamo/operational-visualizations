// Width of legend, rounded up to nearest full pixel
export const roundedUpWidth = (el: Element) => Math.ceil(el.getBoundingClientRect().width);

// Height of legend, rounded up to nearest full pixel
export const roundedUpHeight = (el: Element) => Math.ceil(el.getBoundingClientRect().height);

// Total width of left and right margins
export const widthMargin = (el: Element) => {
  if (!el) {
    return 0;
  }
  const style = window.getComputedStyle(el);
  return parseFloat(style.marginLeft || "0") + parseFloat(style.marginRight || "0");
};

// Total width of left and right padding
export const widthPadding = (el: Element) => {
  if (!el) {
    return 0;
  }
  const style = window.getComputedStyle(el);
  return parseFloat(style.paddingLeft || "0") + parseFloat(style.paddingRight || "0");
};

// Total height of top and bottom margins
export const heightMargin = (el: Element) => {
  if (!el) {
    return 0;
  }
  const style = window.getComputedStyle(el);
  return parseFloat(style.marginTop || "0") + parseFloat(style.marginBottom || "0");
};

// Total legend width
export const totalWidth = (el: Element) => {
  if (!el) {
    return 0;
  }
  const style = window.getComputedStyle(el);
  const border = parseFloat(style.borderLeftWidth || "0") + parseFloat(style.borderRightWidth || "0");
  return roundedUpWidth(el) + widthMargin(el) - widthPadding(el) + border;
};

// Total legend height
export const totalHeight = (el: Element) => {
  if (!el) {
    return 0;
  }
  const style = window.getComputedStyle(el);
  const padding = parseFloat(style.paddingTop || "0") + parseFloat(style.paddingBottom || "0");
  const border = parseFloat(style.borderTopWidth || "0") + parseFloat(style.borderBottomWidth || "0");
  return roundedUpHeight(el) + heightMargin(el) - padding + border;
};
