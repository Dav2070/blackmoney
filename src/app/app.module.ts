import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
	BrowserModule,
	provideClientHydration
} from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"

// Material Design modules
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatCardModule } from "@angular/material/card"
import { MatSelectModule } from "@angular/material/select"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatMenuModule } from "@angular/material/menu"
import { MatListModule } from "@angular/material/list"
import { MatTabsModule } from "@angular/material/tabs"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatDialogModule } from "@angular/material/dialog"
import { MatSlideToggleModule } from "@angular/material/slide-toggle"
import { MatRadioModule } from "@angular/material/radio"
import { MatButtonToggleModule } from "@angular/material/button-toggle"

// Apollo
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"

// Local modules
import { GraphQLModule } from "./graphql.module"
import { AppRoutingModule } from "./app-routing.module"

// Components
import { AppComponent } from "./app.component"
import { HeaderComponent } from "./components/cash-register/header/header.component"
import { HeadlineComponent } from "./components/cash-register/headline/headline.component"
import { OrderItemCardComponent } from "./components/cash-register/order-item-card/order-item-card.component"
import { OfferOrderItemCardComponent } from "./components/cash-register/offer-order-item-card/offer-order-item-card.component"
import { CounterComponent } from "./components/cash-register/counter/counter.component"

// Dialogs
import { LogoutDialogComponent } from "./dialogs/logout-dialog/logout-dialog.component"
import { EditRegisterClientNameDialogComponent } from "./dialogs/edit-register-client-name-dialog/edit-register-client-name-dialog.component"
import { EditRestaurantNameDialogComponent } from "./dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "./dialogs/edit-address-dialog/edit-address-dialog.component"
import { AddEmployeeDialogComponent } from "./dialogs/add-employee-dialog/add-employee-dialog.component"
import { AddReservationDialogComponent } from "./dialogs/add-reservation-dialog/add-reservation-dialog.component"
import { EditReservationDialogComponent } from "./dialogs/edit-reservation-dialog/edit-reservation-dialog.component"
import { AddRegisterDialogComponent } from "./dialogs/add-register-dialog/add-register-dialog.component"
import { AddPrinterDialogComponent } from "./dialogs/add-printer-dialog/add-printer-dialog.component"
import { EditPrinterDialogComponent } from "./dialogs/edit-printer-dialog/edit-printer-dialog.component"
import { AddRoomDialogComponent } from "./dialogs/add-room-dialog/add-room-dialog.component"
import { EditRoomDialogComponent } from "./dialogs/edit-room-dialog/edit-room-dialog.component"
import { DeleteRoomDialogComponent } from "./dialogs/delete-room-dialog/delete-room-dialog.component"
import { AddTableDialogComponent } from "./dialogs/add-table-dialog/add-table-dialog.component"
import { EditTableDialogComponent } from "./dialogs/edit-table-dialog/edit-table-dialog.component"
import { DeleteTableDialogComponent } from "./dialogs/delete-table-dialog/delete-table-dialog.component"
import { SelectTableDialogComponent } from "./dialogs/select-table-dialog/select-table-dialog.component"
import { AddPrintRuleDialogComponent } from "./dialogs/add-print-rule-dialog/add-print-rule-dialog.component"
import { EditPrintRuleDialogComponent } from "./dialogs/edit-print-rule-dialog/edit-print-rule-dialog.component"
import { DeletePrintRuleDialogComponent } from "./dialogs/delete-print-rule-dialog/delete-print-rule-dialog.component"
import { ResetPasswordDialogComponent } from "./dialogs/reset-password-dialog/reset-password-dialog.component"
import { BillsOverviewDialogComponent } from "./dialogs/bills-overview-dialog/bills-overview-dialog.component"
import { SelectProductDialogComponent } from "./dialogs/select-product-dialog/select-product-dialog.component"
import { SelectMenuSpecialProductsDialogComponent } from "./dialogs/select-menu-special-products-dialog/select-menu-special-products-dialog.component"
import { SelectProductVariationsDialogComponent } from "./dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { SubtractProductVariationsDialogComponent } from "./dialogs/subtract-product-variations-dialog/subtract-product-variations-dialog.component"
import { MoveMultipleProductsDialogComponent } from "./dialogs/move-multiple-products-dialog/move-multiple-products-dialog.component"
import { AddNoteDialogComponent } from "./dialogs/add-note-dialog/add-note-dialog.component"
import { ViewNoteDialogComponent } from "./dialogs/view-note-dialog/view-note-dialog.component"
import { AddDiverseProductDialogComponent } from "./dialogs/add-diverse-product-dialog/add-diverse-product-dialog.component"
import { AddReviewDialogComponent } from "./dialogs/add-review-dialog/add-review-dialog.component"
import { ViewMenuDialogComponent } from "./dialogs/view-menu-dialog/view-menu-dialog.component"
import { ViewReviewsDialogComponent } from "./dialogs/view-reviews-dialog/view-reviews-dialog.component"
import { UploadImageDialogComponent } from "./dialogs/upload-image-dialog/upload-image-dialog.component"
import { AddTakeawayDialogComponent } from "./dialogs/add-takeaway-dialog/add-takeaway-dialog.component"
import { EditTakeawayDialogComponent } from "./dialogs/edit-takeaway-dialog/edit-takeaway-dialog.component"
import { TakeawayDialogComponent } from "./dialogs/takeaway-dialog/takeaway-dialog.component"
import { AddCategoryDialogComponent } from "./dialogs/add-category-dialog/add-category-dialog.component"
import { AddOfferDialogComponent } from "./dialogs/add-offer-dialog/add-offer-dialog.component"
import { EditOfferDialogComponent } from "./dialogs/edit-offer-dialog/edit-offer-dialog.component"
import { OfferBasicDataComponent } from "./dialogs/add-offer-dialog/offer-basic-data/offer-basic-data.component"
import { OfferItemsComponent } from "./dialogs/add-offer-dialog/offer-items/offer-items.component"
import { OfferAvailabilityComponent } from "./dialogs/add-offer-dialog/offer-availability/offer-availability.component"

// Pages
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { UserPageComponent } from "./pages/landing-pages/user-page/user-page.component"
import { GeneralSettingsPageComponent } from "./pages/landing-pages/general-settings-page/general-settings-page.component"
import { RestaurantsPageComponent } from "./pages/landing-pages/restaurants-page/restaurants-page.component"
import { RestaurantPageComponent } from "./pages/landing-pages/restaurant-page/restaurant-page.component"
import { RegistersPageComponent } from "./pages/landing-pages/registers-page/registers-page.component"
import { RegisterPageComponent } from "./pages/landing-pages/register-page/register-page.component"
import { RegisterClientPageComponent } from "./pages/landing-pages/register-client-page/register-client-page.component"
import { EmployeesPageComponent } from "./pages/landing-pages/employees-page/employees-page.component"
import { EmployeePageComponent } from "./pages/landing-pages/employee-page/employee-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { SetPasswordPageComponent } from "./pages/landing-pages/set-password-page/set-password-page.component"
import { DeviceSetupPageComponent } from "./pages/landing-pages/device-setup-page/device-setup-page.component"
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { CashRegisterPageComponent } from "./pages/cash-register-pages/cash-register-page/cash-register-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { PaymentPageComponent } from "./pages/cash-register-pages/payment-page/payment-page.component"
import { RoomsPageComponent } from "./pages/landing-pages/rooms-page/rooms-page.component"
import { RoomPageComponent } from "./pages/landing-pages/room-page/room-page.component"
import { TableCombinationsPageComponent } from "./pages/landing-pages/table-combinations-page/table-combinations-page.component"
import { OpeningTimePageComponent } from "./pages/landing-pages/opening-time-page/opening-time-page.component"
import { CategoryPageComponent } from "./pages/landing-pages/category-page/category-page.component"
import { CategoriesPageComponent } from "./pages/landing-pages/categories-page/categories-page.component"
import { VariationsPageComponent } from "./pages/landing-pages/variations-page/variations-page.component"
import { OfferCardComponent } from "./pages/landing-pages/category-page/offer-card/offer-card.component"
import { ProductCardComponent } from "./pages/landing-pages/category-page/product-card/product-card.component"

// Services
import { ApiService } from "./services/api-service"
import { AuthService } from "./services/auth-service"
import { DataService } from "./services/data-service"
import { SettingsService } from "./services/settings-service"
import { LocalizationService } from "./services/localization-service"

import { ServiceWorkerModule } from "@angular/service-worker"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatTooltipModule } from "@angular/material/tooltip"
import { PrintersPageComponent } from "./pages/landing-pages/printers-page/printers-page.component"
import { EditOwnerDialogComponent } from "./dialogs/edit-owner-dialog/edit-owner-dialog.component"
import { EditContactInfoDialogComponent } from "./dialogs/edit-contact-info-dialog/edit-contact-info-dialog.component"
import { MenuPageComponent } from "./pages/landing-pages/menu-page/menu-page.component"
import { LandingGuestsPageComponent } from "./pages/landing-pages/landing-guests-page/landing-guests-page.component"
import { RestaurantInfoPageComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-info-page.component"
import { RestaurantFiltersComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-filters/restaurant-filters.component"
import { RestaurantDetailsComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-details/restaurant-details.component"
import { RestaurantMenuComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-menu/restaurant-menu.component"
import { RestaurantReviewsComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-reviews/restaurant-reviews.component"
import { AddVariationDialogComponent } from "./dialogs/add-variation-dialog/add-variation-dialog.component"
import { AddVariationItemDialogComponent } from "./dialogs/add-variation-item-dialog/add-variation-item-dialog.component"
import { EditVariationDialogComponent } from "./dialogs/edit-variation-dialog/edit-variation-dialog.component"
import { EditVariationItemDialogComponent } from "./dialogs/edit-variation-item-dialog/edit-variation-item-dialog.component"
import { EditCategoryDialogComponent } from "./dialogs/edit-category-dialog/edit-category-dialog.component"
import { DeleteCategoryDialogComponent } from "./dialogs/delete-category-dialog/delete-category-dialog.component"
import { AddProductDialogComponent } from "./dialogs/add-product-dialog/add-product-dialog.component"
import { EditProductDialogComponent } from "./dialogs/edit-product-dialog/edit-product-dialog.component"
import { ReservationsPageComponent } from "./pages/landing-pages/reservations-page/reservations-page.component"

@NgModule({
	declarations: [
		// Components
		AppComponent,
		HeaderComponent,
		HeadlineComponent,
		OrderItemCardComponent,
		OfferOrderItemCardComponent,
		CounterComponent,
		// Dialogs
		LogoutDialogComponent,
		EditRegisterClientNameDialogComponent,
		EditRestaurantNameDialogComponent,
		EditAddressDialogComponent,
		AddEmployeeDialogComponent,
		AddReservationDialogComponent,
		EditReservationDialogComponent,
		AddRegisterDialogComponent,
		AddPrinterDialogComponent,
		EditPrinterDialogComponent,
		AddRoomDialogComponent,
		EditRoomDialogComponent,
		DeleteRoomDialogComponent,
		AddTableDialogComponent,
		EditTableDialogComponent,
		DeleteTableDialogComponent,
		SelectTableDialogComponent,
		AddPrintRuleDialogComponent,
		EditPrintRuleDialogComponent,
		DeletePrintRuleDialogComponent,
		ResetPasswordDialogComponent,
		BillsOverviewDialogComponent,
		SelectProductDialogComponent,
		SelectMenuSpecialProductsDialogComponent,
		SelectProductVariationsDialogComponent,
		SubtractProductVariationsDialogComponent,
		MoveMultipleProductsDialogComponent,
		AddNoteDialogComponent,
		ViewNoteDialogComponent,
		AddDiverseProductDialogComponent,
		AddReviewDialogComponent,
		ViewMenuDialogComponent,
		ViewReviewsDialogComponent,
		UploadImageDialogComponent,
		AddTakeawayDialogComponent,
		EditTakeawayDialogComponent,
		TakeawayDialogComponent,
		EditOwnerDialogComponent,
		EditContactInfoDialogComponent,
		AddCategoryDialogComponent,
		AddOfferDialogComponent,
		EditOfferDialogComponent,
		OfferBasicDataComponent,
		OfferItemsComponent,
		OfferAvailabilityComponent,
		AddVariationDialogComponent,
		AddVariationItemDialogComponent,
		EditVariationDialogComponent,
		EditVariationItemDialogComponent,
		EditCategoryDialogComponent,
		DeleteCategoryDialogComponent,
		AddProductDialogComponent,
		EditProductDialogComponent,
		// Pages
		LandingPageComponent,
		LandingOverviewPageComponent,
		LandingPricingPageComponent,
		UserPageComponent,
		GeneralSettingsPageComponent,
		RestaurantsPageComponent,
		RestaurantPageComponent,
		RegistersPageComponent,
		RegisterPageComponent,
		RegisterClientPageComponent,
		EmployeesPageComponent,
		EmployeePageComponent,
		LoginPageComponent,
		SetPasswordPageComponent,
		DeviceSetupPageComponent,
		OnboardingPageComponent,
		CashRegisterPageComponent,
		TableOverviewPageComponent,
		BookingPageComponent,
		TransferPageComponent,
		PaymentPageComponent,
		CategoryPageComponent,
		CategoriesPageComponent,
		MenuPageComponent,
		LandingGuestsPageComponent,
		RestaurantInfoPageComponent,
		RestaurantFiltersComponent,
		RestaurantDetailsComponent,
		RestaurantMenuComponent,
		RestaurantReviewsComponent,
		PrintersPageComponent,
		RoomsPageComponent,
		RoomPageComponent,
		TableCombinationsPageComponent,
		OpeningTimePageComponent,
		ReservationsPageComponent,
		VariationsPageComponent,
		OfferCardComponent,
		ProductCardComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		FontAwesomeModule,
		GraphQLModule,
		AppRoutingModule,
		// Material Design modules
		MatIconModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCardModule,
		MatSelectModule,
		MatToolbarModule,
		MatSidenavModule,
		MatListModule,
		MatMenuModule,
		MatTabsModule,
		MatCheckboxModule,
		MatDatepickerModule,
		MatSnackBarModule,
		MatDialogModule,
		MatSlideToggleModule,
		MatRadioModule,
		MatTooltipModule,
		MatButtonToggleModule,
		//ServiceWorker
		ServiceWorkerModule.register("ngsw-worker.js", {
			enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: "registerWhenStable:30000"
		}),
		MatTableModule,
		MatPaginatorModule,
		MatSortModule
	],
	providers: [
		ApiService,
		AuthService,
		DataService,
		SettingsService,
		LocalizationService,
		provideClientHydration(),
		provideHttpClient(withInterceptorsFromDi())
	]
})
export class AppModule {}
