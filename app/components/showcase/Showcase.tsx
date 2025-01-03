import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { translateX_of } from '~/utils';
import { type Product } from '~/models/product';
import css from './Showcase.module.css';

interface ShowcaseProps extends React.HTMLAttributes<HTMLUListElement> {
  products: Product[],
  cols: number,
}

export interface ShowcaseHandle extends HTMLUListElement {
  handleClick: (_:React.MouseEvent<HTMLElement>) => void;
}


export const Showcase = forwardRef<ShowcaseHandle, ShowcaseProps>(({products, cols, onClick, className, ...props}, ref) => {  
  const
    [focus, setFocus] = useState<number|undefined>(),
    showcase = useRef<HTMLUListElement>(null),
    figures = useRef<HTMLElement[]>([]),
    rows = useRef<HTMLLIElement[]>([]),
    numRows = Math.ceil(products.length / cols),
    addRow = (i: number) => (el: HTMLLIElement) => rows.current[i] = el,
    addFigure = (index: number) => (el: HTMLElement) => figures.current[index] = el;
  
  function setNoFocus() {
    if (focus === undefined) return;
    rows.current.forEach(row => row.style.transform = '');
    figures.current.forEach(fig => fig.style.transform = '');
    setTimeout(() => {
      figures.current[focus].removeAttribute('style');
    }, 300);
    return setFocus(undefined);
  }

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    const target = (e.target as HTMLElement);
    if (showcase.current?.contains(target) && target.matches('img, figcaption')) return;
    setNoFocus();
  }

  useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
  return (
    <ul ref={showcase} {...props} className={clsx(className, css.showcase)} onClick={(e) => {
      if (onClick) onClick(e);
      if (!e.defaultPrevented) handleClick(e);
    }}>
      {Array.from({ length: numRows }, (_, r) => {
        return (
          <li key={r} ref={addRow(r)}>
            {Array.from({ length: cols }, (_, c) => {
              const i = r*cols + c, item = products[i];
              function toggleFocus() {
                if (focus === i) return setNoFocus();
                const
                  sc = showcase.current!.getBoundingClientRect(),
                  fig = figures.current[i],
                  nudge = translateX_of(fig),
                  img = (fig.firstChild as HTMLElement).getBoundingClientRect(),
                  dl = Math.max(sc.left - img.left + nudge + img.width*.85, 0), // amount of left-side clipping after scaling
                  dr = Math.min(sc.right - img.right + nudge - img.width*.85, 0); // same, for right-side
                  
                rows.current.slice(0, r).forEach(row => // move rows-above upward
                  row.style.transform = 'translateY(-15px)'
                );
                rows.current.slice(r+1).forEach(row =>  // move rows-below downward
                  row.style.transform = 'translateY(25px)'
                );
                rows.current[r].removeAttribute('style');
                
                if (focus !== undefined) { // clear all transformations of previous focus
                  const focusRow = Math.floor(focus/cols);
                  figures.current.slice(focusRow*cols, focusRow*cols + cols).forEach(fig => 
                    fig.removeAttribute('style')
                  );
                }
                figures.current.slice(r*cols, i).forEach(fig => // push left all items on the left
                  fig.style.transform = `translateX(${dr - img.width*.5}px)`
                );
                figures.current.slice(i+1, Math.min(r*cols+cols, products.length)).forEach(fig => // push right all items on the right
                  fig.style.transform = `translateX(${dl + img.width*.5}px)`
                );
                figures.current[i].style.transform = `translateX(${dl||dr}px) translateY(25px)`;
                figures.current[i].style.zIndex = '1';
                setFocus(i);
              }
              return item && (
                <figure key={c} ref={addFigure(i)} className={clsx(focus === i && css.zoom)}>
                  <img src={item.image} onClick={toggleFocus}/>
                  <figcaption onClick={toggleFocus}>
                    <a>{item.name.replace(/ /g, '\u00A0')}</a>
                  </figcaption>
                </figure>
              );
            })}
          </li>
        )
      })}
    </ul>
  );
});

export default Showcase;
