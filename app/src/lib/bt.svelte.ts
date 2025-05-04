export class BluetoothService {
  static service = "0000FFE0-0000-1000-8000-00805F9B34FB".toLowerCase();
  static char = "0000FFE1-0000-1000-8000-00805F9B34FB".toLowerCase();

  isAllowed = $state(false);
  isConnected = $state(false);

  private char?: BluetoothRemoteGATTCharacteristic;

  constructor() {}

  async init() {
    const btPermission = await navigator.bluetooth.getAvailability();
    this.isAllowed = btPermission;
  }

  async connect(parser: (d: DataView) => void) {
    if (this.char != null) {
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,
        filters: [{ namePrefix: "JDY" }],
        optionalServices: [BluetoothService.service],
      });
      console.log(device.name);

      await device.gatt!.connect();
      console.log("CONECTOU");
      this.isConnected = true;

      device.addEventListener("gattserverdisconnected", () => {
        console.log("Lost BT connection");
        this.isConnected = false;
        this.char = undefined;
      });

      const service = await device.gatt!.getPrimaryService(BluetoothService.service);
      console.log(service.uuid);

      this.char = await service.getCharacteristic(BluetoothService.char);

      this.char.addEventListener("characteristicvaluechanged", (ev: unknown) => {
        const data = (ev as Event & { target: { value: DataView } }).target!.value;
        parser(data);
      });

      await this.char.startNotifications();
    } catch (e) {
      this.isConnected = false;
      this.char = undefined;
      throw e;
    }
  }

  public send(data: Uint8Array) {
    this.char?.writeValueWithoutResponse(data);
  }
}
