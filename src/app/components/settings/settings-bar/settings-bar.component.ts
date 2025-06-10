import { Component, inject } from "@angular/core"
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import { Observable } from "rxjs"
import { map, shareReplay } from "rxjs/operators"
import { Location } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"

@Component({
	selector: "app-settings-bar",
	templateUrl: "./settings-bar.component.html",
	styleUrl: "./settings-bar.component.scss",
	standalone: false
})
export class SettingsBarComponent {
	constructor(private router: Router, private route: ActivatedRoute) { }
	private breakpointObserver = inject(BreakpointObserver)
	private location = inject(Location)

	isHandset$: Observable<boolean> = this.breakpointObserver
		.observe(Breakpoints.Handset)
		.pipe(
			map(result => result.matches),
			shareReplay()
		)
	goBack(): void {
		this.router.navigate(['..'], { relativeTo: this.route });
	}
}
