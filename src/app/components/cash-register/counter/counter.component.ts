import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faMinus, faPlus } from "@fortawesome/pro-regular-svg-icons"

@Component({
   selector: "app-counter",
   templateUrl: "./counter.component.html",
   styleUrl: "./counter.component.scss",
   standalone: false
})
export class CounterComponent {
   faMinus = faMinus
   faPlus = faPlus
   @Input() count: number = 0
   @Input() headline: string = ""
   @Input() minusButtonDisabled: boolean = false
   @Input() plusButtonDisabled: boolean = false
   @Output() countChange = new EventEmitter<number>()

   minusButtonClick() {
      this.count--
      this.countChange.emit(this.count)
   }

   plusButtonClick() {
      this.count++
      this.countChange.emit(this.count)
   }
}
