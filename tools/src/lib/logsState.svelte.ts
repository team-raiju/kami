import { SvelteDate } from "svelte/reactivity";

const MAX_LOGS = 500;

export interface LogEntry {
  level: "INFO" | "WARN" | "ERROR";
  timestamp: Date;
  message: string;
}

const logs = $state<LogEntry[]>([]);

export const log = {
  get entries() {
    return logs;
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
