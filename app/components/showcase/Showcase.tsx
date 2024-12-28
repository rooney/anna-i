import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Product } from '~/models/products';
import { classes } from '~/utils';
import styles from './showcase.module.css';

interface ShowcaseProps extends React.HTMLAttributes<HTMLUListElement> {
  products: Product[],
  cols: number,
}

export interface ShowcaseHandle extends HTMLUListElement {
  handleClick: (_:React.MouseEvent<HTMLElement>) => void;
}

export const Showcase = forwardRef<ShowcaseHandle, ShowcaseProps>(({products, cols, className, onClick, ...props}, ref) => {
  const
    [focus, setFocus] = useState<number|undefined>(),
    showcase = useRef<HTMLUListElement>(null),
    rows = Math.ceil(products.length / cols);

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    if (e.target instanceof HTMLElement && showcase.current?.contains(e.target) && e.target.matches('img, figcaption')) return;
    setFocus(undefined);
  }

  useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
  return (
    <ul ref={showcase} {...props} onClick={(e) => {if (onClick) onClick(e); handleClick(e);}}
      className={classes(className, styles.showcase, focus !== undefined && styles.unzoom)}>
      {Array.from({ length: rows }, (_, i) => {
        const
          isFirstRow = rows > 1 && i === 0,
          isLastRow = rows > 1 && i === rows - 1;
        return (
          <li key={i} className={classes(styles.row, isFirstRow && styles.first, isLastRow && styles.last)}>
            {Array.from({ length: cols }, (_, j) => {
              const index = i*cols + j;
              if (index >= products.length) return;

              const item = products[index];
              function toggleFocus() {
                setFocus(focus === index ? undefined : index);
              } 
              return (
                <figure key={j} className={classes(focus === index && styles.zoom)}>
                  <img src={item.image} onClick={toggleFocus}/>
                  <figcaption onClick={toggleFocus}>{item.name}</figcaption>
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
