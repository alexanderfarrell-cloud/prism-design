export interface TimesheetActivity {
  activity: string;
  laborType: string;
  laborCode: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export interface TimesheetDay {
  dayLabel: string;
  date: string;
  totalHours: number;
  status: "complete" | "warning" | "empty";
  job: string;
  activities: TimesheetActivity[];
  regularHours: number;
  overtimeHours: number;
  alert?: string;
}

export const TIMESHEET_DATA: TimesheetDay[] = [
  {
    dayLabel: "Sun",
    date: "3/1/2026",
    totalHours: 9.0,
    status: "complete",
    job: "Downtown Crossing",
    activities: [
      {
        activity: "Framing - Interior Walls",
        laborType: "Carpenter",
        laborCode: "C1-FR",
        startTime: "07:00",
        endTime: "12:00",
        hours: 5.0,
      },
      {
        activity: "Electrical Rough-In",
        laborType: "Electrician",
        laborCode: "",
        startTime: "13:00",
        endTime: "16:30",
        hours: 3.5,
      },
      {
        activity: "Site Cleanup",
        laborType: "Laborer",
        laborCode: "",
        startTime: "16:30",
        endTime: "17:00",
        hours: 0.5,
      },
    ],
    regularHours: 8.0,
    overtimeHours: 1.0,
  },
  {
    dayLabel: "Mon",
    date: "3/2/2026",
    totalHours: 8.0,
    status: "complete",
    job: "Downtown Crossing",
    activities: [
      {
        activity: "Framing - Interior Walls",
        laborType: "Carpenter",
        laborCode: "C1-FR",
        startTime: "07:00",
        endTime: "15:30",
        hours: 8.0,
      },
    ],
    regularHours: 8.0,
    overtimeHours: 0,
  },
  {
    dayLabel: "Tue",
    date: "3/3/2026",
    totalHours: 9.5,
    status: "warning",
    job: "Downtown Crossing",
    activities: [
      {
        activity: "Concrete Pour",
        laborType: "Laborer",
        laborCode: "L1-NH",
        startTime: "06:00",
        endTime: "12:00",
        hours: 6.0,
      },
      {
        activity: "Equipment Cleanup",
        laborType: "Equipment Operator",
        laborCode: "L2-EO",
        startTime: "11:00",
        endTime: "14:30",
        hours: 3.5,
      },
    ],
    regularHours: 8.0,
    overtimeHours: 1.5,
    alert: "Overlapping time entries",
  },
  {
    dayLabel: "Wed",
    date: "3/4/2026",
    totalHours: 8.0,
    status: "complete",
    job: "Riverside Plaza",
    activities: [
      {
        activity: "Steel Framing",
        laborType: "Ironworker",
        laborCode: "IW-1",
        startTime: "06:00",
        endTime: "14:30",
        hours: 8.0,
      },
    ],
    regularHours: 8.0,
    overtimeHours: 0,
  },
  {
    dayLabel: "Thu",
    date: "3/5/2026",
    totalHours: 4.5,
    status: "warning",
    job: "Riverside Plaza",
    activities: [
      {
        activity: "Steel Framing",
        laborType: "Ironworker",
        laborCode: "IW-1",
        startTime: "06:00",
        endTime: "10:30",
        hours: 4.5,
      },
    ],
    regularHours: 4.5,
    overtimeHours: 0,
    alert: "Incomplete shift - early departure",
  },
  {
    dayLabel: "Fri",
    date: "3/6/2026",
    totalHours: 0,
    status: "empty",
    job: "",
    activities: [],
    regularHours: 0,
    overtimeHours: 0,
  },
  {
    dayLabel: "Sat",
    date: "3/7/2026",
    totalHours: 0,
    status: "empty",
    job: "",
    activities: [],
    regularHours: 0,
    overtimeHours: 0,
  },
];

export function getTimesheetByIndex(index: number): TimesheetDay | undefined {
  return TIMESHEET_DATA[index];
}
