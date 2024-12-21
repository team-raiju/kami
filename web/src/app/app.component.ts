import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SideNavComponent } from "./components/sidenav/sidenav.component";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [RouterOutlet, SideNavComponent],
})
export class AppComponent {
  /**
   *
   */
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    for (const icon of ["kami", "raiju", "raijin", "github"]) {
      matIconRegistry.addSvgIcon(icon, domSanitizer.bypassSecurityTrustResourceUrl(`/icons/${icon}.svg`));
    }
  }
}
