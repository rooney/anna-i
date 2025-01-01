import { Product } from "./product";

export type Chat = 
  | { subject: string, matter: string | JSX.Element }
  | { translationRequest: string } 
  | { searchResult: Product[] };
