export type Product = {
  name: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
}

export async function lookup(query:string) {
  const response = await fetch(lookup.endpoint + query);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const products = await response.json();
  return products.map((item: Product) => {
    item.image.src = import.meta.env.VITE_BACKEND + item.image.src;
    return item;
  });
}
lookup.endpoint = import.meta.env.VITE_BACKEND + 'api/products/?q=';

export default { lookup };
