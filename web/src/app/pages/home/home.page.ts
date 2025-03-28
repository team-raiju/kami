import { Component } from "@angular/core";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";

@Component({ templateUrl: "./home.page.html", imports: [LanguageSwitcherComponent, SideNavTogglerComponent] })
export class HomePage {}
