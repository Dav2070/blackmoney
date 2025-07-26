import { TSE } from "./tse.model"

export interface OpeningPeriod {
	from: string // "09:00"
	to: string // "14:00"
}

export interface OpeningDaysGroup {
	days: string[] // z.B. ["Montag", "Dienstag"]
	periods: OpeningPeriod[]
}

export interface Adresse {
	strasse?: string
	plz?: string
	ort?: string
	land?: string
}

export interface SpecialDay {
	from: string
	to: string
	reason?: string
	openType: "geschlossen" | "durchgehend" | "pause"
	periods: OpeningPeriod[]
}

export interface RestaurantSettings {
	name: string
	adresse?: Adresse
	telefonnummer?: string
	email?: string
	steuerId?: string
	inhaber?: string
	openingDaysGroups: OpeningDaysGroup[]
	tses?: TSE[]
	specialDays?: SpecialDay[]
}
