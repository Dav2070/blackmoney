import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component"
import { LoginPageComponent } from "./pages/login-page/login-page.component"
import { TableOverviewPageComponent } from "./pages/table-overview-page/table-overview-page.component"

const routes: Routes = [
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

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
