export default {
    cssVar,
    cssIntVar,
    isDesktop,
    isFullyVisible,
    tMatrix_of,
    translateX_of,
    translateY_of,
    tRect_of,
};

export interface TRect extends DOMRect {
  translateX: number,
  translateY: number,
}

export function cssVar(varname: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varname);
}

export function cssIntVar(varname: string, defaultValue?: number): number {
  const value = parseInt(cssVar(varname));
  return isNaN(value) && defaultValue ? defaultValue : value;
}

export function isDesktop(): boolean {
  return window.matchMedia('(hover:hover)').matches;  
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
    maxRight = window.innerWidth - marginRight,
    maxBottom = window.innerHeight - marginBottom,
    rect = element.getBoundingClientRect();
  return [
    rect.left >= marginLeft && rect.right <= maxRight,
    rect.top >= marginTop && rect.bottom <= maxBottom,
  ];
}

export function tMatrix_of(el: HTMLElement): DOMMatrix {
    return new DOMMatrix(window.getComputedStyle(el).transform);
}

export function translateX_of(el: HTMLElement): number {
    return tMatrix_of(el).m41;
}

export function translateY_of(el: HTMLElement): number {
    return tMatrix_of(el).m42;
}

export function tRect_of(el: HTMLElement): TRect {
  const
    matrix = tMatrix_of(el),
    rect = el.getBoundingClientRect() as TRect;
  rect.translateX = matrix.m41;
  rect.translateY = matrix.m42;
  return rect;
}
