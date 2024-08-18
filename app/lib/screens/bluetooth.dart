import 'package:flutter/material.dart';
import 'package:kami/components/bluetooth_list_tile.dart';
import 'package:kami/services/bluetooth.dart';
import 'package:provider/provider.dart';

class BluetoothPage extends StatelessWidget {
  const BluetoothPage({super.key});

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BluetoothService>();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.onPrimary,
        title: const Text("Bluetooh Configuration"),
        actions: [
          IconButton(
            onPressed: () => ble.isScanning ? ble.stopScan() : ble.startScan(),
            icon: ble.isScanning ? const Icon(Icons.stop_rounded) : const Icon(Icons.search_rounded),
          ),
          IconButton(
            onPressed: ble.isConnected ? () => ble.disconnect() : null,
            icon: const Icon(Icons.bluetooth_disabled_rounded),
          ),
        ],
      ),
      body: ble.isConnected ? Text("Connected ${ble.deviceAddress}") : _DeviceList(),
    );
  }
}

class _DeviceList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final foundDevices = context.watch<BluetoothService>().foundDevices;

    return ListView(
      children: foundDevices.values.map<BluetoothListTile>((l) => BluetoothListTile(l)).toList(),
    );
  }
}
