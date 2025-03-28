import { Component } from "@angular/core";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  templateUrl: "./serial.page.html",
  imports: [SideNavTogglerComponent, LanguageSwitcherComponent, MatToolbarModule, TranslocoDirective],
})
export class SerialPage {}
