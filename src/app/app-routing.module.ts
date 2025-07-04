import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { UserPageComponent } from "./pages/landing-pages/user-page/user-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { SeparatePayPageComponent } from "./pages/cash-register-pages/separate-pay-page/separate-pay-page.component"
import { MenuePageComponent } from "./pages/settings-pages/menue-page/menue-page.component"
import { SettingsPageComponent } from "./pages/settings-pages/settings-page/settings-page.component"
import { RestaurantOverviewComponent } from "./pages/settings-pages/restaurant-overview/restaurant-overview.component"
import { RoomManagementComponent } from "./pages/settings-pages/room-management/room-management.component"
import { EmployeeManagementComponent } from "./pages/settings-pages/employee-management/employee-management.component"

const routes: Routes = [
	//Settings-Pages
	{
		path: "tables/settings",
		component: SettingsPageComponent
	},
	{
		path: "tables/settings/menue",
		component: MenuePageComponent
	},
	{
		path: "tables/settings/restaurant",
		component: RestaurantOverviewComponent
	},
	{
		path: "tables/settings/rooms",
		component: RoomManagementComponent
	},
	{
		path: "tables/settings/employees",
		component: EmployeeManagementComponent
	},
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
			},
			{
				path: "user",
				component: UserPageComponent
			}
		]
	},
	{
		path: "login",
		component: LoginPageComponent
	},
	{
		path: "onboarding",
		component: OnboardingPageComponent
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
		component: SeparatePayPageComponent
	},
	{
		path: "tables/:uuid1/:uuid2",
		component: TransferPageComponent
	}
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
