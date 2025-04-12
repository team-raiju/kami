import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";

@Component({
  selector: "home-button",
  template: `<button mat-icon-button (click)="home()">
    <mat-icon>home</mat-icon>
  </button>`,
  imports: [MatButtonModule, MatIconModule],
})
export class HomeButtonComponent {
  constructor(private router: Router) {}

  home() {
    this.router.navigate(["/"]);
  }
}
