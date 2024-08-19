import { Component, signal, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { sideNavOpened } from "./sidenav.component";

@Component({
  standalone: true,
  selector: "side-nav-toggler",
  template: `<button mat-icon-button (click)="openMenu()"><mat-icon>menu</mat-icon></button>`,
  imports: [MatButtonModule, MatIconModule],
})
export class SideNavTogglerComponent {
  openMenu() {
    sideNavOpened.set(true);
  }
}
