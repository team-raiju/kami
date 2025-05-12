const HEADER = 0xff;

const MAX_PACKET_SIZE = 20;

enum PacketType {
  Command = 0x00,
  RequestParameters = 0x01,
  UpdateParameters = 0x02,
  SensorData = 0x03,
  BatteryData = 0x04,
}

enum PacketCommand {
  Stop = 0x00,
  Button1Short = 0x01,
  Button2Short = 0x02,
  Button1Long = 0x03,
  Button2Long = 0x04,
}

function createPacket(type: PacketType, data: Uint8Array) {}
