import { Component, signal, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";

import { LanguageSwitcherComponent } from "../../../components/language-switch.component";
import { Bot3DComponent } from "../../../components/bot-3d.component";
import { ArticleSectionsComponent } from "../../../components/articles/article-sections.component";
import { ArticleNavComponent } from "../../../components/articles/article-nav.component";
import { TranslocoService } from "@jsverse/transloco";
import { toSignal } from "@angular/core/rxjs-interop";
import { fadeInOut } from "../../../utils/animations";

@Component({
  templateUrl: "./raijin.page.html",
  imports: [
    LanguageSwitcherComponent,
    Bot3DComponent,
    ArticleSectionsComponent,
    ArticleNavComponent,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    PdfJsViewerModule,
  ],
  animations: [fadeInOut()],
})
export class RaijinPage {
  @ViewChild("canvas", { static: true })
  public canvas!: Bot3DComponent;

  @ViewChild("navigation")
  public navigation!: ArticleNavComponent;

  sectionsBeforeSchematic = ["intro", "mec", ["estrutura", "ventoinhas", "engrenagens", "motores"], "hardware"];
  sectionsAfterSchematic = [["regulador", "uc", "eeprom", "imu", "usb", "bt", "linesensors", "driver"], "firmware", ["map", "controle"], "extras"];

  loadingCanvas = signal(true);

  currentLanguage;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (entry.intersectionRatio > 0) {
          document.getElementById(`${id}.nav`)?.classList.add("active");
        } else {
          document.getElementById(`${id}.nav`)?.classList.remove("active");
        }
      });
    },
    {
      rootMargin: "-100px",
    },
  );

  constructor(translate: TranslocoService) {
    this.currentLanguage = toSignal(translate.langChanges$);
  }

  resetView() {
    this.canvas.resetView();
  }

  goToTop() {
    this.navigation.goToTop();
  }
}
