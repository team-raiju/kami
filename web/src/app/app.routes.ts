import { Routes } from "@angular/router";
import { HomePage, RaijinPage, TrackPage } from "./pages";

export const routes: Routes = [
  {
    title: "Team Raiju",
    loadComponent: () => HomePage,
    path: "",
    pathMatch: "full",
  },
  {
    title: "Track Builder",
    loadComponent: () => TrackPage,
    path: "track",
    pathMatch: "full",
  },
  {
    title: "Raijin",
    loadComponent: () => RaijinPage,
    path: "projects/raijin",
    pathMatch: "full",
  },
];
