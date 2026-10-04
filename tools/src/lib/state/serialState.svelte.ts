import { log } from "./logsState.svelte";
import { track, type TrackPoint } from "./trackState.svelte";

interface SerialState {
  port: SerialPort | null;
}

let state = $state<SerialState>({
  port: null,
});

let rawTrackData: TrackPoint[] = [];

navigator.serial.addEventListener("connect", (e) => {
  log.info(`Serial connected. [${e}]`);
});

navigator.serial.addEventListener("disconnect", (e) => {
  log.info(`Serial disconnected [${e}]`);
});

const usbVendorId = 0x0483;
const header = 0xaa;
const commands = {
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

function parse_track(data: string[]) {
  const [_idx, value] = data;
  const idx = parseInt(_idx);

  const [x, y] = value.split(",").map((s) => parseFloat(parseFloat(s).toFixed(2)));

  rawTrackData[idx] = { x, y };
}

import { fujinLog } from "./fujinLogState.svelte";

let rawLogBuffer: string[] = [];
let isCapturingLog = false;

function parse(raw: string) {
  const [type, ...data] = raw.split(":");

  switch (type) {
    case "track_start": {
      log.info("Received track start");
      rawTrackData.length = 0;
      break;
    }

    case "track": {
      parse_track(data);
      break;
    }

    case "track_end": {
      track.setPoints([...rawTrackData]);
      break;
    }

    case "log_start": {
      log.info("Received log start");
      rawLogBuffer = [];
      isCapturingLog = true;
      break;
    }

    case "log_end": {
      log.info(`Received log end (${rawLogBuffer.length} lines)`);
      isCapturingLog = false;
      if (rawLogBuffer.length > 0) {
        fujinLog.loadText(rawLogBuffer.join("\n"), "serial_log.txt");
      }
      break;
    }

    case "log": {
      // e.g. log:idx:data
      if (data.length >= 2) {
        rawLogBuffer.push(data.slice(1).join(":"));
      } else if (data.length === 1) {
        rawLogBuffer.push(data[0]);
      }
      break;
    }

    default: {
      // Check if this line looks like a CSV telemetry line (semicolons with numbers/headers)
      if (raw.startsWith("t;") || raw.startsWith("Time;") || raw.startsWith("Time(ms);")) {
        isCapturingLog = true;
        rawLogBuffer = [raw];
        log.info("Started streaming telemetry log");
      } else if (isCapturingLog) {
        if (raw.includes(";") && !isNaN(Number(raw.split(";")[0]))) {
          rawLogBuffer.push(raw);
          // If we reach the end of log stream or idle after burst
        } else {
          // Non-telemetry line received while capturing
          if (rawLogBuffer.length > 1) {
            fujinLog.loadText(rawLogBuffer.join("\n"), "streamed_log.txt");
          }
          isCapturingLog = false;
        }
      }
      log.addSerial(raw);
    }
  }
}

const _connected = $derived(state.port != null);

export const serial = {
  get connected() {
    return _connected;
  },

  async connect() {
    if (state.port) {
      log.error("Port already opened");
      return;
    }

    state.port = await navigator.serial.requestPort({ filters: [{ usbVendorId }] });
    if (!state.port) {
      log.error("Failed to request port");
      return;
    }
    await state.port.open({ baudRate: 115200 });
    log.info("Port opened");

    let partial = "";
    while (state.port.readable) {
      const reader = state.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            log.warn("Serial reading cancelled");
            break;
          }
          partial += new TextDecoder().decode(value);

          if (partial.endsWith("\r\n")) {
            parse(partial.trim());
            partial = "";
          }
        }
      } catch (error) {
        log.error(`${error}`);
      } finally {
        reader.releaseLock();
      }
    }

    state.port = null;
  },

  async readTrack() {
    const port = state.port;

    if (!port || !port.writable) {
      log.error("Port is null or not writable");
      return;
    }

    const writer = port.writable.getWriter();

    try {
      await writer.write(new Uint8Array([header, commands.read_map]));
    } catch (error) {
      log.error(`${error}`);
    } finally {
      writer.releaseLock();
    }
  },

  async readLog() {
    const port = state.port;

    if (!port || !port.writable) {
      log.error("Port is null or not writable");
      return;
    }

    const writer = port.writable.getWriter();

    try {
      rawLogBuffer = [];
      isCapturingLog = true;
      await writer.write(new Uint8Array([header, commands.read_log]));
      log.info("Requested log dump from robot");
    } catch (error) {
      log.error(`${error}`);
    } finally {
      writer.releaseLock();
    }
  },
};

