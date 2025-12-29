import { Table } from "./Table"

export class Reservation {
   uuid: string
   table: Table
   name: string
   phoneNumber?: string
   email?: string
   numberOfPeople: number
   date: Date
   checkedIn: boolean
}
