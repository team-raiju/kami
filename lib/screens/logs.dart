import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:kami/services/logging.dart';
import 'package:provider/provider.dart';

class LogsPage extends StatelessWidget {
  const LogsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Logs"),
        actions: [
          IconButton(
            onPressed: () => context.read<LoggingService>().clear(),
            icon: const Icon(Icons.delete_forever_rounded),
          ),
        ],
      ),
      body: const _LogList(),
    );
  }
}

class _LogList extends StatefulWidget {
  const _LogList();

  @override
  State<_LogList> createState() => _LogListState();
}

class _LogListState extends State<_LogList> {
  Color chipColor(LogSeverity severity, BuildContext context) {
    var theme = Theme.of(context);
    switch (severity) {
      case LogSeverity.debug:
        return theme.disabledColor;
      case LogSeverity.info:
        return theme.colorScheme.primaryContainer;
      case LogSeverity.warn:
        return theme.colorScheme.tertiaryContainer;
      case LogSeverity.error:
        return theme.colorScheme.errorContainer;
    }
  }

  @override
  Widget build(BuildContext context) {
    final logs = context.watch<LoggingService>().logs;
    return ListView(
      children: logs
          .map<ListTile>(
            (l) => ListTile(
              leading: Chip(
                label: Text(describeEnum(l.severity)),
                visualDensity: VisualDensity.compact,
                backgroundColor: chipColor(l.severity, context),
              ),
              title: Text(l.message),
            ),
          )
          .toList(),
    );
  }
}
