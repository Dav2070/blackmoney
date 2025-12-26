import { Table } from "./Table"

export class ReservationDetails {
	uuid: string
	numberOfPeople: number
	table: Table
	reservationDate: Date
	reservationTime: string
	name: string
	phoneNumber?: string
	email?: string
	checkedIn: boolean
}
