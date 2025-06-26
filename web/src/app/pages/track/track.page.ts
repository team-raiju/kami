import { Component, computed } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";

import { Point, TrackService } from "../../services/track.service";
import { TrackEditorComponent } from "./track-editor/track-editor.component";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";
import { SerialConnectButton } from "../../components/serial-connect-button.component";
import { SerialService } from "../../services/serial.service";

@Component({
  templateUrl: "./track.page.html",
  imports: [
    TrackEditorComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TranslocoDirective,
    LanguageSwitcherComponent,
    SideNavTogglerComponent,
    SerialConnectButton,
  ],
})
export class TrackPage {
  hasPoints = computed(() => this.trackService.track().length > 0);

  constructor(
    public trackService: TrackService,
    public serialService: SerialService,
  ) {}

  async importPoints(markers = false) {
    const [handle] = await window.showOpenFilePicker();
    const file = await handle.getFile();
    const reader = new FileReader();

    reader.onloadend = () => {
      if (markers) {
        this.trackService.markers.set(this.parseFile(reader.result as string));
      } else {
        this.trackService.track.set(this.parseFile(reader.result as string));
      }
    };

    reader.readAsText(file);
  }

  async exportPoints() {
    const handle = await window.showDirectoryPicker();
    await handle.requestPermission({ mode: "readwrite" });
    for (const [data, name] of [
      [this.trackService.track(), "track"],
      [this.trackService.shortcut(), "shortcut"],
      [this.trackService.markers(), "markers"],
    ]) {
      if (data.length == 0) continue;
      let fhandle = await handle.getFileHandle(name + ".txt", { create: true });
      const writable = await fhandle.createWritable();
      await writable.write(
        this.trackService
          .track()
          .map((p, i) => `track:${i}:${p.x},${p.y}`)
          .join("\r\n"),
      );
      await writable.close();
    }
  }

  parseFile(content: string): Point[] {
    let lines = content.trim().split("\n");
    return lines.map((l) => {
      const [x, y] = l.split(",").map((s) => parseFloat(parseFloat(s).toFixed(2)));
      return {
        x: -x,
        y: +y,
      };
    });
  }
}
