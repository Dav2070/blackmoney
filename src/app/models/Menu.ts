import { Category } from "./Category";
import { Product } from "./Product";

export class Menu {
    uuid: string;
    name: string;
    categories: Category[];
    selectedProducts: Product[];
    isActive: boolean;
}