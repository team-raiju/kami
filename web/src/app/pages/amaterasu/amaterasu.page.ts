import { Component, ElementRef, ViewChild } from "@angular/core";
import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { SideNavTogglerComponent } from "../../components/sidenav/sidenav-toggler.component";
import { LanguageSwitcherComponent } from "../../components/language-switch.component";
import { Wall } from "./tracks/maze.sprites";
import { sample } from "underscore";
import { instance } from "three/webgpu";

class Cell {
  left_wall?: Wall;
  right_wall?: Wall;
  top_wall?: Wall;
  bottom_wall?: Wall;
}

@Component({
  templateUrl: "./amaterasu.page.html",
  imports: [SideNavTogglerComponent, LanguageSwitcherComponent],
})
export class AmaterasuPage {
  @ViewChild("amaterasu", { static: true })
  public canvasContainer!: ElementRef<HTMLDivElement>;

  private cells = Array(16)
    .fill({})
    .map(() =>
      Array(16)
        .fill({})
        .map(() => new Cell()),
    );

  private maze?: Container;

  async ngOnInit() {
    const app = new Application();
    await app.init({ background: "#1e1e1e", resizeTo: this.canvasContainer.nativeElement });
    this.canvasContainer.nativeElement.appendChild(app.canvas);

    // wall + cell = 1.2 + 16.8 cm
    const side = 18 * 16 + 1.2;
    const smaller = Math.min(app.canvas.width - 20, app.canvas.height - 20);
    const ratio = smaller / side;

    this.maze = new Container();

    // background
    this.maze.addChild(new Graphics().rect(0, 0, side, side).fill("#151515"));

    for (let i = 0; i < 17; i++) {
      for (let j = 0; j < 17; j++) {
        const pivot = new Graphics().rect(i * 18, j * 18, 1.2, 1.2).fill("#FF0000");
        this.maze.addChild(pivot);

        if (j < 16) {
          const wall = new Wall(i * 18, 1.2 + j * 18, true);
          wall.activate(i == 0 || i == 16);
          this.maze.addChild(wall);
          if (i < 16) {
            this.cells[i][j].left_wall = wall;
          }
          if (i > 0) this.cells[i - 1][j].right_wall = wall;
        }

        if (i < 16) {
          const wall = new Wall(1.2 + i * 18, j * 18, false);
          wall.activate(j == 0 || j == 16);
          this.maze.addChild(wall);
          if (j < 16) this.cells[i][j].top_wall = wall;
          if (j > 0) this.cells[i][j - 1].bottom_wall = wall;
        }
      }
    }

    this.maze.x = app.canvas.width / 2;
    this.maze.y = app.canvas.height / 2;

    this.maze.pivot.x = this.maze.width / 2;
    this.maze.pivot.y = this.maze.height / 2;

    this.maze.scale.x = ratio;
    this.maze.scale.y = ratio;

    app.stage.addChild(this.maze);

    const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

    // Create a new Sprite from an image path.
    const bunny = new Sprite(texture);
    this.maze.addChild(bunny);

    //@ts-ignore
    window.cells = this.cells;
  }

  randomize() {
    this.maze!.children.filter((c) => c instanceof Wall).forEach((c) => c.activate(true));
    const visited = new Set<string>();
    this.randomDfs(0, 0, 16, 16, visited, (from, to) => {
      if (from[0] == to[0]) {
        if (from[1] == to[1] + 1) {
          this.cells[from[0]][from[1]].top_wall?.activate(false);
        } else if (from[1] == to[1] - 1) {
          this.cells[from[0]][from[1]].bottom_wall?.activate(false);
        }
      } else if (from[1] == to[1]) {
        if (from[0] == to[0] + 1) {
          this.cells[from[0]][from[1]].left_wall?.activate(false);
        } else if (from[0] == to[0] - 1) {
          this.cells[from[0]][from[1]].right_wall?.activate(false);
        }
      }
    });
  }

  private randomDfs(
    i: number,
    j: number,
    max_i: number,
    max_j: number,
    visited: Set<string>,
    act: (from: [number, number], next: [number, number]) => void,
  ) {
    visited.add(`${i},${j}`);
    let next = this.randomNeighbour(i, j, max_i, max_j, visited);
    while (next != null) {
      act([i, j], next);
      this.randomDfs(next[0], next[1], max_i, max_j, visited, act);
      next = this.randomNeighbour(i, j, max_i, max_j, visited);
    }
  }

  private randomNeighbour(i: number, j: number, max_i: number, max_j: number, visited: Set<string>) {
    const neigh = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]
      .map(([x, y]) => [x + i, y + j])
      .filter(([x, y]) => x >= 0 && x < max_i && y >= 0 && y < max_j)
      .filter(([x, y]) => !visited.has(`${x},${y}`)) as [number, number][];

    return neigh.length == 0 ? null : sample(neigh);
  }
}
