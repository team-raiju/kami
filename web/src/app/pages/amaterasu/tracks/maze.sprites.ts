import { Graphics, Sprite } from "pixi.js";

export class Wall extends Graphics {
  constructor(x: number, y: number, vertical: boolean) {
    super();

    if (vertical) {
      this.rect(x, y, 1.2, 16.8);
    } else {
      this.rect(x, y, 16.8, 1.2);
    }

    this.fill("#FFFFFF");
    this.activate(false);

    this.eventMode = "static";
    this.on("pointerdown", () => {
      this.tint = this.active ? 0x330000 : 0xff0000;
    });
  }

  activate(on = true) {
    this.tint = on ? 0xff0000 : 0x330000;
  }

  get active() {
    return this.tint == 0xff0000;
  }
}

export class Robot extends Sprite {
  constructor() {
    super();
  }
}
