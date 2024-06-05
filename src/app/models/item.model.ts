import { Variation } from "./variation.model";

export class Item {
    id:number;
    price:number;
    name:string;
    variations:Variation[];
}
