import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:kami/components/custom_icons.dart';
import 'package:kami/screens/bluetooth.dart';
import 'package:kami/screens/logs.dart';
import 'package:kami/services/logging.dart';
import 'package:provider/provider.dart';

import 'package:kami/services/bluetooth.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.leanBack);
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

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
      debugShowCheckedModeBanner: false,
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
      body: Text(context.watch<BluetoothService>().data.toString()),
    );
  }
}
