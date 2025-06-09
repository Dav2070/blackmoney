export interface OpeningPeriod {
    from: string; // "09:00"
    to: string;   // "14:00"
}

export interface OpeningDaysGroup {
    days: string[]; // z.B. ["Montag", "Dienstag"]
    periods: OpeningPeriod[];
}

export interface RestaurantSettings {
    name: string;
    openingDaysGroups: OpeningDaysGroup[];
}