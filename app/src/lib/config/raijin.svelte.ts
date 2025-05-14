import { logWarn } from "$lib/log.svelte";

export const HEADER = 0xff;

const MAX_PACKET_SIZE = 20;

enum PacketType {
  Command = 0x00,
  RequestParameters = 0x01,
  UpdateParameters = 0x02,
  SensorData = 0x03,
  BatteryData = 0x04,
}

export enum PacketCommand {
  Stop = 0x00,
  Button1Short = 0x01,
  Button2Short = 0x02,
  Button1Long = 0x03,
  Button2Long = 0x04,
}

export function parsePacket(data: DataView) {
  if (data.getUint8(0) != HEADER) {
    logWarn("Invalid Header");
    return;
  }

  const type = data.getUint8(1);

  switch (type) {
    case PacketType.SensorData:
      break;
    default:
      logWarn(`Invalid packet type 0x${type.toString(16).padStart(2, "0")}`);
  }
}

export function createCommandPacket(command: PacketCommand) {
  const buffer = new ArrayBuffer(20);
  const view = new DataView(buffer);
  view.setUint8(0, HEADER);
  view.setUint8(1, PacketType.Command);
  view.setUint8(2, command);

  return new Uint8Array(buffer);
}

export function createUpdateParameterPacket(code: number, value: number) {
  const buffer = new ArrayBuffer(20);
  const view = new DataView(buffer);
  view.setUint8(0, HEADER);
  view.setUint8(1, PacketType.UpdateParameters);
  view.setUint8(2, code);
  view.setFloat32(3, value, true);

  return new Uint8Array(buffer);
}
