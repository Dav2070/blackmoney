export const de = {
	loginPage: {
		headline: "Anmelden",
		restaurant: "Restaurant",
		register: "Kasse",
		user: "Mitarbeiter",
		password: "Passwort",
		login: "Anmelden",
		loginFailed: "Anmeldung fehlgeschlagen"
	},
	setPasswordPage: {
		headline: "Willkommen!",
		description:
			"Bitte wähle ein Passwort, mit dem du dich zukünftig anmelden kannst.",
		passwordLabel: "Dein Passwort",
		passwordPlaceholder: "Wähle ein Passwort",
		passwordConfirmationLabel: "Passwort bestätigen",
		passwordConfirmationPlaceholder: "Wiederhole dein Passwort"
	},
	userPage: {
		headlines: [
			"Willkommen zurück, {name}!",
			"Schön dich wiederzusehen, {name}!",
			"Hey {name}!",
			"Hallo {name}!",
			"Moin {name}!",
			"Grüezi {name}!"
		],
		generalSettings: "Allgemeine Einstellungen",
		goToDashboard: "Zur Kasse",
		manageEmployees: "Mitarbeiter verwalten",
		manageRestaurants: "Restaurants verwalten"
	},
	settingsPage: {
		headline: "Allgemeine Einstellungen",
		theme: "App-Design",
		lightTheme: "Hell",
		darkTheme: "Dunkel",
		systemTheme: "System-Standard",
		deviceInfo: "Geräteinformationen",
		deviceName: "Gerätename:",
		serialNumber: "Seriennummer:",
		noNameGiven: "Kein Name angegeben"
	},
	restaurantsPage: {
		headline: "Deine Restaurants"
	},
	restaurantPage: {
		addAddress: "Adresse angeben",
		managePrinters: "Drucker verwalten",
		manageRooms: "Räume verwalten",
		manageRegisters: "Kassen verwalten"
	},
	registersPage: {
		headline: "Deine Kassen",
		manageTime: "Öffnungszeiten verwalten",
		addPicture: "Bild hinzufügen"
	},
	employeesPage: {
		headline: "Deine Mitarbeiter"
	},
	employeePage: {
		role: "Rolle:",
		resetPassword: "Passwort zurücksetzen"
	},
	printersPage: {
		headline: "Deine Drucker",
		test: "Test-Druck",
		status: "Status",
		statusOnline: "Online",
		statusOffline: "Offline",
		statusLoading: "Wird geprüft...",
		testPrintSuccess: "Test-Druck erfolgreich gesendet",
		testPrintError: "Test-Druck fehlgeschlagen: {errorMessage}"
	},
	roomsPage: {
		headline: "Deine Räume"
	},
	roomPage: {
		showTableCombinations: "Tischkombinationen anzeigen",
		options: "Weitere Optionen"
	},
	tableCombinationPage: {
		headline: "Deine Tischkombinationen",
		add: "+",
		delete: "löschen",
		roomCombination: "kombinieren"
	},
	tableOverviewPage: {
		headline: "Tischübersicht",
		table: "Tisch {name}"
	},
	bookingPage: {
		tableHeadline: "Tisch {name}",
		noProductsSelected: "Keine Produkte ausgewählt",
		bookedProducts: "Gebuchte Produkte",
		clear: "Clear",
		article: "Artikel",
		sendOrder: "Bestellung abschicken",
		pay: "Bezahlen",
		rebook: "Umbuchen",
		switchTable: "Tisch wechseln",
		takeAway: "Außer Haus",
		notes: "Notizen",
		extras: "Extras",
		addProduct: "Produkt hinzufügen",
		showBills: "Rechnungen anzeigen",
		sendOrderToastText: "Bestellung wurde erfolgreich abgeschickt."
	},
	paymentPage: {
		tableHeadline: "Tisch {name}",
		noProductsSelected: "Keine Produkte ausgewählt",
		billsHeadline: "Rechnungen",
		addBill: "Rechnung hinzufügen",
		removeBill: "Rechnung entfernen",
		payByCash: "Bar bezahlen",
		payByCard: "Mit Karte bezahlen",
		moveMultipleProducts: "Mehrere verschieben"
	},
	transferPage: {
		tableHeadline: "Tisch {tableName} – {roomName}",
		noProductsSelected: "Keine Produkte ausgewählt",
		transferAllItemsToRight: "Alles nach rechts verschieben",
		transferAllItemsToLeft: "Alles nach links verschieben",
		transferAllItemsToBottom: "Alles nach unten verschieben",
		transferAllItemsToTop: "Alles nach oben verschieben",
		moveMultipleProducts: "Mehrere verschieben"
	},
	dialogs: {
		logoutDialog: {
			headline: "Abmelden",
			description: "Bist du dir sicher, dass du dich abmelden möchtest?"
		},
		editDeviceNameDialog: {
			headline: "Gerätename bearbeiten",
			name: "Gerätename"
		},
		editRestaurantNameDialog: {
			headline: "Name bearbeiten",
			name: "Name des Restaurants"
		},
		editAddressDialog: {
			headline: "Adresse bearbeiten",
			city: "Stadt",
			line1: "Adresszeile 1",
			line2: "Adresszeile 2",
			postalCode: "Postleitzahl"
		},
		addEmployeeDialog: {
			headline: "Mitarbeiter hinzufügen",
			name: "Name des Mitarbeiters",
			assignedRestaurants: "Zugeordnete Restaurants"
		},
		addRegisterDialog: {
			headline: "Kasse hinzufügen",
			name: "Name"
		},
		addPrinterDialog: {
			headline: "Drucker hinzufügen",
			name: "Name des Druckers",
			ipAddress: "IP-Adresse"
		},
		editPrinterDialog: {
			headline: "Drucker bearbeiten",
			name: "Name des Druckers",
			ipAddress: "IP-Adresse"
		},
		selectTableDialog: {
			headline: "Tisch auswählen"
		},
		addRoomDialog: {
			headline: "Raum hinzufügen",
			name: "Name"
		},
		editRoomDialog: {
			headline: "Raum bearbeiten",
			name: "Name"
		},
		deleteRoomDialog: {
			headline: "Raum {name} löschen",
			description:
				"Bist du dir sicher, dass du diesen Raum löschen möchtest? Alle Tische in diesem Raum werden ebenfalls gelöscht."
		},
		addTableDialog: {
			headline: "Tisch hinzufügen",
			tableNumber: "Tischnummer",
			seats: "Sitzplätze",
			numberOfTables: "Anzahl Tische",
			startTableName: "Anfangstischnummer",
			createMultiple: "Mehrere Tische anlegen"
		},
		editTableDialog: {
			headline: "Tisch {name} bearbeiten",
			seats: "Sitzplätze"
		},
		deleteTableDialog: {
			headline: "Tisch {name} löschen",
			description:
				"Bist du dir sicher, dass du diesen Tisch löschen möchtest?"
		},
		addTableCombinationDialog: {
			headline: "Tisch Kombination erstellen",
			line1: "Tischnummer",
			line2: "Sitzplätze",
			line3: "Anzahl Tische",
			line4: "Anfangs Tischnummer"
		},
		resetPasswordDialog: {
			headline: "Passwort zurücksetzen",
			description:
				"Bist du dir sicher, dass du das Passwort für {name} zurücksetzen möchtest?"
		},
		selectProductDialog: {
			headline: "Produkt hinzufügen",
			menues: "Menüs",
			specials: "Specials"
		},
		selectProductVariationsDialog: {
			headline: "Variationen auswählen"
		},
		moveMultipleProductsDialog: {
			headline: "Mehrere verschieben"
		}
	},
	actions: {
		save: "Speichern",
		cancel: "Abbrechen",
		select: "Auswählen",
		add: "Hinzufügen",
		back: "Zurück",
		next: "Weiter",
		move: "Verschieben",
		logout: "Abmelden",
		edit: "Bearbeiten",
		delete: "Löschen",
		reset: "Zurücksetzen"
	},
	errors: {
		printerAlreadyExists:
			"Ein Drucker mit dieser IP-Adresse existiert bereits.",
		tableAlreadyExists: "Ein Tisch mit dieser Nummer existiert bereits.",
		nameMissing: "Bitte gib einen Namen an.",
		nameTooShort: "Der Name ist zu kurz.",
		nameTooLong: "Der Name ist zu lang.",
		cityTooLong: "Der Stadtname ist zu lang.",
		line1TooLong: "Die erste Zeile der Adresse ist zu lang.",
		line2TooLong: "Die zweite Zeile der Adresse ist zu lang.",
		passwordTooShort: "Dein Passwort ist zu kurz",
		passwordTooLong: "Dein Passwort ist zu lang",
		postalCodeInvalid: "Die Postleitzahl ist ungültig.",
		ipAddressMissing: "Bitte gib eine IP-Adresse an.",
		ipAddressInvalid: "Die IP-Adresse ist ungültig.",
		tableNameInvalid: "Die Tischnummer ist ungültig.",
		seatsInvalid: "Die Anzahl der Sitzplätze ist ungültig.",
		passwordDoesNotMatchPasswordConfirmation:
			"Die Passwörter stimmen nicht überein.",
		unexpectedError: "Ein unbekannter Fehler ist aufgetreten."
	}
}
