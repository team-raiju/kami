import { Component, signal } from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { MatIconModule } from "@angular/material/icon";

export const sideNavOpened = signal(false);

@Component({
  standalone: true,
  selector: "side-nav",
  template: `<mat-sidenav-container class="h-full">
    <mat-sidenav [(opened)]="opened" class="w-[200px]">
      <div class="flex flex-col h-full">
        <div class="mb-6 text-center text-xl mt-6 font-bold">Team Raiju</div>
        <mat-list>
          <div mat-subheader>{{ "side.projects" | transloco }}</div>
          <a mat-list-item disabled>
            <mat-icon matListItemIcon svgIcon="raiju"></mat-icon>
            <span> Raiju </span>
          </a>
          <a mat-list-item href="/projects/raijin" class="!cursor-pointer">
            <mat-icon matListItemIcon svgIcon="raijin"></mat-icon>
            <span> Raijin </span>
          </a>
          <a mat-list-item disabled>
            <mat-icon matListItemIcon>help</mat-icon>
            <span> Fujin </span>
          </a>
          <mat-divider></mat-divider>
          <div mat-subheader>{{ "side.tools" | transloco }}</div>
          <a mat-list-item disabled>
            <mat-icon matListItemIcon fontSet="material-symbols-outlined">border_color</mat-icon>
            <span> {{ "track.title" | transloco }} </span>
          </a>
        </mat-list>
        <div class="mt-auto text-center text-gray-400 mb-4">
          <div class="mb-1">Kami &copy; 2024 Team Raiju</div>
          <div>
            <a mat-icon-button href="https://github.com/team-raiju" target="_blank"><mat-icon svgIcon="github"></mat-icon></a>
          </div>
        </div>
      </div>
    </mat-sidenav>
    <mat-sidenav-content class="h-full">
      <ng-content></ng-content>
    </mat-sidenav-content>
  </mat-sidenav-container>`,
  imports: [MatSidenavModule, MatListModule, MatIconModule, TranslocoPipe],
})
export class SideNavComponent {
  opened = sideNavOpened;

  constructor(private translate: TranslocoService) {}
}
