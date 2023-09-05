import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:kami/screens/logs.dart';
import 'package:kami/services/logging.dart';
import 'package:provider/provider.dart';

import 'package:kami/services/bluetooth.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LoggingService()),
        ChangeNotifierProvider(
          create: (ctx) => BluetoothService(Provider.of<LoggingService>(ctx, listen: false)),
        ),
      ],
      child: const KamiApp(),
    ),
  );
}

class KamiApp extends StatelessWidget {
  const KamiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kami',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.onPrimary,
        title: const Text("Kami"),
        actions: [
          IconButton(
            onPressed: () => context.read<BluetoothService>().stopScan(),
            icon: const Icon(Icons.stop_rounded),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LogsPage())),
            icon: const Icon(Icons.article_rounded),
          ),
        ],
      ),
      body: ListView(
        children: context.watch<BluetoothService>().foundDevices.values.map<Text>((l) => Text(l.id)).toList(),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<BluetoothService>().startScan(),
        tooltip: 'Increment',
        child: const Icon(Icons.scanner_rounded),
      ),
    );
  }
}
