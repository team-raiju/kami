import { Injectable, signal } from "@angular/core";

interface LogEntry {
  velocity_ms: number;
  target_velocity_ms: number;

  angular_speed_rad_s: number;
  target_rad_s: number;

  pwm_left: number;
  pwm_right: number;

  battery: number;

  pos_x: number;
  pos_y: number;
  angle: number;
  dist: number;
}

interface Point {
  x: number;
  y: number;
}

interface Marker {
  pos: Point;
  dist: number;
}

@Injectable({ providedIn: "root" })
export class SerialService {
  private readonly usbVendorId = 0x0483;
  private readonly header = 0xaa;
  private readonly commands = {
    update_map: 0x01,
    update_radius: 0x02,
    update_marker: 0x03,
    save_size: 0x04,
    save_data_to_memory: 0x05,
    read_all_eeprom: 0x06,
    erase_all_eeprom: 0x07,
    read_map: 0x08,
    read_shortcut: 0x09,
    read_markers: 0x0a,
    read_radius: 0x0b,
    update_shortcut: 0x0c,
    read_log: 0x0d,
  };

  selectedPort = signal<SerialPort | null>(null);

  logData = signal<LogEntry[]>([]);
  trackData = signal<Point[]>([]);
  shortcutData = signal<Point[]>([]);
  radiusData = signal<number[]>([]);
  markersData = signal<Marker[]>([]);
  state = signal<string>("");

  constructor() {
    navigator.serial.addEventListener("connect", (e) => {
      console.log("CONNECTED!", e);
    });

    navigator.serial.addEventListener("disconnect", (e) => {
      console.log("DISCONNECTED!", e);
    });
  }

  async connect() {
    const port = await navigator.serial.requestPort({ filters: [{ usbVendorId: this.usbVendorId }] });
    this.selectedPort.set(port);

    await port.open({ baudRate: 115200 });

    console.log("Port opened");

    let partial = "";

    while (port.readable) {
      const reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            console.log("CANCELLED");
            break;
          }
          partial += new TextDecoder().decode(value);

          if (partial.endsWith("\r\n")) {
            this.parse(partial.trim());
            partial = "";
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        reader.releaseLock();
      }
    }

    this.selectedPort.set(null);
  }

  async request_map() {
    const port = this.selectedPort();

    console.log("Writing", port);
    if (!port || !port.writable) {
      return;
    }

    const writer = port.writable.getWriter();

    try {
      await writer.write(new Uint8Array([this.header, this.commands.read_map]));
    } catch (error) {
      console.log(error);
    } finally {
      writer.releaseLock();
    }
  }

  private parse(raw: string) {
    console.log(raw);

    const [type, ...data] = raw.split(":");

    switch (type) {
      case "state": {
        this.state.set(data[0]);
        break;
      }

      case "map": {
        this.parse_map(data);
        break;
      }

      default: {
        // console.log(`SERIAL: ${type}`);
      }
    }
  }

  private parse_map(data: string[]) {
    const [type, _idx, value] = data;
    const idx = parseInt(_idx);

    switch (type) {
      case "t": {
        const [x, y] = value.split(",").map((s) => parseInt(s));
        this.trackData.update((t) => {
          t[idx] = { x, y };
          return t;
        });
        break;
      }

      case "s": {
        const [x, y] = value.split(",").map((s) => parseInt(s));
        this.shortcutData.update((t) => {
          t[idx] = { x, y };
          return t;
        });
        break;
      }

      case "m": {
        const [x, y, dist] = value.split(",").map((s) => parseInt(s));
        this.markersData.update((t) => {
          t[idx] = { pos: { x, y }, dist };
          return t;
        });
        break;
      }

      case "r": {
        const r = parseInt(value);
        this.radiusData.update((t) => {
          t[idx] = r;
          return t;
        });
        break;
      }
    }
  }
}
