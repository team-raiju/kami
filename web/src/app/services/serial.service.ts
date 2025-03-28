import "@types/w3c-web-serial";

import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class SerialService {
  connected = signal(false);

  constructor() {
    navigator.serial.addEventListener("connect", (e) => {
      this.connected.set(true);
    });

    navigator.serial.addEventListener("disconnect", (e) => {
      // Remove `e.target` from the list of available ports.
      this.connected.set(false);
    });
  }
}
