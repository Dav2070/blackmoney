import {
	Component,
	ViewChild,
	ElementRef,
	EventEmitter,
	Output,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { faCloudArrowUp } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-upload-image-dialog",
	templateUrl: "./upload-image-dialog.component.html",
	styleUrl: "./upload-image-dialog.component.scss",
	standalone: false
})
export class UploadImageDialogComponent {
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Output() imageUploaded = new EventEmitter<string>()

	visible: boolean = false
	isDragging = false
	locale = this.localizationService.locale.dialogs.uploadImageDialog

	faCloudArrowUp = faCloudArrowUp

	constructor(
		private localizationService: LocalizationService,
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

	open() {
		this.visible = true
		this.isDragging = false
	}

	close() {
		this.visible = false
		this.isDragging = false
	}

	onFileSelected(event: any) {
		const file = event.target.files[0]
		if (file) {
			this.handleFile(file)
		}
	}

	onDragOver(event: DragEvent) {
		event.preventDefault()
		event.stopPropagation()
		this.isDragging = true
	}

	onDragLeave(event: DragEvent) {
		event.preventDefault()
		event.stopPropagation()
		this.isDragging = false
	}

	onDrop(event: DragEvent) {
		event.preventDefault()
		event.stopPropagation()
		this.isDragging = false

		const files = event.dataTransfer?.files
		if (files && files.length > 0) {
			const file = files[0]
			if (file.type.startsWith("image/")) {
				this.handleFile(file)
			} else {
				alert(this.locale.invalidFileType)
			}
		}
	}

	private handleFile(file: File) {
		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert(this.locale.fileTooLarge)
			return
		}

		// Read file and convert to data URL
		const reader = new FileReader()
		reader.onload = (e: any) => {
			const imageUrl = e.target.result
			this.imageUploaded.emit(imageUrl)
			this.close()
		}

		reader.readAsDataURL(file)
	}
}
