import 'package:flutter/material.dart';

import 'package:kami/components/custom_icons.dart';
import 'package:kami/screens/bluetooth.dart';
import 'package:kami/screens/logs.dart';
import 'package:kami/screens/raijin.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.onPrimary,
        title: const Icon(CustomIcons.torii),
        actions: [
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BluetoothPage())),
            icon: const Icon(Icons.bluetooth_rounded),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LogsPage())),
            icon: const Icon(Icons.article_rounded),
          ),
        ],
      ),
      body: IconButton(
        onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RaijinPage())),
        icon: const Icon(Icons.line_axis),
      ),
    );
  }
}
