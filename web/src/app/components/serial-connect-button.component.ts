import { Component, computed } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SerialService } from "../services/serial.service";

@Component({
  selector: "serial-connect-button",
  template: `<button mat-icon-button (click)="connect()" title="Connect USB Serial" [disabled]="isConnected()">
    <mat-icon>usb</mat-icon>
  </button>`,
  imports: [MatButtonModule, MatIconModule],
})
export class SerialConnectButton {
  isConnected = computed(() => this.serial.selectedPort() != null);

  constructor(private serial: SerialService) {}

  connect() {
    this.serial.connect();
  }
}
