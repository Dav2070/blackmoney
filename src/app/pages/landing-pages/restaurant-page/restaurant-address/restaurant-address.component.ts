import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faLocationDot, faPen } from "@fortawesome/pro-regular-svg-icons"

@Component({
  selector: 'app-restaurant-address',
  templateUrl: './restaurant-address.component.html',
  styleUrls: ['./restaurant-address.component.scss'],
  standalone: false
})
export class RestaurantAddressComponent {
  @Input() city = '';
  @Input() country = '';
  @Input() line1 = '';
  @Input() line2 = '';
  @Input() postalCode = '';
  @Output() editAddress = new EventEmitter<void>();

  faLocationDot = faLocationDot;
  faPen = faPen;

  onEdit() {
    this.editAddress.emit();
  }
}
