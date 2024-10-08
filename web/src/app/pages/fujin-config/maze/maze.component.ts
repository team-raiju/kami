import { Component, signal, WritableSignal } from "@angular/core";

class Cell {
  visited: boolean = false;
  distance: number = 255;
  walls: number = 0;

  get classes() {
    const c = [];

    if (this.walls & 0b0001) {
      c.push("wn");
    }
    if (this.walls & 0b0010) {
      c.push("ww");
    }
    if (this.walls & 0b0100) {
      c.push("ws");
    }
    if (this.walls & 0b1000) {
      c.push("we");
    }

    if (this.visited) {
      c.push("visited");
    }

    return c.join(" ");
  }
}

@Component({
  standalone: true,
  templateUrl: "./maze.component.html",
  selector: "maze",
  styles: `
    .maze {
      width: auto;
      display: grid;
      grid-template-columns: repeat(16, minmax(2rem, 1fr));
      grid-auto-rows: 1fr;
      gap: 2px;
    }

    .maze::before {
      content: "";
      width: 0;
      padding-bottom: 100%;
      grid-row: 1 / 1;
      grid-column: 1 / 1;
    }

    .maze > *:first-child {
      grid-row: 1 / 1;
      grid-column: 1 / 1;
    }

    /* Just to make the grid visible */

    .maze > * {
      @apply bg-gray-800 text-center;
      border: 1px white solid;
    }

    .maze > .wn {
      border-top: 1px red solid;
    }

    .maze > .ws {
      border-bottom: 1px red solid;
    }

    .maze > .we {
      border-right: 1px red solid;
    }

    .maze > .ww {
      border-left: 1px red solid;
    }

    .maze > .visited {
      background-color: rgba(0, 255, 0, 0.2);
    }
  `,
})
export class MazeComponent {
  public maze: WritableSignal<Array<Array<Cell>>>;

  constructor() {
    const cells = new Array<Array<Cell>>(16);
    for (let i = 0; i < 16; i++) {
      cells[i] = new Array<Cell>(16);
      for (let j = 0; j < 16; j++) {
        cells[i][j] = new Cell();
      }
    }

    // cells[3][6].walls = 9;
    // cells[3][6].visited = true;
    // cells[3][6].distance = 13;

    this.maze = signal(cells);
  }

  update(x: number, y: number, op: (cell: Cell) => void) {
    this.maze.update((m) => {
      op(m[x][y]);
      return m;
    });
  }
}
