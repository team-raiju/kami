import 'package:flutter/material.dart';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';
import 'package:kami/services/bluetooth.dart';
import 'package:provider/provider.dart';

class BluetoothListTile extends StatelessWidget {
  final DiscoveredDevice device;

  const BluetoothListTile(this.device, {super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(device.name),
        subtitle: Text(device.id),
        onTap: () => context.read<BluetoothService>().connect(device.id),
      ),
    );
  }
}
