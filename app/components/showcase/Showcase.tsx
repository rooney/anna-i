import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
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
    showcase = useRef<HTMLUListElement>(null),
    figures = useRef<HTMLElement[]>([]),
    focus = useRef<number>(),
    rows = useRef<HTMLLIElement[]>([]),
    numRows = Math.ceil(products.length / cols),
    addRow = (i: number) => (el: HTMLLIElement) => rows.current[i] = el,
    addFigure = (index: number) => (el: HTMLElement) => figures.current[index] = el,
    addImage = (img: HTMLImageElement) => img && observer.observe(img),
    pending = useRef<number>(products.length),
    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.height) {
          entry.target.parentElement!.style.width = entry.contentRect.width + 'px';
          if (!--pending.current) {
            observer.disconnect();
          }
        }
      }
    });

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    const target = (e.target as HTMLElement);
    if (showcase.current?.contains(target) && target.matches('img, figcaption')) return;
    unfocus();
  }

  function rowup(row: HTMLLIElement) {
    row.classList.add(css.rowup);
    row.classList.remove(css.rowdown);
  }

  function rowdown(row: HTMLLIElement) {
    row.classList.add(css.rowdown);
    row.classList.remove(css.rowup);
  }

  function rowback(row: HTMLLIElement) {
    row.classList.remove(css.rowup, css.rowdown);
  }

  function unfocus() {
    unzoom();
    rows.current.forEach(rowback);
    focus.current = undefined;
  }

  function unzoom() {
    const zoomed = focus.current;
    if (zoomed === undefined) return;

    const
      zoomedFig = figures.current[zoomed],
      zoomedRow = Math.floor(zoomed/cols),
      figuresInZoomedRow = figures.current.slice(zoomedRow*cols, zoomedRow*cols + cols);
      
    figuresInZoomedRow.forEach(el => el.style.transform = '');
    zoomedFig.classList.remove(css.zoom);
    zoomedFig.style.zIndex = '1';
    setTimeout(() =>  // wait until the animation is halfway before clearing the z-index
      zoomedFig.style.zIndex = ''
    , 125);
  }
  
  useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
  return useMemo(() =>
    <ul ref={showcase} {...props} className={clsx(className, css.showcase)} onClick={(e) => {
      if (onClick) onClick(e);
      if (!e.defaultPrevented) handleClick(e);
    }}>
      {Array.from({ length: numRows }, (_, r) => {
        return (
          <li key={r} ref={addRow(r)}>
            {Array.from({ length: cols }, (_, c) => {
              const
                i = r*cols + c,
                item = products[i];

              function toggleFocus() {
                const zoomed = focus.current;
                if (zoomed === i) return unfocus();
                if (zoomed !== undefined) unzoom();
                const
                  fig = figures.current[i],
                  showcaseRect = showcase.current!.getBoundingClientRect(),
                  imgRect = (fig.firstChild as HTMLImageElement).getBoundingClientRect(),
                  nudge = translateX_of(fig),
                  leftClip = Math.max(showcaseRect.left - imgRect.left + nudge + imgRect.width*.85, 0),
                  rightClip = Math.min(showcaseRect.right - imgRect.right + nudge - imgRect.width*.85, 0);
                  
                rows.current.slice(0, r).forEach(rowup);
                rows.current.slice(r+1).forEach(rowdown);
                rowback(rows.current[r]);
                
                figures.current.slice(r*cols, i).forEach(fig => // push left all items on the left
                  fig.style.transform = `translateX(${rightClip - imgRect.width*.5}px)`
                );
                figures.current.slice(i+1, Math.min(r*cols+cols, products.length)).forEach(fig => // push right all items on the right
                  fig.style.transform = `translateX(${leftClip + imgRect.width*.5}px)`
                );

                fig.classList.add(css.zoom);
                fig.style.transform = `translateX(${leftClip || rightClip}px) translateY(25px)`;
                fig.style.zIndex = '1';
                focus.current = i;
              }
              return item && (
                <figure key={c} ref={addFigure(i)}>
                  <img ref={addImage} src={item.image} onClick={toggleFocus}/>
                  <figcaption onClick={toggleFocus}>
                    {item.name.replace(/ /g, '\u00A0').replace(/-/g, '\u2011')}
                  </figcaption>
                </figure>
              );
            })}
          </li>
        )
      })}
    </ul>
  , [products, cols]);
});

export default Showcase;
