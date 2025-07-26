import { Component } from "@angular/core"
import { Room, TableCombination } from "src/app/models/Room"
import { Table } from "src/app/models/Table"

@Component({
	selector: "app-room-management",
	templateUrl: "./room-management.component.html",
	styleUrl: "./room-management.component.scss",
	standalone: false
})
export class RoomManagementComponent {
	rooms: Room[] = []
	selectedRoom: Room | null = null

	// Raum bearbeiten
	editRoomMode = false
	editRoomName = ""

	// Für neue Räume/Tische/Kombis
	newRoomName = ""
	newTableNumber: number | null = null
	newTableSeats: number | null = null
	combinationTables: string[] = []
	combinationSeats: number | null = null

	// Mehrere Tische hinzufügen
	multiTableCount: number | null = null
	multiTableStartNumber: number | null = null
	multiTableSeats: number | null = null
	multiTablesToAdd: { number: number; seats: number }[] = []

	addRoom() {
		if (!this.newRoomName.trim()) return
		this.rooms.push({
			uuid: crypto.randomUUID(),
			name: this.newRoomName.trim(),
			tables: [],
			combinations: []
		})
		this.newRoomName = ""
	}

	selectRoom(room: Room) {
		this.selectedRoom = room
		this.combinationTables = []
		this.combinationSeats = null
		this.editRoomMode = false
		this.editRoomName = ""
		this.multiTablesToAdd = []
		// Nächsthöhere Tischnummer vorschlagen
		this.newTableNumber = this.getNextTableNumber(room)
	}

	editRoom(room: Room) {
		this.selectedRoom = room
		this.editRoomMode = true
		this.editRoomName = room.name
	}

	saveRoomName() {
		if (this.selectedRoom && this.editRoomName.trim()) {
			this.selectedRoom.name = this.editRoomName.trim()
			this.editRoomMode = false
		}
	}

	cancelEditRoom() {
		this.editRoomMode = false
		this.editRoomName = ""
	}

	deleteRoom(room: Room) {
		if (this.selectedRoom === room) this.selectedRoom = null
		this.rooms = this.rooms.filter(r => r !== room)
	}

	getNextTableNumber(room: Room): number {
		if (!room.tables.length) return 1
		return Math.max(...room.tables.map(t => Number(t.name))) + 1
	}

	addTable() {
		if (
			!this.selectedRoom ||
			this.newTableNumber == null ||
			this.newTableSeats == null
		)
			return
		this.selectedRoom.tables.push({
			uuid: crypto.randomUUID(),
			name: this.newTableNumber,
			seats: this.newTableSeats
		})
		// Nächsthöhere Nummer vorschlagen
		this.newTableNumber = this.getNextTableNumber(this.selectedRoom)
		this.newTableSeats = null
	}

	// Mehrere Tische vorbereiten
	prepareMultiTables() {
		if (
			!this.selectedRoom ||
			!this.multiTableCount ||
			!this.multiTableStartNumber ||
			!this.multiTableSeats
		)
			return
		this.multiTablesToAdd = []
		let start = this.multiTableStartNumber
		for (let i = 0; i < this.multiTableCount; i++) {
			this.multiTablesToAdd.push({
				number: start + i,
				seats: this.multiTableSeats
			})
		}
	}

	addMultiTables() {
		if (!this.selectedRoom) return
		for (const t of this.multiTablesToAdd) {
			this.selectedRoom.tables.push({
				uuid: crypto.randomUUID(),
				name: t.number,
				seats: t.seats
			})
		}
		this.multiTablesToAdd = []
		// Nächsthöhere Nummer vorschlagen
		this.newTableNumber = this.getNextTableNumber(this.selectedRoom)
	}

	removeTable(table: Table) {
		if (!this.selectedRoom) return
		this.selectedRoom.tables = this.selectedRoom.tables.filter(
			t => t.uuid !== table.uuid
		)
		this.selectedRoom.combinations = this.selectedRoom.combinations.filter(
			c => !c.tableUuids.includes(table.uuid)
		)
		// Nächsthöhere Nummer vorschlagen
		this.newTableNumber = this.getNextTableNumber(this.selectedRoom)
	}

	addCombination() {
		if (
			!this.selectedRoom ||
			this.combinationTables.length < 2 ||
			!this.combinationSeats
		)
			return
		const exists = this.selectedRoom.combinations.some(
			c =>
				c.tableUuids.length === this.combinationTables.length &&
				c.tableUuids.every(uuid => this.combinationTables.includes(uuid))
		)
		if (exists) return
		this.selectedRoom.combinations.push({
			tableUuids: [...this.combinationTables],
			seats: this.combinationSeats
		})
		this.combinationTables = []
		this.combinationSeats = null
	}

	removeCombination(combi: TableCombination) {
		if (!this.selectedRoom) return
		this.selectedRoom.combinations = this.selectedRoom.combinations.filter(
			c => c !== combi
		)
	}

	getTableNumber(room: Room, uuid: string): number | string {
		const t = room.tables.find(t => t.uuid === uuid)
		return t ? t.name : "?"
	}
}
