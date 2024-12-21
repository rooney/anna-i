export type Product = {
  name: string;
  pic: string;
}

const products_url = import.meta.env.VITE_BACKEND + 'api/products/?q='
export default {
  lookup: (query:string) => {
    return fetch(products_url + query)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((products) => {
        return products.map((item:Product) => {
          item.pic = import.meta.env.VITE_BACKEND + item.pic;
          return item;
        })
      });
  }
}
