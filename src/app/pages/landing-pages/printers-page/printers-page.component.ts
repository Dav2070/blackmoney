import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Printer } from 'src/app/models/Printer';
import { LocalizationService } from 'src/app/services/localization-service';
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons";
import { AddPrinterDialogComponent } from 'src/app/dialogs/add-printer-dialog/add-printer-dialog.component';

@Component({
  selector: 'app-printers-page',
  templateUrl: './printers-page.component.html',
  styleUrl: './printers-page.component.scss',
  standalone: false
})
export class PrintersPageComponent {
  locale = this.localizationService.locale.printersPage;
  faPen = faPen;
  faPrint = faPrint;

  printers: Printer[] = [
    {
      uuid: '1',
      name: 'Küche',
      ipAdress: '192.168.1.10',
      macAdress: 'AA:BB:CC:DD:EE:01'
    },
    {
      uuid: '2',
      name: 'Theke',
      ipAdress: '192.168.1.11',
      macAdress: 'AA:BB:CC:DD:EE:02'
    },
    {
      uuid: '3',
      name: 'Büro',
      ipAdress: '192.168.1.12',
      macAdress: 'AA:BB:CC:DD:EE:03'
    }
  ];

  addPrinterDialogLoading = false;
  addPrinterDialogNameError = "";
  addPrinterDialogIpAdressError = "";
  addPrinterDialogMacAdressError = "";

  @ViewChild('addPrinterDialog') addPrinterDialog!: AddPrinterDialogComponent;

  constructor(
    public localizationService: LocalizationService,
    private router: Router
  ) { }

  showAddPrintersDialog() {
    this.clearAddPrinterDialogErrors();
    this.addPrinterDialog.show();
  }

  addPrinterDialogPrimaryButtonClick(event: { name: string; ipAdress: string; macAdress: string }) {
    this.addPrinterDialogLoading = true;
    // Hier kannst du Validierung und ggf. Backend-Call einbauen
    // Beispiel: einfache Validierung
    if (event.name.length === 0) {
      this.addPrinterDialogNameError = "Name darf nicht leer sein.";
      this.addPrinterDialogLoading = false;
      return;
    }
    if (event.ipAdress.length === 0) {
      this.addPrinterDialogIpAdressError = "IP-Adresse darf nicht leer sein.";
      this.addPrinterDialogLoading = false;
      return;
    }
    if (event.macAdress.length === 0) {
      this.addPrinterDialogMacAdressError = "MAC-Adresse darf nicht leer sein.";
      this.addPrinterDialogLoading = false;
      return;
    }
    // Drucker hinzufügen
    this.printers.push({
      uuid: (Math.random() * 1000000).toFixed(0),
      name: event.name,
      ipAdress: event.ipAdress,
      macAdress: event.macAdress
    });
    this.addPrinterDialogLoading = false;
    this.addPrinterDialog.hide();
  }

  clearAddPrinterDialogErrors() {
    this.addPrinterDialogNameError = "";
    this.addPrinterDialogIpAdressError = "";
    this.addPrinterDialogMacAdressError = "";
  }

  testPrinter(printer: Printer) {
    // Test-Logik
    alert(`Test für Drucker: ${printer.name}`);
  }

  showEditPrinterDialog() {
    // Öffne Edit-Dialog (optional)
  }
}
