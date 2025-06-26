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
  line_offset: number;
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

  private rawLogData: LogEntry[] = [];
  private rawTrackData: Point[] = [];

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

  async requestMap() {
    const port = this.selectedPort();

    console.log("Writing");
    if (!port || !port.writable) {
      return;
    }

    const writer = port.writable.getWriter();

    try {
      await writer.write(new Uint8Array([this.header, this.commands.read_map]));
      console.log("Wrote!");
    } catch (error) {
      console.log(error);
    } finally {
      writer.releaseLock();
    }
  }

  parse(raw: string) {
    const [type, ...data] = raw.split(":");

    switch (type) {
      case "state": {
        this.state.set(data[0]);
        break;
      }

      case "track_start": {
        console.log("Track Start");
        this.rawTrackData.length = 0;
        break;
      }

      case "track": {
        this.parse_track(data);
        break;
      }

      case "track_end": {
        console.log("Track End");
        this.trackData.set([...this.rawTrackData]);
        break;
      }

      case "shortcut_start": {
        this.rawTrackData.length = 0;
        break;
      }

      case "shortcut": {
        this.parse_track(data);
        break;
      }

      case "shortcut_end": {
        this.shortcutData.set([...this.rawTrackData]);
        break;
      }

      case "log_start": {
        this.rawLogData.length = 0;
        break;
      }

      case "log": {
        this.parse_log(data);
        break;
      }

      case "log_end": {
        this.logData.set(
          this.rawLogData.filter((l) => {
            return (
              Math.abs(l.velocity_ms) <= 15 &&
              Math.abs(l.target_velocity_ms) <= 15 &&
              Math.abs(l.angular_speed_rad_s) <= 10000 &&
              Math.abs(l.target_rad_s) <= 10000 &&
              Math.abs(l.pwm_left) <= 10000 &&
              Math.abs(l.pwm_right) <= 10000 &&
              Math.abs(l.pos_x) <= 10000 &&
              Math.abs(l.pos_y) <= 10000 &&
              Math.abs(l.angle) <= 10000 &&
              Math.abs(l.battery) <= 50000 &&
              Math.abs(l.battery) > 1000 &&
              Math.abs(l.line_offset) <= 10000 &&
              Math.abs(l.dist) <= 65000
            );
          }),
        );
        break;
      }

      default: {
        // console.log(`SERIAL: ${type}`);
      }
    }
  }

  private parse_log(data: string[]) {
    const idx = parseInt(data[0]);
    const values = data[1].split(";").map((d) => parseFloat(d));

    this.rawLogData[idx] = {
      velocity_ms: values[0],
      target_velocity_ms: values[1],

      angular_speed_rad_s: values[2],
      target_rad_s: values[3],

      pwm_left: values[4],
      pwm_right: values[5],

      battery: values[6],

      pos_x: values[7],
      pos_y: values[8],
      angle: values[9],
      dist: values[10],
      line_offset: values[11],
    };

    // console.log(idx, this.rawLogData.filter((l) => l).length);
  }

  private parse_track(data: string[]) {
    const [_idx, value] = data;
    const idx = parseInt(_idx);

    const [x, y] = value.split(",").map((s) => parseFloat(parseFloat(s).toFixed(2)));

    this.rawTrackData[idx] = { x, y };
  }
}
