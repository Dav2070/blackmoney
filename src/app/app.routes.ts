import { Routes } from "@angular/router"

import { LoginPageComponent } from "./pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/table-overview-page/table-overview-page.component"

export const routes: Routes = [
	{
		path: "login",
		component: LoginPageComponent
	},
	{
		path: "tables",
		component: TableOverviewPageComponent
	}
]
