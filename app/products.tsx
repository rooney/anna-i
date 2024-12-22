import React, { useState } from "react";
import styles from './products.module.css'

export type Product = {
  name: string;
  pic: string;
}

export async function lookup(query:string) {
  const response = await fetch(lookup.endpoint + query);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const products = await response.json();
  return products.map((item: Product) => {
    item.pic = import.meta.env.VITE_BACKEND + item.pic;
    return item;
  });
}
lookup.endpoint = import.meta.env.VITE_BACKEND + 'api/products/?q=';

export default {
  lookup: lookup,
};

interface ShowcaseProps {
  products: Product[];
}

export const Showcase:React.FC<ShowcaseProps> = ({ products }) => {
  function cssVar(name:string) {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
  }
  function cssIntVar(name:string, defaultValue?:number) {
    const value = parseInt(cssVar(name));
    return isNaN(value) && defaultValue ? defaultValue : value;
  }
  const
    [focus, setFocus] = useState<number>(-1),
    numProducts = products.length,
    screenWidth = window.innerWidth,
    maxChatsWidth = cssIntVar('--max-chats-width', screenWidth),
    availableWidth = Math.min(screenWidth, maxChatsWidth),
    thumbnailSize = cssIntVar('--thumbnail-size', 100),
    maxColumns = Math.floor(availableWidth / thumbnailSize) - 1,
    numRows = Math.ceil(numProducts / maxColumns),
    numCols = Math.ceil(numProducts / numRows);

  return (
    <section className={styles.products} style={{
      gridTemplateColumns: `repeat(${numCols}, ${thumbnailSize}px)`,
    }}>
      {products.map((item, index) => 
        <figure key={index}
          className={index === focus ? styles.focus : undefined}
          onClick={() => setFocus(index === focus ? -1 : index)}>
          <img src={item.pic}/>
          <figcaption>{item.name}</figcaption>
        </figure>
      )}
    </section>)
  ;
};
