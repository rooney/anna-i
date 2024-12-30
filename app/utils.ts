export function cssVar(varname: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(varname);
}

export function cssIntVar(varname: string, defaultValue?: number) {
  const value = parseInt(cssVar(varname));
  return isNaN(value) && defaultValue ? defaultValue : value;
}

export function isFullyVisible(
  element: HTMLElement, 
  options: {
    marginTop?: number,
    marginRight?: number,
    marginBottom?: number,
    marginLeft?: number,
  }
): [boolean, boolean] {
  const
    marginTop = options.marginTop || 0,
    marginRight = options.marginRight || 0,
    marginBottom = options.marginBottom || 0,
    marginLeft = options.marginLeft || 0,
    maxX = window.innerWidth - marginRight,
    maxY = window.innerHeight - marginBottom,
    rect = element.getBoundingClientRect();
  return [
    rect.left >= marginLeft && rect.right <= maxX,
    rect.top >= marginTop && rect.bottom <= maxY,
  ];
}

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function isDesktop() {
  return window.matchMedia('(hover:hover)').matches;  
}

export function offsetBetween(el: HTMLElement, el2: HTMLElement): { top: number; left: number } {
  const rect = el.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  return {
    top: rect2.top - rect.top,
    left: rect2.left - rect.left,
  };
}

export default { cssVar, cssIntVar, isDesktop, isFullyVisible, offsetBetween, randomBetween };
