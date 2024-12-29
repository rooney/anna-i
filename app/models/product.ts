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

export default { lookup };
