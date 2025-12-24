import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
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
import { OnboardingPageComponent } from "./pages/onboading-pages/onboarding-page/onboarding-page.component"
import { CashRegisterPageComponent } from "./pages/cash-register-pages/cash-register-page/cash-register-page.component"
import { TableOverviewPageComponent } from "./pages/cash-register-pages/table-overview-page/table-overview-page.component"
import { BookingPageComponent } from "./pages/cash-register-pages/booking-page/booking-page.component"
import { TransferPageComponent } from "./pages/cash-register-pages/transfer-page/transfer-page.component"
import { PaymentPageComponent } from "./pages/cash-register-pages/payment-page/payment-page.component"
import { MenuePageComponent } from "./pages/settings-pages/menue-page/menue-page.component"
import { SettingsPageComponent } from "./pages/settings-pages/settings-page/settings-page.component"
import { RestaurantOverviewComponent } from "./pages/settings-pages/restaurant-overview/restaurant-overview.component"
import { RoomManagementComponent } from "./pages/settings-pages/room-management/room-management.component"
import { EmployeeManagementComponent } from "./pages/settings-pages/employee-management/employee-management.component"
import { RoomsPageComponent } from "./pages/landing-pages/rooms-page/rooms-page.component"
import { RoomPageComponent } from "./pages/landing-pages/room-page/room-page.component"
import { TableCombinationsPageComponent } from "./pages/landing-pages/table-combinations-page/table-combinations-page.component"
import { PrintersPageComponent } from "./pages/landing-pages/printers-page/printers-page.component"
import { OpeningTimePageComponent } from "./pages/landing-pages/opening-time-page/opening-time-page.component"
import { ProductsOverviewPageComponent } from "./pages/landing-pages/products-overview-page/products-overview-page.component"
import { CategoryPageComponent } from "./pages/landing-pages/category-page/category-page.component"
import { VariationsOverviewPageComponent } from "./pages/landing-pages/variations-overview-page/variations-overview-page.component"
import { ProductListComponent } from "./pages/landing-pages/products-overview-page/product-list/product-list.component"
import { MenuPageComponent } from "./pages/landing-pages/menu-page/menu-page.component"

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
				path: "user/restaurants/:uuid/menu/category",
				component: CategoryPageComponent
			},
			{
				path: "user/restaurants/:uuid/menu/category/:categoryuuid",
				component: ProductsOverviewPageComponent,
				children: [
					{ path: "", redirectTo: "food", pathMatch: "full" },
					{ path: "food", component: ProductListComponent },
					{ path: "drinks", component: ProductListComponent }, // später durch DrinksListComponent ersetzen
					{ path: "specials", component: ProductListComponent }, // später durch SpecialsListComponent ersetzen
					{ path: "menus", component: ProductListComponent } // später durch MenusListComponent ersetzen
				]
			},
			{
				path: "user/restaurants/:uuid/menu/variations",
				component: VariationsOverviewPageComponent
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
			},
			//Settings-Pages
			{
				path: "settings",
				component: SettingsPageComponent
			},
			{
				path: "settings/menue",
				component: MenuePageComponent
			},
			{
				path: "settings/restaurant",
				component: RestaurantOverviewComponent
			},
			{
				path: "settings/rooms",
				component: RoomManagementComponent
			},
			{
				path: "settings/employees",
				component: EmployeeManagementComponent
			}
		]
	}
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
