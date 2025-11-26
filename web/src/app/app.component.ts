import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

import { Chart } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
Chart.register(zoomPlugin);

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [RouterOutlet],
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
