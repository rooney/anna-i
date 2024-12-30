import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { type Product } from '~/models/product';
import { offsetBetween } from '~/utils';
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

  function handleClick(e: React.MouseEvent<HTMLElement>) {
  }

  useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
  return (
    <div ref={showcase} {...props} className={clsx(className, css.showcase)} onClick={(e) => {
      if (onClick) onClick(e);
      if (!e.defaultPrevented) handleClick(e);
    }}>
      <ul ref={zoomer}>
        {Array.from({ length: numRows }, (_, i) => {
          return (
            <li key={i} ref={addRow(i)}>
              {Array.from({ length: cols }, (_, j) => {
                const index = i*cols + j;
                if (index >= products.length) return;
                const item = products[index];

                function toggleFocus() {
                  const offset = offsetBetween(zoomer.current!, figures.current[index]);
                  if (j > 0) offset.left += 50;
                  if (cols > 1 && j === cols - 1) offset.left += 50;
                  if (i > 0) offset.top += figures.current[index].getBoundingClientRect().height/2;
                  if (numRows > 1 && i === numRows - 1) offset.top += figures.current[index].getBoundingClientRect().height/2;
                  
                  if (focus === undefined)
                    zoomer.current!.style.transform = `scale(2) translateX(${-offset.left/2}px) translateY(${-offset.top/2}px)`;
                  else
                    zoomer.current!.style.transform = '';
                  setFocus(focus === undefined ? index : undefined);
                } 
                return (
                  <figure key={j} ref={addFigure(index)}>
                    <div><img src={item.image} onClick={toggleFocus}/></div>
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
