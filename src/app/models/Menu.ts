import { Category } from "./Category";
import { Product } from "./Product";

export type OfferType = 'NONE' | 'FIXED_PRICE' | 'DISCOUNT';
export type DiscountType = 'PERCENTAGE' | 'AMOUNT';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ValidityPeriod {
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    weekdays: Weekday[];
}

export interface MenuItem {
    uuid: string;
    name: string;
    categories: Category[];
    products: Product[];
    maxSelections: number;
}

export class Menu {
    uuid: string;
    id: number;
    name: string;
    offerType: OfferType;
    discountType?: DiscountType;
    offerValue: number;
    selectedProducts: Product[];
    validity: ValidityPeriod;
    items: MenuItem[];
}