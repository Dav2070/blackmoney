import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Printer } from 'src/app/models/Printer';
import { LocalizationService } from 'src/app/services/localization-service';
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons"

@Component({
  selector: 'app-printers-page',
  templateUrl: './printers-page.component.html',
  styleUrl: './printers-page.component.scss',
  standalone: false
})
export class PrintersPageComponent {
  locale = this.localizationService.locale.printersPage
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
  faPen = faPen
  faPrint = faPrint;
  constructor(
    private localizationService: LocalizationService,
    private router: Router
  ) { }

  showAddPrintersDialog() {
  }

  showEditPrinterDialog() {

  }

  testPrinter(printer: Printer) {
    // Hier kommt deine Test-Logik
    console.log('Test für Drucker:', printer);
  }
}
