import { Component, input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { toSignal } from "@angular/core/rxjs-interop";
import { TranslocoService } from "@jsverse/transloco";
import { MarkdownModule } from "ngx-markdown";

@Component({
  selector: "article-sections",
  template: `
    <div class="block text-justify">
      @for (section of sections(); track section) {
        <section id="{{ section }}">
          <markdown mermaid katex [src]="getLocalizedArticle(section)"></markdown>
        </section>
      }
    </div>
  `,
  imports: [MarkdownModule],
})
export class ArticleSectionsComponent {
  currentLanguage;

  base = input.required<string>();
  sections = input.required<string[]>();

  observer = input<IntersectionObserver>();

  constructor(private translate: TranslocoService) {
    this.currentLanguage = toSignal(this.translate.langChanges$);
  }

  getLocalizedArticle(name: string) {
    return `articles/${this.currentLanguage()}/${this.base()}.${name}.md`;
  }

  ngAfterViewInit() {
    document.querySelectorAll("section[id]").forEach((section) => {
      this.observer()?.observe(section);
    });
  }

  ngOnDestroy() {
    this.observer()?.disconnect();
  }
}
