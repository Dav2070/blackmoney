import {
	Component,
	PLATFORM_ID,
	Inject,
	ViewChild,
	ElementRef,
	Input,
	Output,
	EventEmitter
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { Room } from "src/app/models/Room"
import { convertRoomResourceToRoom } from "src/app/utils"

@Component({
	selector: "app-select-table-dialog",
	templateUrl: "./select-table-dialog.component.html",
	styleUrl: "./select-table-dialog.component.scss",
	standalone: false
})
export class SelectTableDialogComponent {
	locale = this.localizationService.locale.dialogs.selectTableDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() restaurantUuid: string = ""
	@Input() currentRoomUuid: string = ""
	@Input() currentTableUuid: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	rooms: Room[] = []
	selectedTableUuid: string = null
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

	constructor(
		private localizationService: LocalizationService,
		private apiService: ApiService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	async show() {
		if (this.rooms.length === 0) {
			const listRoomsResponse = await this.apiService.listRooms(
				`
					total
					items {
						uuid
						name
						tables {
							total
							items {
								uuid
								name
							}
						}
					}
				`,
				{ restaurantUuid: this.restaurantUuid }
			)

			if (listRoomsResponse.data?.listRooms.items != null) {
				for (let room of listRoomsResponse.data.listRooms.items) {
					this.rooms.push(convertRoomResourceToRoom(room))
				}
			}
		}

		this.visible = true
	}

	hide() {
		this.visible = false
	}

	selectTable(uuid: string) {
		this.selectedTableUuid = uuid
	}

	submit() {
		this.primaryButtonClick.emit({
			uuid: this.selectedTableUuid
		})
	}
}
