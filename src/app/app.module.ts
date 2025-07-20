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
import { ApolloModule } from "apollo-angular"

// Local modules
import { GraphQLModule } from "./graphql.module"
import { AppRoutingModule } from "./app-routing.module"

// Components
import { AppComponent } from "./app.component"
import { SettingsBarComponent } from "./components/settings/settings-bar/settings-bar.component"
import { MenuePageComponent } from "./pages/settings-pages/menue-page/menue-page.component"

// Pages
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { UserPageComponent } from "./pages/landing-pages/user-page/user-page.component"
import { RestaurantsPageComponent } from "./pages/landing-pages/restaurants-page/restaurants-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"

// Services
import { ApiService } from "./services/api-service"
import { AuthService } from "./services/auth-service"
import { DataService } from "./services/data-service"
import { SettingsService } from "./services/settings-service"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { SeparatePayPageComponent } from "./pages/cash-register-pages/separate-pay-page/separate-pay-page.component"
import { HeaderComponent } from "./components/cash-register/header/header.component"
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

@NgModule({
	declarations: [
		// Components
		AppComponent,
		HeaderComponent,
		SettingsBarComponent,
		// Pages
		LandingPageComponent,
		LandingOverviewPageComponent,
		LandingPricingPageComponent,
		UserPageComponent,
		RestaurantsPageComponent,
		LoginPageComponent,
		OnboardingPageComponent,
		TableOverviewPageComponent,
		BookingPageComponent,
		TransferPageComponent,
		SeparatePayPageComponent,
		//Settings-Pages
		SettingsPageComponent,
		MenuePageComponent,
		ItemsTableComponent,
		VariationsTableComponent,
		RestaurantOverviewComponent,
		RoomManagementComponent,
		EmployeeManagementComponent,
		MenuTableComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		FontAwesomeModule,
		ApolloModule,
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
		provideClientHydration(),
		provideHttpClient(withInterceptorsFromDi())
	]
})
export class AppModule {}
