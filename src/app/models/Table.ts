export class Table {
	uuid: string
	name: number // Tischnummer
	seats?: number // Sitzplätze
}

export class TableCombination {
	uuid: string;
  	name: number[];
  	seats?: number;
}