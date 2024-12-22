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
  const [focus, setFocus] = useState(null);
  return (
    <ul className={styles.products}>
      {products.map((item, index) => 
        <li key={index}>
          <img src={item.pic}/>
          <caption>{item.name}</caption>
        </li>
      )}
    </ul>)
  ;
};
