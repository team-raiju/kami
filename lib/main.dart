import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:kami/screens/home.dart';
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
