import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import { systemThemeKey, lightThemeKey, darkThemeKey } from "src/app/constants"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./general-settings-page.component.html",
	styleUrl: "./general-settings-page.component.scss",
	standalone: false
})
export class GeneralSettingsPageComponent {
	locale = this.localizationService.locale.settingsPage
	selectedTheme: string = systemThemeKey
	themeDropdownOptions: DropdownOption[] = [
		{
			key: systemThemeKey,
			value: this.locale.systemTheme,
			type: DropdownOptionType.option
		},
		{
			key: lightThemeKey,
			value: this.locale.lightTheme,
			type: DropdownOptionType.option
		},
		{
			key: darkThemeKey,
			value: this.locale.darkTheme,
			type: DropdownOptionType.option
		}
	]

	constructor(
		private localizationService: LocalizationService,
		private settingsService: SettingsService,
		private dataService: DataService,
		private router: Router
	) {}

	async ngOnInit() {
		// Select the correct theme
		this.selectedTheme = await this.settingsService.getTheme()
	}

	navigateBack() {
		this.router.navigate(["user"])
	}

	themeDropdownChange(event: Event) {
		let selectedKey = (event as CustomEvent).detail.key

		this.selectedTheme = selectedKey
		this.settingsService.setTheme(selectedKey)
		this.dataService.loadTheme(selectedKey)
	}
}
