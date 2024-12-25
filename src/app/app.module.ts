import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from "@angular/core"
import {
	BrowserModule,
	provideClientHydration
} from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { FormsModule } from "@angular/forms"

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

// Apollo
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { ApolloModule } from "apollo-angular"

// Local modules
import { GraphQLModule } from "./graphql.module"
import { AppRoutingModule } from "./app-routing.module"

// Components
import { AppComponent } from "./app.component"
import { SettingsBarComponent } from "./components/settings-bar/settings-bar.component"

// Pages
import { LandingPageComponent } from "./pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pricing-page/landing-pricing-page.component"
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component"
import { LoginPageComponent } from "./pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/booking-page/booking-page.component"

// Services
import { ApiService } from "./services/api-service"
import { AuthService } from "./services/auth-service"
import { DataService } from "./services/data-service"
import { TransferPageComponent } from "./pages/transfer-page/transfer-page.component"
import { SeparatePayComponent } from "./pages/separate-pay/separate-pay.component"
import { HeaderComponent } from "./components/header/header.component"
import { ServiceWorkerModule } from "@angular/service-worker"
import { MenuePageComponent } from "./settings_pages/menue-page/menue-page.component"

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
		ForgotPasswordPageComponent,
		LoginPageComponent,
		TableOverviewPageComponent,
		BookingPageComponent,
		TransferPageComponent,
		SeparatePayComponent,
		//Settings-Pages
		MenuePageComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
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
		ServiceWorkerModule.register("ngsw-worker.js", {
			enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: "registerWhenStable:30000"
		})
	],
	providers: [
		ApiService,
		AuthService,
		DataService,
		provideClientHydration(),
		provideHttpClient(withInterceptorsFromDi())
	]
})
export class AppModule {}
