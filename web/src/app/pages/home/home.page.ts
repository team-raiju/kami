import { Component } from "@angular/core";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";

@Component({ standalone: true, templateUrl: "./home.page.html", imports: [LanguageSwitcherComponent] })
export class HomePage {}
