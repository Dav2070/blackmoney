import { Routes } from "@angular/router"

import { LoginPageComponent } from "./pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/table-overview-page/table-overview-page.component"
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component"

export const routes: Routes = [
	{
		path: "login",
		component: LoginPageComponent
	},
	{
		path: "tables",
		component: TableOverviewPageComponent
	},
	{
		path: "forgot-password",
		component: ForgotPasswordPageComponent
	}
]
