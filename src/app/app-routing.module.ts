import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { LandingPageComponent } from "./pages/landing-pages/landing-page/landing-page.component"
import { LandingOverviewPageComponent } from "./pages/landing-pages/landing-overview-page/landing-overview-page.component"
import { LandingPricingPageComponent } from "./pages/landing-pages/landing-pricing-page/landing-pricing-page.component"
import { LandingGuestsPageComponent } from "./pages/landing-pages/landing-guests-page/landing-guests-page.component"
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
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { CashRegisterPageComponent } from "./pages/cash-register-pages/cash-register-page/cash-register-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { PaymentPageComponent } from "./pages/cash-register-pages/payment-page/payment-page.component"
import { RoomsPageComponent } from "./pages/landing-pages/rooms-page/rooms-page.component"
import { RoomPageComponent } from "./pages/landing-pages/room-page/room-page.component"
import { TableCombinationsPageComponent } from "./pages/landing-pages/table-combinations-page/table-combinations-page.component"
import { PrintersPageComponent } from "./pages/landing-pages/printers-page/printers-page.component"
import { OpeningTimePageComponent } from "./pages/landing-pages/opening-time-page/opening-time-page.component"
import { ReservationsPageComponent } from "./pages/landing-pages/reservations-page/reservations-page.component"
import { CategoryPageComponent } from "./pages/landing-pages/category-page/category-page.component"
import { CategoriesPageComponent } from "./pages/landing-pages/categories-page/categories-page.component"
import { VariationsPageComponent } from "./pages/landing-pages/variations-page/variations-page.component"
import { MenuPageComponent } from "./pages/landing-pages/menu-page/menu-page.component"
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
				path: "user",
				component: UserPageComponent
			},
			{
				path: "user/settings",
				component: GeneralSettingsPageComponent
			},
			{
				path: "user/restaurants",
				component: RestaurantsPageComponent
			},
			{
				path: "user/restaurants/:uuid",
				component: RestaurantPageComponent
			},
			{
				path: "user/restaurants/:uuid/printers",
				component: PrintersPageComponent
			},
			{
				path: "user/restaurants/:uuid/registers",
				component: RegistersPageComponent
			},
			{
				path: "user/restaurants/:restaurantUuid/registers/:registerUuid",
				component: RegisterPageComponent
			},
			{
				path: "user/restaurants/:restaurantUuid/registers/:registerUuid/clients/:registerClientUuid",
				component: RegisterClientPageComponent
			},
			{
				path: "user/employees",
				component: EmployeesPageComponent
			},
			{
				path: "user/employees/:uuid",
				component: EmployeePageComponent
			},
			{
				path: "user/reservations",
				component: ReservationsPageComponent
			},
			{
				path: "user/restaurants/:uuid/rooms",
				component: RoomsPageComponent
			},
			{
				path: "user/restaurants/:restaurantUuid/rooms/:roomUuid",
				component: RoomPageComponent
			},
			{
				path: "user/restaurants/:restaurantUuid/rooms/:roomUuid/combinations",
				component: TableCombinationsPageComponent
			},
			{
				path: "user/restaurants/:uuid/openingTime",
				component: OpeningTimePageComponent
			},
			{
				path: "user/restaurants/:uuid/menu",
				component: MenuPageComponent
			},
			{
				path: "user/restaurants/:uuid/menu/categories",
				component: CategoriesPageComponent
			},
			{
				path: "user/restaurants/:restaurantUuid/menu/categories/:categoryUuid",
				component: CategoryPageComponent
			},
			{
				path: "user/restaurants/:uuid/menu/variations",
				component: VariationsPageComponent
			}
		]
	},
	{
		path: "onboarding",
		component: OnboardingPageComponent
	},
	{
		path: "dashboard",
		component: CashRegisterPageComponent,
		children: [
			{
				path: "",
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
	}
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
