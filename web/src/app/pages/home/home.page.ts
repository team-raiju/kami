import { Component } from "@angular/core";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { SideNavComponent } from "../../components/sidenav/sidenav.component";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";

@Component({ standalone: true, templateUrl: "./home.page.html", imports: [LanguageSwitcherComponent, SideNavComponent, SideNavTogglerComponent] })
export class HomePage {}
