import { Injectable } from "@angular/core"
import * as locales from "src/locales/locales"

@Injectable()
export class LocalizationService {
	locale = locales.de
}
