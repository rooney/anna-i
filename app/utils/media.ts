export function isDesktop() {
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

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default { isDesktop, isFullyVisible, randomBetween };
