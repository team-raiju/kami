import { Routes } from "@angular/router";
import { HomePage, RaijinPage } from "./pages";

export const routes: Routes = [
  {
    title: "Team Raiju",
    loadComponent: () => HomePage,
    path: "",
    pathMatch: "full",
  },
  {
    title: "Raijin Legacy",
    loadComponent: () => RaijinPage,
    path: "raijin/v1",
    pathMatch: "full",
  },
  {
    title: "Raijin",
    loadComponent: () => RaijinPage,
    path: "raijin/v2",
    pathMatch: "full",
  },
  {
    path: "raijin",
    pathMatch: "full",
    redirectTo: "raijin/v1",
  },
  {
    title: "Fujin",
    loadComponent: () => RaijinPage,
    path: "fujin",
    pathMatch: "full",
  },
];
