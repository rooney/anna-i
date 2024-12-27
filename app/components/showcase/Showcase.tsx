import React, { useImperativeHandle, useState } from 'react';
import { Product } from '~/models/products';
import { classes } from '~/utils';
import styles from './showcase.module.css';

type ShowcaseProps = {
  products: Product[],
  cols: number,
  ref?: React.RefObject<ShowcaseHandle>,
} & Omit<React.ComponentPropsWithRef<'section'>, 'ref'>;

interface ShowcaseHandle {
  deselect: () => void;
}

export const Showcase = ({products, cols, ref, ...props}: ShowcaseProps) => {
  const
    [focus, setFocus] = useState<number|undefined>(),
    rows = Math.ceil(products.length / cols)

  useImperativeHandle(ref, () => ({ deselect: () => {
    setFocus(undefined);
  }}));

  return (
    <section className={classes(styles.showcase, focus !== undefined && styles.unzoom)} {...props}>
      {Array.from({ length: rows }, (_, i) => {
        const
          isFirstRow = rows > 1 && i === 0,
          isLastRow = rows > 1 && i === rows - 1;
        return (
          <div key={i} className={classes(styles.row, isFirstRow && styles.first, isLastRow && styles.last)}>
            {Array.from({ length: cols }, (_, j) => {
              const index = i*cols + j;
              if (index >= products.length) return;
              const item = products[index];
              return (
                <figure key={j} className={classes(focus === index && styles.zoom)}
                  onClick={() => setFocus(focus === index ? undefined : index)}>
                  <img src={item.image}/>
                  <figcaption>{item.name}</figcaption>
                </figure>
              );
            })}
          </div>
        )
      })}
    </section>
  );
};

export default Showcase;
