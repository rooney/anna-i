export type Product = {
  name: string;
  pic: string;
}

export default {
  lookup: async (query:string) => {
    return await fetch(import.meta.env.VITE_PRODUCTS_URL + query);
  }
}
