import { Routes } from "@angular/router";
import { HomePage, RaijinPage, TrackPage } from "./pages";
import { FujinConfigPage } from "./pages/fujin-config/fujin-config.page";
import { ToolsPage } from "./pages/tools/tools.page";

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
  {
    title: "Fujin Config",
    loadComponent: () => FujinConfigPage,
    path: "maze",
    pathMatch: "full",
  },
  {
    title: "Tools",
    loadComponent: () => ToolsPage,
    path: "tools",
    pathMatch: "full",
  },
];
