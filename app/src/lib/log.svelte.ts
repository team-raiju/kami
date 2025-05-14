import { newErrorState } from "./components/log-state.svelte";

interface LogEntry {
  type: "debug" | "info" | "warn" | "error";
  text: string;
}

const DEBUG = true;

export const entries: LogEntry[] = $state([]);

export function log(type: LogEntry["type"], text?: string) {
  console.log(`[${type.toUpperCase()}] ${text}`);
  entries.unshift({ type, text: text ?? "<null>" });
}

export const logDebug = (text?: string) => DEBUG && log("debug", text);
export const logInfo = (text?: string) => log("info", text);
export const logWarn = (text?: string) => {
  newErrorState().setNewWarning();
  log("warn", text);
};
export const logError = (text?: string) => {
  newErrorState().setNewError();
  log("error", text);
};
