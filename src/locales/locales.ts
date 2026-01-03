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
		headline: "Willkommen, {name}!",
		description:
			"Bitte wähle ein Passwort, mit dem du dich zukünftig anmelden kannst.",
		passwordLabel: "Dein Passwort",
		passwordPlaceholder: "Wähle ein Passwort",
		passwordConfirmationLabel: "Passwort bestätigen",
		passwordConfirmationPlaceholder: "Wiederhole dein Passwort"
	},
	deviceSetupPage: {
		headline: "Neues Gerät erkannt",
		description:
			"Gib diesem Gerät einen Namen, damit du es später bei der Verwaltung deiner Geräte einfacher hast.",
		deviceNameLabel: "Gerätename"
	},
	onboardingPage: {
		createCompanySection: {
			headline: "Wie heißt dein Restaurant?",
			description: "Bitte gib den Namen deines Restaurants ein."
		},
		createOwnerSection: {
			headline: "Erstelle deinen Admin-Zugang",
			description:
				"Gib deinen Namen und ein Passwort an, mit dem du dich anmelden kannst.<br />Damit kannst du später das Kassensystem verwalten und Einstellungen vornehmen.",
			nameTextfieldPlaceholder: "Dein Name",
			passwordTextfieldPlaceholder: "Dein Passwort"
		},
		createUsersSection: {
			headline: "Füge deine Mitarbeiter hinzu",
			description:
				"Gib die Namen deiner Mitarbeiter an, damit sich jeder am Kassensystem anmelden kann.",
			employeeNameTextfieldPlaceholder: "Name des Mitarbeiters"
		}
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
		manageRestaurants: "Restaurants verwalten",
		manageReservations: "Reservierungen verwalten"
	},
	reservationsPage: {
		headline: "Reservierungen",
		add: "Reservierung hinzufügen",
		noReservationsMessage: "Keine Reservierungen vorhanden",
		personSingular: "Person",
		personPlural: "Personen",
		tablePrefix: "Tisch",
		checkedInText: "Eingecheckt",
		checkInText: "Check-in",
		optionsTooltip: "Optionen"
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
		manageRegisters: "Kassen verwalten",
		manageTime: "Öffnungszeiten verwalten",
		addPicture: "Bild hinzufügen",
		manageMenu: "Speisekarte verwalten"
	},
	registersPage: {
		headline: "Deine Kassen",
		manageTime: "Öffnungszeiten verwalten",
		addPicture: "Bild hinzufügen",
		manageMenu: "Speisekarte verwalten"
	},
	registerClientPage: {
		printRulesHeadline: "Druckregeln",
		printRuleText:
			"<strong>{type}</strong> werden an folgende Drucker gesendet:",
		printRuleTextSingle:
			"<strong>{type}</strong> wird an folgende Drucker gesendet:",
		bills: "Rechnungen",
		drinks: "Getränke",
		food: "Speisen",
		foodAndDrinks: "Speisen und Getränke",
		categories: "{count} Kategorien",
		products: "{count} Produkte",
		options: "Weitere Optionen"
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
		table: "Tisch {name}",
		takeaway: {
			headline: "Grab & Go",
			close: "Schließen",
			add: "Hinzufügen",
			filterDelivery: "Lieferung",
			filterPickUp: "Abholung",
			filterDineIn: "Vor Ort",
			noOrders: "Keine Bestellungen",
			edit: "Bearbeiten",
			delete: "Löschen"
		}
	},
	menuPage: {
		headline: "Deine Speisekarte",
		category: "Kategorien",
		variations: "Variationen"
	},
	categoriesPage: {
		headline: "Deine Kategorien",
		noCategories: "Keine Kategorien vorhanden"
	},
	categoryPage: {
		noProductsMessage: "Keine Produkte vorhanden",
		addFood: "Speise hinzufügen",
		addDrink: "Getränk hinzufügen",
		addMenu: "Menü hinzufügen",
		addSpecial: "Special hinzufügen"
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
		course: "Gang",
		extras: "Extras",
		diverseProducts: "Diverse Produkte",
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
	variationsPage: {
		options: "Weitere Optionen",
		headline: "Variationen verwalten",
		noVariations: "Keine Variationen vorhanden",
		noVariationItems: "Keine Variations-Items vorhanden",
		addVariationItem: "Item hinzufügen"
	},
	offerOrderItemCard: {
		discount: "Rabatt"
	},
	offerCard: {
		options: "Optionen"
	},
	landingGuestsPage: {
		restaurantName: "Name des Restaurants",
		cityPostalCode: "Stadt / PLZ",
		distance: "Entfernung",
		distanceKm: "Entfernung: {distance} km",
		rating: "Bewertung",
		takeaway: "Zum Mitnehmen",
		delivery: "Lieferung"
	},
	restaurantInfoPage: {
		restaurantName: "Name des Restaurants",
		cityPostalCode: "Stadt / PLZ",
		distance: "Entfernung",
		distanceKm: "Entfernung: {distance} km",
		rating: "Bewertung",
		takeaway: "Zum Mitnehmen",
		delivery: "Lieferung",
		openingHours: "Öffnungszeiten",
		phone: "Telefon",
		email: "E-Mail",
		reserveNow: "Jetzt reservieren",
		orderNow: "Jetzt bestellen",
		buyVoucher: "Gutschein Kaufen",
		noImageAvailable: "Kein Bild verfügbar",
		addImage: "Bild hinzufügen",
		bestsellers: "Bestseller",
		showFullMenu: "Gesamte Speisekarte anzeigen",
		noBestsellers: "Keine Bestseller verfügbar",
		offers: "Angebote",
		discount: "Rabatt",
		fixedPrice: "Festpreis",
		max: "max.",
		reviews: "Bewertungen",
		addReview: "Bewertung hinzufügen",
		showAllReviews: "Alle Bewertungen anzeigen",
		noReviews: "Keine Bewertungen verfügbar",
		reviewSingular: "Bewertung",
		reviewPlural: "Bewertungen"
	},
	dialogs: {
		logoutDialog: {
			headline: "Abmelden",
			description: "Bist du dir sicher, dass du dich abmelden möchtest?"
		},
		editRegisterClientNameDialog: {
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
		addReservationDialog: {
			headline: "Reservierung hinzufügen",
			tab1: "Wunsch",
			tab2: "Verfügbarkeit",
			tab3: "Details",
			desiredTimeHeadline: "Gewünschte Reservierungszeit",
			availableHeadline: "Verfügbar!",
			notAvailableHeadline: "Nicht verfügbar",
			notAvailableMessage:
				"Leider ist {time} {suffix} nicht verfügbar. Wählen Sie eine der folgenden Alternativen:",
			availableMessage:
				"{time} {suffix} ist verfügbar. Bitte tragen Sie die Informationen zur Reservierung ein.",
			contactDetailsHeadline: "Kontaktinformationen",
			assignedTable: "Zugewiesener Tisch",
			seatsText: "Plätze",
			name: "Name",
			numberOfPeople: "Personenanzahl",
			phoneNumber: "Telefonnummer (optional)",
			email: "E-Mail (optional)",
			reservationDate: "Datum",
			reservationTime: "Uhrzeit",
			table: "Tisch",
			noTables: "Keine Tische verfügbar",
			previous: "Zurück",
			next: "Weiter",
			timeSuffix: "Uhr"
		},
		editReservationDialog: {
			headline: "Reservierung bearbeiten",
			tab1: "Details",
			tab2: "Verfügbarkeit",
			detailsHeadline: "Reservierungsdetails",
			availableHeadline: "Verfügbar!",
			notAvailableHeadline: "Nicht verfügbar",
			assignedTable: "Zugewiesener Tisch",
			changeNotice:
				"Hinweis: Änderungen an Personenanzahl oder Uhrzeit erfordern eine erneute Verfügbarkeitsprüfung.",
			availableMessage: "{time} {suffix} ist verfügbar.",
			seatsText: "Plätze",
			name: "Name",
			numberOfPeople: "Personenanzahl",
			phoneNumber: "Telefonnummer (optional)",
			email: "E-Mail (optional)",
			reservationDate: "Datum",
			reservationTime: "Uhrzeit",
			previous: "Zurück",
			next: "Weiter",
			timeSuffix: "Uhr"
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
		addPrintRuleDialog: {
			headline: "Druckregel hinzufügen",
			typeSubhead: "Was soll gedruckt werden?",
			printersSubhead: "Welche Drucker sollen verwendet werden?",
			selectPrinters: "Drucker auswählen",
			selectCategories: "Kategorien auswählen",
			selectProducts: "Produkte auswählen",
			bills: "Rechnungen",
			foodAndDrinks: "Speisen & Getränke",
			drinks: "Getränke",
			food: "Speisen",
			categories: "Ausgewählte Kategorien",
			products: "Ausgewählte Produkte"
		},
		editPrintRuleDialog: {
			headline: "Druckregel bearbeiten",
			categoriesSubhead: "Welche Kategorien sollen gedruckt werden?",
			productsSubhead: "Welche Produkte sollen gedruckt werden?",
			printersSubhead: "Welche Drucker sollen verwendet werden?",
			printersTypeSubhead: "{type} an folgende Drucker senden:",
			selectPrinters: "Drucker auswählen",
			selectCategories: "Kategorien auswählen",
			selectProducts: "Produkte auswählen",
			bills: "Rechnungen",
			foodAndDrinks: "Speisen & Getränke",
			drinks: "Getränke",
			food: "Speisen"
		},
		deletePrintRuleDialog: {
			headline: "Druckregel löschen",
			description:
				"Bist du dir sicher, dass du diese Druckregel löschen möchtest?"
		},
		resetPasswordDialog: {
			headline: "Passwort zurücksetzen",
			description:
				"Bist du dir sicher, dass du das Passwort für {name} zurücksetzen möchtest?"
		},
		selectProductDialog: {
			headline: "Produkt hinzufügen"
		},
		selectMenuSpecialProductsDialog: {
			categoriesHeadline: "Kategorien",
			productsHeadline: "Produkte",
			selectionHeadline: "Auswahl"
		},
		selectProductVariationsDialog: {
			headline: "Variationen auswählen"
		},
		subtractProductVariationsDialog: {
			headline: "Variationen entfernen"
		},
		moveMultipleProductsDialog: {
			headline: "Mehrere verschieben"
		},
		addNoteDialog: {
			headline: "Notiz hinzufügen",
			note: "Notiz"
		},
		viewNoteDialog: {
			headline: "Deine Notiz"
		},
		addDiverseProductDialog: {
			headline: "Diverses Produkt buchen",
			name: "Produktname",
			art: "Art",
			price: "Preis",
			diverseFood: "Diverse Speise",
			diverseDrinks: "Diverse Getränke",
			diverseCosts: "Diverse Kosten",
			food: "Speisen",
			drinks: "Getränke",
			otherCosts: "Andere Kosten"
		},
		addTakeawayDialog: {
			headline: "Außer Haus Bestellung",
			name: "Name",
			phoneNumber: "Telefonnummer",
			addressLine1: "Straße",
			addressLine2: "Adresszusatz",
			houseNumber: "Hausnummer",
			postalCode: "PLZ",
			city: "Stadt",
			orderType: "Bestellart",
			delivery: "Lieferung",
			pickUp: "Abholung",
			dineIn: "Vor Ort"
		},
		viewTakeawayDialog: {
			headline: "Bestelldetails",
			name: "Name",
			phoneNumber: "Telefonnummer",
			address: "Adresse",
			orderType: "Bestellart",
			delivery: "Lieferung",
			pickUp: "Abholung",
			dineIn: "Vor Ort"
		},
		editTakeawayDialog: {
			headline: "Bestellung bearbeiten",
			name: "Name",
			phoneNumber: "Telefonnummer",
			addressLine1: "Straße",
			addressLine2: "Adresszusatz",
			houseNumber: "Hausnummer",
			postalCode: "PLZ",
			city: "Stadt",
			orderType: "Bestellart",
			delivery: "Lieferung",
			pickUp: "Abholung",
			dineIn: "Vor Ort"
		},
		addCategoryDialog: {
			headline: "Kategorie hinzufügen",
			name: "Name",
			nameRequired: "Name ist erforderlich"
		},
		editCategoryDialog: {
			headline: "Kategorie bearbeiten",
			name: "Name"
		},
		deleteCategoryDialog: {
			headline: "Kategorie {name} löschen",
			description:
				"Bist du dir sicher, dass du diese Kategorie löschen möchtest? Alle Produkte in dieser Kategorie werden ebenfalls gelöscht."
		},
		addVariationDialog: {
			headline: "Variation hinzufügen",
			name: "Name der Variation",
			variationItems: "Variation-Items",
			itemName: "Item-Name",
			itemCost: "Aufpreis (€)",
			addItem: "Item hinzufügen",
			nameRequired: "Name ist erforderlich",
			itemsRequired: "Mindestens ein Item erforderlich",
			itemNameRequired: "Item-Name ist erforderlich"
		},
		addVariationItemDialog: {
			headline: "Variation-Item hinzufügen",
			name: "Name",
			additionalCost: "Aufpreis (€)"
		},
		editVariationDialog: {
			headline: "Variation bearbeiten",
			name: "Name der Variation",
			variationItems: "Variation-Items",
			itemName: "Item-Name",
			itemCost: "Aufpreis (€)",
			addItem: "Item hinzufügen",
			nameRequired: "Name ist erforderlich",
			itemsRequired: "Mindestens ein Item erforderlich",
			itemNameRequired: "Item-Name ist erforderlich"
		},
		editVariationItemDialog: {
			headline: "Variation-Item bearbeiten",
			name: "Name",
			additionalCost: "Aufpreis (€)",
			nameRequired: "Name ist erforderlich",
			costPositive: "Preis muss positiv sein"
		},
		addOfferDialog: {
			headline: "Menü hinzufügen",
			specialHeadline: "Special hinzufügen",
			tab1: "Grunddaten",
			tab2: "Produkte",
			specialTab2: "Produkte",
			tab3: "Verfügbarkeit",
			basicData: "Grunddaten",
			id: "ID",
			name: "Name",
			offerType: "Typ",
			fixedPrice: "Festpreis",
			discount: "Rabatt",
			discountType: "Rabatttyp",
			percentage: "Prozent",
			amount: "Betrag",
			price: "Preis (€)",
			discountPercentage: "Rabatt (%)",
			discountAmount: "Rabatt (€)",
			takeaway: "Takeaway verfügbar",
			offerItems: "Menü-Items",
			addNewItem: "Neues Item hinzufügen",
			itemName: "Item-Name (z.B. Vorspeise, Hauptgang)",
			maxSelections: "Maximale Auswahl",
			selectProducts: "Produkte auswählen",
			selectedProducts: "Ausgewählte Produkte",
			addItem: "Item hinzufügen",
			updateItem: "Item aktualisieren",
			editItem: "Item bearbeiten",
			editingItemInfo: "Sie bearbeiten gerade ein Item",
			cancel: "Abbrechen",
			availability: "Verfügbarkeit",
			weekdays: "Wochentage",
			selectAllDays: "Alle Tage auswählen",
			startDate: "Startdatum (optional)",
			endDate: "Enddatum (optional)",
			startTime: "Startzeit (optional)",
			endTime: "Endzeit (optional)",
			previous: "Zurück",
			next: "Weiter",
			idRequired: "Bitte eine ID eingeben",
			nameRequired: "Bitte einen Namen eingeben",
			valueRequired: "Bitte einen Wert eingeben",
			itemsRequired: "Bitte mindestens ein Item hinzufügen",
			itemNameRequired: "Bitte einen Namen eingeben",
			productsRequired: "Bitte mindestens ein Produkt auswählen"
		},
		editOfferDialog: {
			headline: "Menü bearbeiten",
			specialHeadline: "Special bearbeiten",
			tab1: "Grunddaten",
			tab2: "Produkte",
			specialTab2: "Produkte",
			tab3: "Verfügbarkeit",
			basicData: "Grunddaten",
			id: "ID",
			name: "Name",
			offerType: "Typ",
			fixedPrice: "Festpreis",
			discount: "Rabatt",
			discountType: "Rabatttyp",
			percentage: "Prozent",
			amount: "Betrag",
			price: "Preis (€)",
			discountPercentage: "Rabatt (%)",
			discountAmount: "Rabatt (€)",
			takeaway: "Takeaway verfügbar",
			offerItems: "Menü-Items",
			addNewItem: "Neues Item hinzufügen",
			itemName: "Item-Name (z.B. Vorspeise, Hauptgang)",
			maxSelections: "Maximale Auswahl",
			selectProducts: "Produkte auswählen",
			selectedProducts: "Ausgewählte Produkte",
			addItem: "Item hinzufügen",
			updateItem: "Item aktualisieren",
			editItem: "Item bearbeiten",
			editingItemInfo: "Sie bearbeiten gerade ein Item",
			cancel: "Abbrechen",
			availability: "Verfügbarkeit",
			weekdays: "Wochentage",
			selectAllDays: "Alle Tage auswählen",
			startDate: "Startdatum (optional)",
			endDate: "Enddatum (optional)",
			startTime: "Startzeit (optional)",
			endTime: "Endzeit (optional)",
			previous: "Zurück",
			next: "Weiter",
			idRequired: "Bitte eine ID eingeben",
			nameRequired: "Bitte einen Namen eingeben",
			valueRequired: "Bitte einen Wert eingeben",
			itemsRequired: "Bitte mindestens ein Item hinzufügen",
			itemNameRequired: "Bitte einen Namen eingeben",
			productsRequired: "Bitte mindestens ein Produkt auswählen"
		},
		viewMenuDialog: {
			headline: "Speisekarte",
			close: "Schließen",
			allProducts: "Alle Produkte",
			allProductsCount: "Alle Produkte ({count})",
			noProducts: "Keine Produkte in dieser Kategorie",
			noCategories: "Keine Kategorien verfügbar"
		},
		uploadImageDialog: {
			headline: "Bild hinzufügen",
			dragDropText: "Bild hierher ziehen oder klicken",
			fileFormats: "PNG, JPG, JPEG bis 5MB",
			fileTooLarge: "Datei ist zu groß. Maximale Größe: 5MB",
			invalidFileType: "Bitte nur Bilddateien hochladen",
			uploadSuccess: "Bild erfolgreich hinzugefügt"
		},
		addReviewDialog: {
			headline: "Bewertung hinzufügen",
			ratingLabel: "Bewertung",
			reviewLabel: "Ihre Bewertung (optional)",
			reviewPlaceholder: "Teilen Sie Ihre Erfahrung mit anderen Gästen...",
			submit: "Bewertung abgeben",
			cancel: "Abbrechen",
			reviewAdded: "Neue Bewertung hinzugefügt:"
		},
		viewReviewsDialog: {
			headline: "Alle Bewertungen",
			close: "Schließen",
			starsLabel: "von 5 Sternen",
			reviewSingular: "Bewertung",
			reviewPlural: "Bewertungen",
			newest: "Neueste",
			lowest: "Niedrigste",
			highest: "Höchste",
			noReviews: "Keine Bewertungen verfügbar"
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
		close: "Schließen",
		reset: "Zurücksetzen",
		skip: "Überspringen"
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
		dateInPast: "Datum darf nicht in der Vergangenheit liegen",
		unexpectedError: "Ein unbekannter Fehler ist aufgetreten."
	}
}
