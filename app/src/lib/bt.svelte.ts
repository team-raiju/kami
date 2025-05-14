import * as Raijin from "./config/raijin.svelte";
import { logDebug, logError, logWarn } from "./log.svelte";

class BluetoothService {
  static service = "0000FFE0-0000-1000-8000-00805F9B34FB".toLowerCase();
  static char = "0000FFE1-0000-1000-8000-00805F9B34FB".toLowerCase();

  isAllowed = $state(false);
  isConnected = $state(false);

  private char?: BluetoothRemoteGATTCharacteristic;

  constructor() {}

  async init() {
    try {
      const btPermission = await navigator.bluetooth.getAvailability();
      this.isAllowed = btPermission;
    } catch (e) {
      logError(`Failed to check bluetooth availability: ${e}`);
    }

    if (!this.isAllowed) {
      logError("Bluetooth is not available or enabled");
    }
  }

  async connect() {
    if (this.char != null) {
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,
        filters: [{ namePrefix: "JDY" }],
        optionalServices: [BluetoothService.service],
      });
      logDebug(device.name);

      await device.gatt!.connect();
      logDebug("CONECTOU");
      this.isConnected = true;

      device.addEventListener("gattserverdisconnected", () => {
        logDebug("Lost BT connection");
        this.isConnected = false;
        this.char = undefined;
      });

      const service = await device.gatt!.getPrimaryService(BluetoothService.service);
      logDebug(service.uuid);

      this.char = await service.getCharacteristic(BluetoothService.char);

      this.char.addEventListener("characteristicvaluechanged", (ev: unknown) => {
        const data = (ev as Event & { target: { value: DataView } }).target!.value;
        if (data.getUint8(0) === Raijin.HEADER) {
          Raijin.parsePacket(data);
        }
      });

      await this.char.startNotifications();
    } catch (e) {
      this.isConnected = false;
      this.char = undefined;
      logError(`Bluetooth connection failed: ${e}`);
      throw e;
    }
  }

  public async send(data: Uint8Array) {
    if (this.char == null) {
      logWarn("Tried to send value without connection");
      return;
    }

    try {
      await this.char.writeValueWithoutResponse(data);
    } catch {
      logError("Failed to send value");
    }
  }
}

export const bluetoothService = new BluetoothService();
