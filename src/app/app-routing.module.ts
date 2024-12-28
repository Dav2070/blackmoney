import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { ForgotPasswordPageComponent } from "./pages/landing-overview-page/forgot-password-page/forgot-password-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { SeparatePayComponent } from "./pages/cash-register-pages/separate-pay/separate-pay.component"
import { MenuePageComponent } from "./pages/settings-pages/menue-page/menue-page.component"

const routes: Routes = [
	//Settings-Pages
	{
		path: "tables/settings",
		component: MenuePageComponent
	},
	//Cash-Register Pages
	{
		path: "",
		component: LandingPageComponent,
		children: [
			{
				path: "",
				component: LandingOverviewPageComponent
			},
			{
				path: "pricing",
				component: LandingPricingPageComponent
			}
		]
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
		path: "tables/:uuid/separate",
		component: SeparatePayComponent
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
