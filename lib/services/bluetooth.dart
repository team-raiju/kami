import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';

import 'package:kami/services/logging.dart';

class BluetoothService extends ChangeNotifier {
  final Uuid _serviceUuid = Uuid.parse("0000ffe0-0000-1000-8000-00805f9b34fb");
  final Uuid _characteristicUuid = Uuid.parse("0000ffe1-0000-1000-8000-00805f9b34fb");

  final _ble = FlutterReactiveBle();

  final LoggingService _logger;

  BleStatus status = BleStatus.unknown;
  var foundDevices = <String, DiscoveredDevice>{};
  String? _connectedDevice;
  get isConnected => _connectedDevice != null;

  StreamSubscription<DiscoveredDevice>? _scanSubscription;

  BluetoothService(this._logger) {
    _ble.statusStream.listen((status) {
      _logger.debug("BleStatus $status");
      this.status = status;
      notifyListeners();
    });
  }

  void startScan() async {
    _scanSubscription = _ble.scanForDevices(
      withServices: [_serviceUuid],
      scanMode: ScanMode.lowLatency,
    ).listen(
      (device) {
        if (foundDevices.keys.contains(device.id)) {
          return;
        }

        _logger.debug("Found device ${device.name} - ${device.id}");
        foundDevices[device.id] = device;
        notifyListeners();
      },
      onError: (error) => _logger.error("BLE Error: $error"),
    );
  }

  void stopScan() async {
    if (_scanSubscription == null) {
      return;
    }

    _logger.debug("Stop scanning devices");
    await _scanSubscription!.cancel();
    _scanSubscription = null;
    notifyListeners();
  }

  void connect(String deviceId) {
    stopScan();

    _ble
        .connectToAdvertisingDevice(
      id: deviceId,
      withServices: [_serviceUuid],
      servicesWithCharacteristicsToDiscover: {
        _serviceUuid: [_characteristicUuid]
      },
      prescanDuration: const Duration(seconds: 2),
      connectionTimeout: const Duration(seconds: 2),
    )
        .listen(
      (connectionState) {
        if (connectionState.connectionState == DeviceConnectionState.connected) {
          _connectedDevice = deviceId;

          final characteristic = QualifiedCharacteristic(
            characteristicId: _characteristicUuid,
            serviceId: _serviceUuid,
            deviceId: deviceId,
          );

          _ble.subscribeToCharacteristic(characteristic).listen((data) {
            _logger.info("Data received: $data");
          });

          notifyListeners();
        }
      },
      onError: (error) {
        _logger.error("BLE Error: $error");
        notifyListeners();
      },
    );
  }
}
