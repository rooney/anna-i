import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { translateX_of } from '~/utils';
import { type Product } from '~/models/product';
import css from './Showcase.module.css';

interface ShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  products: Product[],
  cols: number,
}

export interface ShowcaseHandle extends HTMLDivElement {
  handleClick: (_:React.MouseEvent<HTMLElement>) => void;
}

export const Showcase = forwardRef<ShowcaseHandle, ShowcaseProps>(({products, cols, onClick, className, ...props}, ref) => {
  const
    [focus, setFocus] = useState<number|undefined>(),
    showcase = useRef<HTMLDivElement>(null),
    zoomer = useRef<HTMLUListElement>(null),
    figures = useRef<HTMLElement[]>([]),
    rows = useRef<HTMLLIElement[]>([]),
    numRows = Math.ceil(products.length / cols),
    addRow = (i: number) => (el: HTMLLIElement) => rows.current[i] = el,
    addFigure = (index: number) => (el: HTMLElement) => figures.current[index] = el;
  
  function setNoFocus() {
    rows.current.forEach(row => row.style.transform = '');
    figures.current.forEach(fig => fig.style.transform = '');
    return setFocus(undefined);
  }

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    const target = (e.target as HTMLElement);
    if (showcase.current?.contains(target) && target.matches('img, figcaption')) return;
    setNoFocus();
  }

  useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
  return (
    <div ref={showcase} {...props} className={clsx(className, css.showcase)} onClick={(e) => {
      if (onClick) onClick(e);
      if (!e.defaultPrevented) handleClick(e);
    }}>
      <ul ref={zoomer}>
        {Array.from({ length: numRows }, (_, r) => {
          const isTopRow = r === 0;
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
                    cap = (fig.children[1] as HTMLElement).getBoundingClientRect(),
                    row = (rows.current[r]).getBoundingClientRect(),
                    dh = Math.max(2*img.height + cap.height - row.height, 0), // how much vertical space needed for scaling
                    dl = Math.max(sc.left - img.left + nudge + img.width/2, 0), // amount of left-side clipping after scaling
                    dr = Math.min(sc.right - img.right + nudge - img.width/2, 0); // same, for right-side
                    
                  if (isTopRow) { // move all rows downward
                    rows.current.forEach(row => 
                      row.style.transform = `translateY(${dh}px)`
                    );
                  }
                  else {
                    rows.current.slice(0, r).forEach(row => // move rows-above upward
                      row.style.transform = `translateY(${-dh}px)`
                    );
                    rows.current.slice(r).forEach(row =>  // the remaining rows stay in place
                      row.style.transform = ''
                    );
                  }
                  
                  if (focus !== undefined) { // clear all transformations of previous focus
                    const focusRow = Math.floor(focus/cols);
                    figures.current.slice(focusRow*cols, focusRow*cols + cols).forEach(fig => 
                      fig.style.transform = ''
                    );
                  }
                  figures.current.slice(r*cols, i).forEach(fig => // push left all items on the left
                    fig.style.transform = `translateX(${dr - img.width/2}px)`
                  );
                  figures.current.slice(i+1, Math.min(r*cols+cols, products.length)).forEach(fig => // push right all items on the right
                    fig.style.transform = `translateX(${dl + img.width/2}px)`
                  );
                  figures.current[i].style.transform = `translateX(${dl||dr}px)`;
                  setFocus(i);
                }
                return item && (
                  <figure key={c} ref={addFigure(i)} className={clsx(focus === i && css.zoom)}>
                    <img src={item.image} onClick={toggleFocus}/>
                    <figcaption onClick={toggleFocus}>{item.name}</figcaption>
                  </figure>
                );
              })}
            </li>
          )
        })}
      </ul>
    </div>
  );
});

export default Showcase;
