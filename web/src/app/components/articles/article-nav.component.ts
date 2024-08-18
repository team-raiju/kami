import { ViewportScroller } from "@angular/common";
import { Component, input, ViewChild } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

export type NavData = (string | NavData)[];

@Component({
  standalone: true,
  selector: "inner-list",
  template: `
    <ol class="list-none pl-5">
      @for (section of sections(); track section) {
        @if (isString(section)) {
          <li id="{{ section + '.nav' }}">
            <a class="block text-gray-400 hover:text-gray-200 focus:text-gray-200 cursor-pointer" (click)="goTo(section)">
              {{ "article." + section | transloco }}
            </a>
          </li>
        } @else {
          <inner-list [sections]="section" />
        }
      }
    </ol>
  `,
  styles: `
    a {
      transition: all 100ms ease-in-out;
    }

    li.active > a {
      @apply text-gray-100;
    }
  `,
  imports: [TranslocoPipe],
})
export class InnerListComponent {
  sections = input.required<NavData>();

  constructor(private viewport: ViewportScroller) {
    viewport.setOffset([0, 70]);
  }

  public goToTop() {
    this.goTo(this.sections().flat()[0] as string);
  }

  goTo(target: string) {
    this.viewport.scrollToAnchor(target);
  }

  isString(obj: string | NavData): obj is string {
    return typeof obj === "string";
  }
}

@Component({
  standalone: true,
  selector: "article-nav",
  template: `
    <nav class="pl-0 border-l border-gray-100">
      <inner-list #innerList [sections]="sections()" />
    </nav>
  `,
  imports: [InnerListComponent],
})
export class ArticleNavComponent {
  @ViewChild(InnerListComponent)
  public innerList!: InnerListComponent;

  sections = input.required<NavData>();

  goToTop = () => this.innerList.goToTop();
}
