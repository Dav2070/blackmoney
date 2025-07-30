export interface Printer {
  uuid: string;
  name: string;
  ip: string;
  mac: string;
  dishes: string[]; // UUIDs der zugeordneten Kategorien
  drinks: string[]; // UUIDs der zugeordneten Kategorien
  menus: string[];      // UUIDs der zugeordneten Menüs
  specials: string[];   // UUIDs der zugeordneten Specials
}