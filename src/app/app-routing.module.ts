import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { LandingPageComponent } from "./pages/landing-page/landing-page.component"
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component"
import { LoginPageComponent } from "./pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/transfer-page/transfer-page.component"

const routes: Routes = [
	{
		path: "",
		component: LandingPageComponent
	},
	{
		path: "login",
		component: LoginPageComponent
	},
	{
		path: "forgot-password",
		component: ForgotPasswordPageComponent
	},
	{
		path: "tables",
		component: TableOverviewPageComponent
	},
	{
		path: "tables/:uuid",
		component: BookingPageComponent
	},
	{
		path: "tables/:uuid/:console",
		component: TransferPageComponent
	}
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
