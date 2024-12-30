import { Product } from "./product";

export type Chat = 
  | { subject: string, matter: string | JSX.Element }
  | { translate: string } 
  | { searchResult: Product[] };
