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

export function classes(...classNames: (string|boolean|undefined|0)[]) {
  return classNames.filter((x) => x).join(' ');
}

export function isDesktop() {
  return window.matchMedia('(hover:hover)').matches;  
}

export default {classes, cssVar, cssIntVar, isDesktop, isFullyVisible, randomBetween};
