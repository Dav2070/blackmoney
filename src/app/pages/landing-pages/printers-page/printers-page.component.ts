import { Component, ViewChild } from '@angular/core';
import { Printer } from 'src/app/models/Printer';
import { LocalizationService } from 'src/app/services/localization-service';
import { PrinterService } from 'src/app/services/printer-service'; // <--- Importieren!
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons";
import { AddPrinterDialogComponent } from 'src/app/dialogs/add-printer-dialog/add-printer-dialog.component';
import { EditPrinterDialogComponent } from 'src/app/dialogs/edit-printer-dialog/edit-printer-dialog.component';

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
      ipAdress: '192.168.188.121',
      macAdress: 'A4:D7:3C:AD:07:60'
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

  // Add-Dialog Properties
  addPrinterDialogLoading = false;
  addPrinterDialogNameError = "";
  addPrinterDialogIpAdressError = "";
  addPrinterDialogMacAdressError = "";

  // Edit-Dialog Properties
  editPrinterDialogLoading = false;
  editPrinterDialogNameError = "";
  editPrinterDialogIpAdressError = "";
  editPrinterDialogMacAdressError = "";
  editPrinterDialogName = "";
  editPrinterDialogIpAdress = "";
  editPrinterDialogMacAdress = "";
  editPrinterDialogPrinterUuid: string | null = null;

  @ViewChild('addPrinterDialog') addPrinterDialog!: AddPrinterDialogComponent;
  @ViewChild('editPrinterDialog') editPrinterDialog!: EditPrinterDialogComponent;

  constructor(
    public localizationService: LocalizationService,
    private printerService: PrinterService
  ) { }

  showAddPrintersDialog() {
    this.clearAddPrinterDialogErrors();
    this.addPrinterDialog.show();
  }

  addPrinterDialogPrimaryButtonClick(event: { name: string; ipAdress: string; macAdress: string }) {
    this.addPrinterDialogLoading = true;
    // Validierung
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

  // --- Edit Dialog ---
  showEditPrinterDialog(printer: Printer) {
    this.clearEditPrinterDialogErrors();
    this.editPrinterDialogPrinterUuid = printer.uuid ?? null;
    this.editPrinterDialogName = printer.name;
    this.editPrinterDialogIpAdress = printer.ipAdress;
    this.editPrinterDialogMacAdress = printer.macAdress;
    this.editPrinterDialog.show({
      name: printer.name,
      ipAdress: printer.ipAdress,
      macAdress: printer.macAdress
    });
  }

  editPrinterDialogPrimaryButtonClick(event: { name: string; ipAdress: string; macAdress: string }) {
    this.editPrinterDialogLoading = true;
    // Validierung
    if (event.name.length === 0) {
      this.editPrinterDialogNameError = "Name darf nicht leer sein.";
      this.editPrinterDialogLoading = false;
      return;
    }
    if (event.ipAdress.length === 0) {
      this.editPrinterDialogIpAdressError = "IP-Adresse darf nicht leer sein.";
      this.editPrinterDialogLoading = false;
      return;
    }
    if (event.macAdress.length === 0) {
      this.editPrinterDialogMacAdressError = "MAC-Adresse darf nicht leer sein.";
      this.editPrinterDialogLoading = false;
      return;
    }
    // Drucker aktualisieren
    if (this.editPrinterDialogPrinterUuid) {
      const idx = this.printers.findIndex(p => p.uuid === this.editPrinterDialogPrinterUuid);
      if (idx !== -1) {
        this.printers[idx].name = event.name;
        this.printers[idx].ipAdress = event.ipAdress;
        this.printers[idx].macAdress = event.macAdress;
      }
    }
    this.editPrinterDialogLoading = false;
    this.editPrinterDialog.hide();
  }

  clearEditPrinterDialogErrors() {
    this.editPrinterDialogNameError = "";
    this.editPrinterDialogIpAdressError = "";
    this.editPrinterDialogMacAdressError = "";
  }

  async testPrinter(printer: Printer) {
    try {
      await this.printerService.testPrinter(printer);
      alert('Test-Bon erfolgreich gesendet!');
    } catch (err) {
      alert('Fehler beim Drucken: ' + err);
    }
  }
}
