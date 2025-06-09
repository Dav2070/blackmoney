import { Table } from "./Table";

export class TableCombination {
	tableUuids: string[]; // UUIDs der kombinierten Tische
	seats: number;        // Sitzplätze, wenn kombiniert
}

export class Room {
	uuid: string;
	name: string;
	tables: Table[];
	combinations?: TableCombination[];
}
