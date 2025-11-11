import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from "@angular/core"
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

// Apollo
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"

// Local modules
import { GraphQLModule } from "./graphql.module"
import { AppRoutingModule } from "./app-routing.module"

// Components
import { AppComponent } from "./app.component"
import { MenuePageComponent } from "./pages/settings-pages/menue-page/menue-page.component"
import { SettingsBarComponent } from "./components/settings/settings-bar/settings-bar.component"
import { HeaderComponent } from "./components/cash-register/header/header.component"
import { HeadlineComponent } from "./components/cash-register/headline/headline.component"
import { OrderItemCardComponent } from "./components/cash-register/order-item-card/order-item-card.component"
import { OfferOrderItemCardComponent } from "./components/cash-register/offer-order-item-card/offer-order-item-card.component"

// Dialogs
import { LogoutDialogComponent } from "./dialogs/logout-dialog/logout-dialog.component"
import { EditDeviceNameDialogComponent } from "./dialogs/edit-device-name-dialog/edit-device-name-dialog.component"
import { EditRestaurantNameDialogComponent } from "./dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "./dialogs/edit-address-dialog/edit-address-dialog.component"
import { AddEmployeeDialogComponent } from "./dialogs/add-employee-dialog/add-employee-dialog.component"
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
import { ResetPasswordDialogComponent } from "./dialogs/reset-password-dialog/reset-password-dialog.component"
import { SelectProductDialogComponent } from "./dialogs/select-product-dialog/select-product-dialog.component"
import { SelectProductVariationsDialogComponent } from "./dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { MoveMultipleProductsDialogComponent } from "./dialogs/move-multiple-products-dialog/move-multiple-products-dialog.component"
import { AddNoteDialogComponent } from "./dialogs/add-note-dialog/add-note-dialog.component"
import { ViewNoteDialogComponent } from "./dialogs/view-note-dialog/view-note-dialog.component"

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
import { EmployeesPageComponent } from "./pages/landing-pages/employees-page/employees-page.component"
import { EmployeePageComponent } from "./pages/landing-pages/employee-page/employee-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { SetPasswordPageComponent } from "./pages/landing-pages/set-password-page/set-password-page.component"
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { CashRegisterPageComponent } from "./pages/cash-register-pages/cash-register-page/cash-register-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { PaymentPageComponent } from "./pages/cash-register-pages/payment-page/payment-page.component"
import { RoomsPageComponent } from "./pages/landing-pages/rooms-page/rooms-page.component"
import { RoomPageComponent } from "./pages/landing-pages/room-page/room-page.component"
import { TableCombinationsPageComponent } from "./pages/landing-pages/table-combinations-page/table-combinations-page.component"

// Services
import { ApiService } from "./services/api-service"
import { AuthService } from "./services/auth-service"
import { DataService } from "./services/data-service"
import { SettingsService } from "./services/settings-service"
import { LocalizationService } from "./services/localization-service"

import { ServiceWorkerModule } from "@angular/service-worker"
import { SettingsPageComponent } from "./pages/settings-pages/settings-page/settings-page.component"
import { ItemsTableComponent } from "./components/settings/items-table/items-table.component"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { VariationsTableComponent } from "./components/settings/variations-table/variations-table.component"
import { RestaurantOverviewComponent } from "./pages/settings-pages/restaurant-overview/restaurant-overview.component"
import { MatTooltipModule } from "@angular/material/tooltip"
import { RoomManagementComponent } from "./pages/settings-pages/room-management/room-management.component"
import { EmployeeManagementComponent } from "./pages/settings-pages/employee-management/employee-management.component"
import { MenuTableComponent } from "./components/settings/menu-table/menu-table.component"
import { SpecialsTableComponent } from "./components/settings/specials-table/specials-table.component"
import { PrintersPageComponent } from "./pages/landing-pages/printers-page/printers-page.component"

@NgModule({
	declarations: [
		// Components
		AppComponent,
		SettingsBarComponent,
		HeaderComponent,
		HeadlineComponent,
		OrderItemCardComponent,
		OfferOrderItemCardComponent,
		// Dialog
		LogoutDialogComponent,
		EditDeviceNameDialogComponent,
		EditRestaurantNameDialogComponent,
		EditAddressDialogComponent,
		AddEmployeeDialogComponent,
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
		ResetPasswordDialogComponent,
		SelectProductDialogComponent,
		SelectProductVariationsDialogComponent,
		MoveMultipleProductsDialogComponent,
		AddNoteDialogComponent,
		ViewNoteDialogComponent,
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
		EmployeesPageComponent,
		EmployeePageComponent,
		LoginPageComponent,
		SetPasswordPageComponent,
		OnboardingPageComponent,
		CashRegisterPageComponent,
		TableOverviewPageComponent,
		BookingPageComponent,
		TransferPageComponent,
		PaymentPageComponent,
		//Landing-Pages
		PrintersPageComponent,
		RoomsPageComponent,
		RoomPageComponent,
		TableCombinationsPageComponent,
		//Settings-Pages
		SettingsPageComponent,
		MenuePageComponent,
		ItemsTableComponent,
		VariationsTableComponent,
		RestaurantOverviewComponent,
		RoomManagementComponent,
		EmployeeManagementComponent,
		MenuTableComponent,
		SpecialsTableComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent],
	imports: [
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
