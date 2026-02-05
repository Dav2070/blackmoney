import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-pages/landing-overview-page/landing-overview-page.component"
import { LandingOrderPageComponent } from "./pages/landing-pages/landing-order-page/landing-order-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { LandingGuestsPageComponent } from "./pages/landing-pages/landing-guests-page/landing-guests-page.component"
import { UserPageComponent } from "./pages/dashboard-pages/user-page/user-page.component"
import { GeneralSettingsPageComponent } from "./pages/dashboard-pages/general-settings-page/general-settings-page.component"
import { RestaurantsPageComponent } from "./pages/dashboard-pages/restaurants-page/restaurants-page.component"
import { RestaurantPageComponent } from "./pages/dashboard-pages/restaurant-page/restaurant-page.component"
import { RegistersPageComponent } from "./pages/dashboard-pages/registers-page/registers-page.component"
import { RegisterPageComponent } from "./pages/dashboard-pages/register-page/register-page.component"
import { RegisterClientPageComponent } from "./pages/dashboard-pages/register-client-page/register-client-page.component"
import { EmployeesPageComponent } from "./pages/dashboard-pages/employees-page/employees-page.component"
import { EmployeePageComponent } from "./pages/dashboard-pages/employee-page/employee-page.component"
import { LoginPageComponent } from "./pages/landing-pages/login-page/login-page.component"
import { SetPasswordPageComponent } from "./pages/landing-pages/set-password-page/set-password-page.component"
import { DeviceSetupPageComponent } from "./pages/landing-pages/device-setup-page/device-setup-page.component"
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { DashboardPageComponent } from "./pages/dashboard-pages/dashboard-page/dashboard-page.component"
import { TableOverviewPageComponent } from "./pages/dashboard-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/dashboard-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/dashboard-pages/transfer-page/transfer-page.component"
import { PaymentPageComponent } from "./pages/dashboard-pages/payment-page/payment-page.component"
import { RoomsPageComponent } from "./pages/dashboard-pages/rooms-page/rooms-page.component"
import { RoomPageComponent } from "./pages/dashboard-pages/room-page/room-page.component"
import { TableCombinationsPageComponent } from "./pages/dashboard-pages/table-combinations-page/table-combinations-page.component"
import { PrintersPageComponent } from "./pages/dashboard-pages/printers-page/printers-page.component"
import { OpeningTimePageComponent } from "./pages/dashboard-pages/opening-time-page/opening-time-page.component"
import { ReservationsPageComponent } from "./pages/dashboard-pages/reservations-page/reservations-page.component"
import { CategoryPageComponent } from "./pages/dashboard-pages/category-page/category-page.component"
import { CategoriesPageComponent } from "./pages/dashboard-pages/categories-page/categories-page.component"
import { VariationsPageComponent } from "./pages/dashboard-pages/variations-page/variations-page.component"
import { MenuPageComponent } from "./pages/dashboard-pages/menu-page/menu-page.component"
import { RestaurantInfoPageComponent } from "./pages/landing-pages/restaurant-info-page/restaurant-info-page.component"

const routes: Routes = [
	{
		path: "",
		component: LandingPageComponent,
		children: [
			{
				path: "",
				component: LandingOverviewPageComponent
			},
			{
				path: "order",
				component: LandingOrderPageComponent
			},
			{
				path: "pricing",
				component: LandingPricingPageComponent
			},
			{
				path: "guests",
				component: LandingGuestsPageComponent
			},
			{
				path: "guests/restaurantinfo/:uuid",
				component: RestaurantInfoPageComponent
			}
		]
	},
	{
		path: "dashboard",
		component: DashboardPageComponent,
		children: [
			{
				path: "",
				component: UserPageComponent
			},
			{
				path: "settings",
				component: GeneralSettingsPageComponent
			},
			{
				path: "restaurants",
				component: RestaurantsPageComponent
			},
			{
				path: "restaurants/:uuid",
				component: RestaurantPageComponent
			},
			{
				path: "restaurants/:uuid/printers",
				component: PrintersPageComponent
			},
			{
				path: "restaurants/:uuid/registers",
				component: RegistersPageComponent
			},
			{
				path: "restaurants/:restaurantUuid/registers/:registerUuid",
				component: RegisterPageComponent
			},
			{
				path: "restaurants/:restaurantUuid/registers/:registerUuid/clients/:registerClientUuid",
				component: RegisterClientPageComponent
			},
			{
				path: "employees",
				component: EmployeesPageComponent
			},
			{
				path: "employees/:uuid",
				component: EmployeePageComponent
			},
			{
				path: "reservations",
				component: ReservationsPageComponent
			},
			{
				path: "restaurants/:uuid/rooms",
				component: RoomsPageComponent
			},
			{
				path: "restaurants/:restaurantUuid/rooms/:roomUuid",
				component: RoomPageComponent
			},
			{
				path: "restaurants/:restaurantUuid/rooms/:roomUuid/combinations",
				component: TableCombinationsPageComponent
			},
			{
				path: "restaurants/:uuid/openingTime",
				component: OpeningTimePageComponent
			},
			{
				path: "restaurants/:uuid/menu",
				component: MenuPageComponent
			},
			{
				path: "restaurants/:uuid/menu/categories",
				component: CategoriesPageComponent
			},
			{
				path: "restaurants/:restaurantUuid/menu/categories/:categoryUuid",
				component: CategoryPageComponent
			},
			{
				path: "restaurants/:uuid/menu/variations",
				component: VariationsPageComponent
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
				path: "tables/:uuid/payment",
				component: PaymentPageComponent
			},
			{
				path: "tables/:uuid1/:uuid2",
				component: TransferPageComponent
			}
		]
	},
	{
		path: "onboarding",
		component: OnboardingPageComponent
	},
	{
		path: "login",
		component: LoginPageComponent
	},
	{
		path: "login/set-password",
		component: SetPasswordPageComponent
	},
	{
		path: "device-setup",
		component: DeviceSetupPageComponent
	}
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
