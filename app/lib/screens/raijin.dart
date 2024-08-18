import 'package:carousel_slider/carousel_slider.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:kami/model/configuration.dart';
import 'package:kami/services/logging.dart';
import 'package:provider/provider.dart';

import 'package:kami/screens/logs.dart';
import 'package:kami/services/data.dart';

class RaijinPage extends StatelessWidget {
  const RaijinPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.onPrimary,
        title: const Text("Raijin"),
        actions: [
          // TODO: Config Page
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LogsPage())),
            icon: const Icon(Icons.article_rounded),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LogsPage())),
            icon: const Icon(Icons.article_rounded),
          ),
        ],
      ),
      body: Align(
        alignment: const AlignmentDirectional(0, -1),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: CarouselSlider(
                items: [
                  ConfigCard(
                      "Classic PID", const [RaijinHeaders.baseSpeed, RaijinHeaders.kp, RaijinHeaders.ki, RaijinHeaders.kd]),
                  ConfigCard("Waypoints PID", const [
                    RaijinHeaders.waypointBaseSpeed,
                    RaijinHeaders.waypointKp,
                    RaijinHeaders.waypointKi,
                    RaijinHeaders.waypointKd,
                    RaijinHeaders.nearWaypointDist,
                    RaijinHeaders.useWaypointDist,
                  ]),
                  ConfigCard("Track PID",
                      const [RaijinHeaders.trackBaseSpeed, RaijinHeaders.trackKp, RaijinHeaders.trackKi, RaijinHeaders.trackKd]),
                  ConfigCard("Curvature PID", const [
                    RaijinHeaders.curvaturePidMinSpeed,
                    RaijinHeaders.curvaturePidMaxSpeed,
                    RaijinHeaders.kp,
                    RaijinHeaders.ki,
                    RaijinHeaders.kd,
                    RaijinHeaders.maxAcc,
                    RaijinHeaders.maxBreak,
                    RaijinHeaders.shiftSpeedTable,
                    RaijinHeaders.breakBeforeTurn,
                    RaijinHeaders.accBeforeStraight,
                  ]),
                ],
                options: CarouselOptions(initialPage: 0, height: 400),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class ConfigCard extends StatelessWidget {
  ConfigCard(this.title, this.configs, {super.key}) {
    values = List.filled(configs.length, null);
  }

  final String title;
  final List<RaijinHeaders> configs;

  late List<int?> values;

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: 0.9,
      child: Card(
        elevation: 4,
        color: Theme.of(context).primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(10, 10, 10, 10),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.start,
                  style: const TextStyle(fontSize: 22),
                ),
                ...configs.mapIndexed(
                  (i, e) => Row(
                    children: [
                      Expanded(flex: 6, child: Text(e.name)),
                      Expanded(
                          flex: 3,
                          child: TextField(
                            keyboardType: TextInputType.number,
                            onChanged: (v) => values[i] = int.tryParse(v),
                          )),
                      Expanded(
                          flex: 1,
                          child: IconButton(
                            icon: const Icon(Icons.send),
                            onPressed: () {
                              context.read<LoggingService>().error("${e.value}, ${values[i]}");
                            },
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
