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
  return createPacket(PacketType.Command, [command]);
}

function createPacket(type: PacketType, data: number[]) {
  const buffer = [HEADER, type, ...data];
  return new Uint8Array(buffer);
}
