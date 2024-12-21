import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { toSignal } from "@angular/core/rxjs-interop";
import { TranslocoService } from "@jsverse/transloco";

@Component({
  selector: "language-switcher",
  template: `<button mat-icon-button [title]="'Current Language: ' + currentLanguage()" (click)="toggleLanguage()">
    <mat-icon>language</mat-icon>
  </button>`,
  imports: [MatButtonModule, MatIconModule],
})
export class LanguageSwitcherComponent {
  currentLanguage;

  constructor(private translate: TranslocoService) {
    this.currentLanguage = toSignal(this.translate.langChanges$);
  }

  toggleLanguage() {
    const newLang = this.currentLanguage() == "en" ? "pt" : "en";
    this.translate.setActiveLang(newLang);
  }
}
