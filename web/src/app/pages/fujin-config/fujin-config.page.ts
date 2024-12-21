import { Component, signal, ViewChild, WritableSignal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MazeComponent } from "./maze/maze.component";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";

@Component({
  templateUrl: "./fujin-config.page.html",
  imports: [MatButtonModule, MazeComponent, MatIconModule, MatInputModule, FormsModule],
})
export class FujinConfigPage {
  @ViewChild(MazeComponent, { static: true }) maze!: MazeComponent;

  static service = "0000FFE0-0000-1000-8000-00805F9B34FB".toLowerCase();
  static char = "0000FFE1-0000-1000-8000-00805F9B34FB".toLowerCase();

  ctext = signal("");
  isAllowed = signal(false);

  public bat = signal(0);
  public s1 = signal(0);
  public s2 = signal(0);
  public s3 = signal(0);
  public s4 = signal(0);

  private char?: BluetoothRemoteGATTCharacteristic;

  constructor() {}

  async ngOnInit() {
    const btPermission = await navigator.bluetooth.getAvailability();
    this.isAllowed.set(btPermission);
  }

  async connect() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,
        filters: [{ namePrefix: "JDY" }],
        optionalServices: [FujinConfigPage.service],
      });
      this.log(device.name);

      await device.gatt!.connect();
      this.log("CONECTOU");

      const service = await device.gatt!.getPrimaryService(FujinConfigPage.service);
      this.log(service.uuid);

      this.char = await service.getCharacteristic(FujinConfigPage.char);

      this.char.addEventListener("characteristicvaluechanged", (ev: unknown) => {
        const data = (ev as Event & { target: { value: DataView } }).target!.value;
        this.parse(data);
      });

      await this.char.startNotifications();
    } catch (e) {
      //@ts-ignore
      this.log(e);
    }
  }

  parse(data: DataView) {
    if (data.getUint8(0) != 0xff) {
      this.log("Invalid Header");
      return;
    }

    // Maze
    if (data.getUint8(1) == 0x05) {
      for (const i of [2, 6]) {
        const xy = data.getUint8(i);
        const walls = data.getUint8(i + 1);
        const visited = data.getUint8(i + 2);
        const distance = data.getUint8(i + 3);

        const x = (xy & 0xf0) >> 4;
        const y = xy & 0x0f;

        // this.log(`${xy}[(${x},${y})] ${walls} ${visited} ${distance}`);

        this.maze.update(x, y, (cell) => {
          cell.walls = walls;
          cell.visited = visited == 0x01;
          cell.distance = distance;
        });
      }
    }

    // Sensors
    if (data.getUint8(1) == 0x03) {
      this.s1.set(data.getUint16(2));
      this.s2.set(data.getUint16(4));
      this.s3.set(data.getUint16(6));
      this.s4.set(data.getUint16(8));
    }

    // Battery
    if (data.getUint8(1) == 0x04) {
      this.bat.set(data.getUint16(2));
    }
  }

  static readonly paramTypes = {
    angular_kp: 0x00,
    angular_ki: 0x01,
    angular_kd: 0x02,
    wall_kp: 0x03,
    wall_ki: 0x04,
    wall_kd: 0x05,
    min_move_speed: 0x06,
    min_turn_speed: 0x07,
    fix_position_speed: 0x08,
    search_speed: 0x09,
    angular_speed: 0x0a,
    run_speed: 0x0b,
    linear_acceleration: 0x0c,
    angular_acceleration: 0x0d,
  };

  values: Record<string, number> = {};

  async send_param(which: keyof typeof FujinConfigPage.paramTypes) {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    view.setUint8(0, 0xff);
    view.setUint8(1, 0x02);
    view.setUint8(2, FujinConfigPage.paramTypes[which]);
    view.setFloat32(3, this.values[which], true);

    const toSend = new Uint8Array(buffer);
    console.log(toSend);
    this.char?.writeValueWithoutResponse(toSend);
  }

  static readonly commands = {
    stop: 0x00,
    b1Short: 0x01,
    b2Short: 0x02,
    b1Long: 0x03,
    b2Long: 0x04,
  };

  async send_command(which: keyof typeof FujinConfigPage.commands) {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    view.setUint8(0, 0xff);
    view.setUint8(1, 0x00);
    view.setUint8(2, FujinConfigPage.commands[which]);

    const toSend = new Uint8Array(buffer);
    console.log(toSend);
    this.char?.writeValueWithoutResponse(toSend);
  }

  log(t?: string) {
    console.log(t);
    this.ctext.update((c) => c + t + "\n");
  }
}
