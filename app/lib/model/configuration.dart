enum RaijinHeaders {
  enabledLineSensors(0x00, "Enabled Line Sensors"),
  enabledSideSensors(0x01, "Enabled Side Sensors"),
  baseSpeed(0x02, "Base Speed"),
  kp(0x03, "KP"),
  kd(0x04, "KD"),
  ki(0x05, "KI"),
  waypointBaseSpeed(0x06, "Waypoint Base Speed"),
  waypointKp(0x07, "Waypoint KP"),
  waypointKd(0x08, "Waypoint KD"),
  waypointKi(0x09, "Waypoint KI"),
  trackBaseSpeed(0x0A, "Track Base Speed"),
  trackKp(0x0B, "Track KP"),
  trackKd(0x0C, "Track KD"),
  trackKi(0x0D, "Track KI"),
  brushlessSpeed(0x0E, "Brushless Speed"),
  markerTimeout(0x0F, "Marker Timeout"),
  minLeftMarkers(0x10, "Min Left Markers"),
  enableKalmanFilter(0x11, "Enable Kalman Filter"),
  kalmanFilterAlpha(0x12, "Kalman Filter Alpha"),
  kalmanFilterImuVariance(0x13, "Kalman Filter"),
  curvaturePidMaxSpeed(0x14, "Curvature PID Max Speed"),
  curvaturePidMinSpeed(0x15, "Curvature PID Min Speed"),
  breakBeforeTurn(0x16, "Break Before Turn"),
  accBeforeStraight(0x17, "Acc Before Straight"),
  shiftSpeedTable(0x18, "Shift Speed Table"),
  maxAcc(0x19, "Max Acc"),
  maxBreak(0x1A, "Max Break"),
  whiteThreshold(0x1B, "White Threshold"),
  nearWaypointDist(0x1C, "Near Waypoint Dist"),
  useWaypointDist(0x1D, "Use Waypoint Dist"),
  motorLeftOffset(0x1E, "Motor Left Offset"),
  motorRightOffset(0x1F, "Motor Right Offset");

  const RaijinHeaders(this.value, this.name);
  final int value;
  final String name;
}

class RaijinConfiguration {
  static const int currentVersion = 0x00;

  int? enabledLineSensors;
  int? enabledSideSensors;

  int? baseSpeed;
  int? kp;
  int? kd;
  int? ki;

  int? waypointBaseSpeed;
  int? waypointKp;
  int? waypointKd;
  int? waypointKi;

  int? trackBaseSpeed;
  int? trackKp;
  int? trackKd;
  int? trackKi;

  int? brushlessSpeed;

  int? markerTimeout;
  int? minLeftMarkers;

  int? batteryMv;
  get batteryMvPerCell => batteryMv == null ? null : batteryMv! / 3;

  int? lineSensors;
  int? sideSensors;

  int? enableKalmanFilter;
  int? kalmanFilterAlpha;
  int? kalmanFilterImuVariance;

  int? curvaturePidMaxSpeed;
  int? curvaturePidMinSpeed;
  int? breakBeforeTurn;
  int? accBeforeStraight;
  int? shiftSpeedTable;
  int? maxAcc;
  int? maxBreak;

  int? whiteThreshold;
  int? nearWaypointDist;

  int? useWaypointDist;

  int? timeToComplete;

  double? accGBias;
  double? gyroGBias;

  int? motorLeftOffset;
  int? motorRightOffset;

  bool updateFromPacket(List<int> packet) {
    if (packet.length != 20 || packet[0] != currentVersion) {
      return false;
    }

    if (packet[1] == 0) {
      enabledLineSensors = ((packet[2] << 8) | packet[3]);

      baseSpeed = ((packet[4] << 8) | packet[5]);
      kp = ((packet[6] << 8) | packet[7]);
      kd = ((packet[8] << 8) | packet[9]);
      ki = ((packet[10] << 8) | packet[11]);

      waypointBaseSpeed = ((packet[12] << 8) | packet[13]);
      waypointKp = ((packet[14] << 8) | packet[15]);
      waypointKd = ((packet[16] << 8) | packet[17]);
      waypointKi = ((packet[18] << 8) | packet[19]);
    } else if (packet[1] == 1) {
      trackBaseSpeed = ((packet[2] << 8) | packet[3]);
      trackKp = ((packet[4] << 8) | packet[5]);
      trackKd = ((packet[6] << 8) | packet[7]);
      trackKi = ((packet[8] << 8) | packet[9]);

      brushlessSpeed = packet[10];
      markerTimeout = packet[11];
      minLeftMarkers = packet[12];

      batteryMv = ((packet[13] << 8) | packet[14]);

      lineSensors = ((packet[15] << 8) | packet[16]);
      sideSensors = packet[17];
      timeToComplete = ((packet[18] << 8) | packet[19]);
    } else if (packet[1] == 2) {
      enabledSideSensors = packet[2];
      enableKalmanFilter = packet[3];

      kalmanFilterAlpha = ((packet[4] << 8) | packet[5]);
      kalmanFilterImuVariance = ((packet[6] << 8) | packet[7]);
      curvaturePidMaxSpeed = ((packet[8] << 8) | packet[9]);
      curvaturePidMinSpeed = ((packet[10] << 8) | packet[11]);
      breakBeforeTurn = packet[12];
      accBeforeStraight = packet[13];
      shiftSpeedTable = packet[14];
      maxAcc = packet[15];
      maxBreak = packet[16];

      whiteThreshold = ((packet[17] << 8) | packet[18]);
      nearWaypointDist = packet[19];
    } else if (packet[1] == 3) {
      accGBias = (((packet[2] << 24) | (packet[3] << 16) | (packet[4] << 8) | packet[5]) / 1000000);
      gyroGBias = (((packet[6] << 24) | (packet[7] << 16) | (packet[8] << 8) | packet[9]) / 1000000);
      useWaypointDist = packet[10];
      motorLeftOffset = packet[11];
      motorRightOffset = packet[12];
    }

    return true;
  }
}
