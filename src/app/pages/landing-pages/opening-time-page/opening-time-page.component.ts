import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import {
	faLocationDot,
	faPen,
	faPrint,
	faSeat
} from "@fortawesome/pro-regular-svg-icons"
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "src/app/dialogs/edit-address-dialog/edit-address-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"
import { EditOwnerDialogComponent } from "src/app/dialogs/edit-owner-dialog/edit-owner-dialog.component"
import { EditContactInfoDialogComponent } from "src/app/dialogs/edit-contact-info-dialog/edit-contact-info-dialog.component"

@Component({
  selector: 'app-opening-time-page',
  templateUrl: './opening-time-page.component.html',
  styleUrl: './opening-time-page.component.scss',
  standalone: false
})
export class OpeningTimePageComponent {
  constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}


  
}
