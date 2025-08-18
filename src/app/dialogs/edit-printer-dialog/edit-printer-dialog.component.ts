import { Component, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Dialog } from 'dav-ui-components';
import { LocalizationService } from 'src/app/services/localization-service';

@Component({
  selector: 'app-edit-printer-dialog',
  templateUrl: './edit-printer-dialog.component.html',
  styleUrl: './edit-printer-dialog.component.scss',
  standalone: false
})
export class EditPrinterDialogComponent {
  locale = this.localizationService.locale.dialogs.editPrinterDialog;
  actionsLocale = this.localizationService.locale.actions;

  @Input() name: string = "";
  @Input() ipAdress: string = "";


  @Input() nameError: string = "";
  @Input() ipAdressError: string = "";
  @Input() loading: boolean = false;

  @Output() primaryButtonClick = new EventEmitter<{ name: string; ipAdress: string }>();
  @Output() clearErrors = new EventEmitter();

  @ViewChild("dialog") dialog!: ElementRef<Dialog>;
  visible: boolean = false;

  constructor(
    private localizationService: LocalizationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.appendChild(this.dialog.nativeElement);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.removeChild(this.dialog.nativeElement);
    }
  }

  show(printer: { name: string; ipAdress: string }) {
    this.name = printer.name;
    this.ipAdress = printer.ipAdress;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  nameTextfieldChange(event: Event) {
    this.name = (event as CustomEvent).detail.value;
    this.clearErrors.emit();
  }

  ipAdressTextfieldChange(event: Event) {
    this.ipAdress = (event as CustomEvent).detail.value;
    this.clearErrors.emit();
  }


  submit() {
    this.primaryButtonClick.emit({
      name: this.name,
      ipAdress: this.ipAdress
    });
  }
}

