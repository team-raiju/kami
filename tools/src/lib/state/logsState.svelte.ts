import { SvelteDate } from "svelte/reactivity";

const MAX_LOGS = 500;

export interface LogEntry {
  level: "INFO" | "WARN" | "ERROR";
  timestamp: Date;
  message: string;
}

const logs = $state<LogEntry[]>([]);
const serialLogs = $state<string[]>([]);

export const log = {
  get entries() {
    return logs;
  },

  get serial() {
    return serialLogs;
  },

  addSerial(message: string) {
    serialLogs.push(message);
    if (serialLogs.length > MAX_LOGS) {
      serialLogs.shift();
    }
  },

  info(message: string) {
    console.info(message);
    logs.push({ level: "INFO", timestamp: new SvelteDate(), message });
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }
  },

  warn(message: string) {
    console.warn(message);
    logs.push({ level: "WARN", timestamp: new SvelteDate(), message });
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }
  },

  error(message: string) {
    console.error(message);
    logs.push({ level: "ERROR", timestamp: new SvelteDate(), message });
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }
  },
};
