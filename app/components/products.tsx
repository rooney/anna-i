import React, { useEffect, useRef, useState } from 'react';
import { isFullyVisible} from '~/utils';
import styles from './products.module.css';

export default { lookup };
export type Product = {
  name: string;
  image: string;
}

export async function lookup(query:string) {
  const response = await fetch(lookup.endpoint + query);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const products = await response.json();
  return products.map((item: Product) => {
    item.image = import.meta.env.VITE_BACKEND + item.image;
    return item;
  });
}
lookup.endpoint = import.meta.env.VITE_BACKEND + 'api/products/?q=';

interface ShowcaseProps {
  products: Product[],
  cols: number,
}

export const Showcase: React.FC<ShowcaseProps> = ({ products, cols }) => {
  const
    [focus, setFocus] = useState<number>(-1),
    self = useRef<HTMLElement>(null),
    rows = Math.ceil(products.length / cols);


  function keepSize() {
    const
      showcase = self.current!,
      style = showcase.style;
    style.minWidth = showcase.offsetWidth + 'px';
    style.minHeight = showcase.offsetHeight + 'px';
  }

  useEffect(() => {
    const handleResize = () => {
      self.current?.removeAttribute('style');
    };
    window.addEventListener('resize', (handleResize));
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className={styles.showcase} ref={self} onTransitionEnd={keepSize}>
      {Array.from({ length: rows }, (_, i) => {
        const
          isFirstRow = rows > 1 && i === 0,
          isLastRow = rows > 1 && i === rows - 1,
          extraClass = isFirstRow ? styles.first : isLastRow ? styles.last : '',
          className = `${styles.row} ${extraClass}`;
        return (
          <div className={className} key={i}>
            {Array.from({ length: cols }, (_, j) => {
              const index = i*cols + j;
              if (index >= products.length) return;
              const
                item = products[index],
                alreadyFocus = focus === index;
              return (
                <figure key={j} className={focus === index ? styles.zoom : undefined}
                  onClick={(e) => {
                    setFocus(alreadyFocus ? -1 : index);
                    const target = e.currentTarget as HTMLElement;
                    if (!alreadyFocus) {
                      setTimeout(() => {
                        const [allinX, allinY] = isFullyVisible(target, {
                          marginBottom: isLastRow ? 60 : 40
                        });
                        if (allinX && allinY) return;

                        const options : ScrollIntoViewOptions = {
                          behavior: 'smooth',
                          inline: 'nearest',
                          block: 'nearest'
                        };
                        if (!allinX) options.inline = 'center';
                        if (!allinY) options.block = 'center';
                        target.scrollIntoView(options);
                      }, 500);
                    }
                  }
                }>
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
