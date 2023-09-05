import 'dart:developer';

import 'package:flutter/foundation.dart';

enum LogSeverity { debug, info, warn, error }

class LogEntry {
  final LogSeverity severity;
  final String message;

  const LogEntry(this.severity, this.message);
}

class LoggingService extends ChangeNotifier {
  final _logs = <LogEntry>[];

  get logs => _logs;

  LoggingService() {
    log("INFO: ctor LoggingService");
  }

  debug(String message) {
    log("DEBUG: $message");
    _logs.insert(0, LogEntry(LogSeverity.debug, message));
    notifyListeners();
  }

  info(String message) {
    log("INFO: $message");
    _logs.insert(0, LogEntry(LogSeverity.info, message));
    notifyListeners();
  }

  warn(String message) {
    log("WARN: $message");
    _logs.insert(0, LogEntry(LogSeverity.warn, message));
    notifyListeners();
  }

  error(String message) {
    log("ERROR: $message");
    _logs.insert(0, LogEntry(LogSeverity.error, message));
    notifyListeners();
  }

  clear() {
    _logs.clear();
    notifyListeners();
  }
}
