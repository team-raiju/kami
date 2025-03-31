import { Component, computed } from "@angular/core";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIconModule } from "@angular/material/icon";
import { SerialService } from "../../services/serial.service";
import { MatButtonModule } from "@angular/material/button";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";
import { SerialConnectButton } from "../../components/serial-connect-button.component";

@Component({
  templateUrl: "./tools.page.html",
  imports: [
    LanguageSwitcherComponent,
    MatToolbarModule,
    TranslocoDirective,
    MatIconModule,
    MatButtonModule,
    SideNavTogglerComponent,
    SerialConnectButton,
  ],
})
export class ToolsPage {
  constructor(public serial: SerialService) {}
}
