export interface RobotLogRecord {
  t: number; // Point index
  Vel: number; // Velocity in m/s
  TgtVel: number; // Target Velocity in m/s
  AngVel: number; // Angular Velocity in rad/s
  TgtAngVel: number; // Target Angular Velocity in rad/s
  PWM_L: number; // PWM in the left motor
  PWM_R: number; // PWM in the right motor
  Batt_mV: number; // Battery level in millivolts
  PosX: number; // X coordinate of position in mm
  PosY: number; // Y coordinate of position in mm
  Angle: number; // Current angle
  Dist: number; // Walked distance
}

let records = $state<RobotLogRecord[]>([]);

export const robotLog = {
  get entries() {
    return records;
  },

  load(newRecords: RobotLogRecord[]) {
    records = newRecords;
  },

  clear() {
    records = [];
  },

  rotatePathCounterClockwise() {
    if (records.length === 0) {
      return;
    }

    const rotatedRecords = records.map((record) => {
      const oldX = record.PosX;
      const oldY = record.PosY;

      const newX = -oldY;
      const newY = oldX;

      const newAngle = (record.Angle + 90 + 360) % 360;

      return {
        ...record,
        PosX: newX,
        PosY: newY,
        Angle: newAngle,
      };
    });

    records = rotatedRecords;
  },
};
