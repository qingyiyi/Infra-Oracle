export const plannerStorageKey = "infra-oracle.weekly-planner.v2";
export const plannerWeekStoragePrefix = "infra-oracle.weekly-planner.v3.week";
export const plannerExportSchema = "infra-oracle.weekly-planner.export";
export const plannerExportVersion = 2;

export const plannerStartMinute = 6 * 60;
export const plannerEndMinute = 24 * 60;
export const plannerTotalMinutes = plannerEndMinute - plannerStartMinute;

export const plannerDays = [
  { index: 0, key: "mon", label: "周一", shortLabel: "Mon" },
  { index: 1, key: "tue", label: "周二", shortLabel: "Tue" },
  { index: 2, key: "wed", label: "周三", shortLabel: "Wed" },
  { index: 3, key: "thu", label: "周四", shortLabel: "Thu" },
  { index: 4, key: "fri", label: "周五", shortLabel: "Fri" },
  { index: 5, key: "sat", label: "周六", shortLabel: "Sat" },
  { index: 6, key: "sun", label: "周日", shortLabel: "Sun" },
] as const;

export const plannerTaskTypes = [
  { id: "commute", label: "通勤", color: "#70d6ff" },
  { id: "work", label: "工作", color: "#7aa2ff" },
  { id: "class", label: "上课", color: "#b59cff" },
  { id: "reading-paper", label: "读论文", color: "#54d2a0" },
  { id: "paper-revision", label: "改论文", color: "#f0c96c" },
  { id: "project", label: "做项目", color: "#ff8a7a" },
  { id: "movie", label: "看电影", color: "#ff9cb8" },
  { id: "rest", label: "休息", color: "#9ca3af" },
  { id: "game", label: "game", color: "#c9a86a" },
  { id: "drama", label: "刷剧", color: "#87d37c" },
  { id: "novel", label: "看小说", color: "#d3a1ff" },
  { id: "fitness", label: "运动", color: "#74d680" },
  { id: "custom", label: "自定义", color: "#c7cad2" },
] as const;

export type PlannerTaskType = (typeof plannerTaskTypes)[number]["id"];

export interface PlannerTask {
  id: string;
  title: string;
  type: PlannerTaskType;
  day: number;
  startTime: string;
  endTime: string;
  note: string;
}

const defaultWeekdayTasks: PlannerTask[] = [
  {
    id: "default-mon-commute-morning",
    title: "通勤",
    type: "commute",
    day: 0,
    startTime: "08:00",
    endTime: "10:00",
    note: "路上可以听一集播客，别和早高峰硬碰硬。",
  },
  {
    id: "default-mon-work-morning",
    title: "工作",
    type: "work",
    day: 0,
    startTime: "10:00",
    endTime: "12:00",
    note: "先处理最需要脑子的部分。",
  },
  {
    id: "default-mon-work-afternoon",
    title: "工作",
    type: "work",
    day: 0,
    startTime: "14:00",
    endTime: "19:00",
    note: "下午留给推进和收尾。",
  },
  {
    id: "default-mon-project-night",
    title: "做项目",
    type: "project",
    day: 0,
    startTime: "20:00",
    endTime: "22:00",
    note: "晚上只做一件真正会前进的事。",
  },
  {
    id: "default-tue-work-morning",
    title: "工作",
    type: "work",
    day: 1,
    startTime: "10:00",
    endTime: "12:00",
    note: "把上午写成可以交付的两小时。",
  },
  {
    id: "default-tue-work-afternoon",
    title: "工作",
    type: "work",
    day: 1,
    startTime: "14:00",
    endTime: "19:00",
    note: "把碎事集中处理，不让它们散开。",
  },
  {
    id: "default-tue-commute-night",
    title: "通勤",
    type: "commute",
    day: 1,
    startTime: "21:00",
    endTime: "23:00",
    note: "和项目时间重叠时，以当天实际情况为准。",
  },
  {
    id: "default-wed-class-morning",
    title: "上课",
    type: "class",
    day: 2,
    startTime: "10:00",
    endTime: "12:00",
    note: "课前把要问的问题列出来。",
  },
  {
    id: "default-wed-class-afternoon",
    title: "上课",
    type: "class",
    day: 2,
    startTime: "13:30",
    endTime: "15:00",
    note: "这段不要被午后的困意偷走。",
  },
  {
    id: "default-wed-fitness",
    title: "健身",
    type: "fitness",
    day: 2,
    startTime: "16:00",
    endTime: "17:00",
    note: "让身体也知道这周在正常运行。",
  },
  {
    id: "default-wed-class-night",
    title: "上课",
    type: "class",
    day: 2,
    startTime: "19:00",
    endTime: "22:00",
    note: "晚上保持轻装，听懂比记满更重要。",
  },
  {
    id: "default-thu-commute-morning",
    title: "通勤",
    type: "commute",
    day: 3,
    startTime: "08:00",
    endTime: "10:00",
    note: "把路程当成进入工作状态的缓冲。",
  },
  {
    id: "default-thu-work-morning",
    title: "工作",
    type: "work",
    day: 3,
    startTime: "10:00",
    endTime: "12:00",
    note: "周四上午适合把难点拆开。",
  },
  {
    id: "default-thu-work-afternoon",
    title: "工作",
    type: "work",
    day: 3,
    startTime: "14:00",
    endTime: "19:00",
    note: "下午把可见进度留在表面上。",
  },
  {
    id: "default-thu-project-night",
    title: "做项目",
    type: "project",
    day: 3,
    startTime: "20:00",
    endTime: "22:00",
    note: "做一点能被明天接住的东西。",
  },
  {
    id: "default-fri-work-morning",
    title: "工作",
    type: "work",
    day: 4,
    startTime: "10:00",
    endTime: "12:00",
    note: "先收口，不把周末借出去。",
  },
  {
    id: "default-fri-work-afternoon",
    title: "工作",
    type: "work",
    day: 4,
    startTime: "14:00",
    endTime: "19:00",
    note: "把本周尾巴整理干净。",
  },
  {
    id: "default-fri-commute-night",
    title: "通勤",
    type: "commute",
    day: 4,
    startTime: "21:00",
    endTime: "23:00",
    note: "回程慢一点也没关系。",
  },
];

export const defaultPlannerTasks: PlannerTask[] = defaultWeekdayTasks;

const typeIds = new Set(plannerTaskTypes.map((type) => type.id));

export const plannerHourTicks = Array.from({ length: 19 }, (_, index) =>
  minutesToTime(plannerStartMinute + index * 60),
);

export const plannerHalfHourTicks = Array.from({ length: 37 }, (_, index) =>
  minutesToTime(plannerStartMinute + index * 30),
);

export function getPlannerTaskType(typeId: string) {
  return plannerTaskTypes.find((type) => type.id === typeId) ?? plannerTaskTypes.at(-1)!;
}

export function clampPlannerDay(value: unknown): number {
  const day = Number(value);
  if (!Number.isFinite(day)) return 0;
  return Math.max(0, Math.min(6, Math.trunc(day)));
}

export function timeToMinutes(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
  if (hours === 24 && minutes !== 0) return null;

  return hours * 60 + minutes;
}

export function minutesToTime(value: number): string {
  const minutes = Math.max(0, Math.min(24 * 60, Math.trunc(value)));
  const hoursPart = Math.trunc(minutes / 60);
  const minutesPart = minutes % 60;
  return `${String(hoursPart).padStart(2, "0")}:${String(minutesPart).padStart(2, "0")}`;
}

export function clampPlannerTime(value: unknown, fallback = plannerStartMinute): string {
  const minutes = timeToMinutes(value);
  if (minutes === null) return minutesToTime(fallback);
  return minutesToTime(Math.max(plannerStartMinute, Math.min(plannerEndMinute, minutes)));
}

export function getTaskStartMinutes(task: Pick<PlannerTask, "startTime">): number {
  return timeToMinutes(task.startTime) ?? plannerStartMinute;
}

export function getTaskEndMinutes(task: Pick<PlannerTask, "endTime">): number {
  return timeToMinutes(task.endTime) ?? plannerEndMinute;
}

export function getTaskTimeRangeText(task: Pick<PlannerTask, "startTime" | "endTime">): string {
  return `${task.startTime}-${task.endTime}`;
}

function compactTimeText(value: string): string {
  return value.replace(/^0?(\d{1,2}):00$/, "$1").replace(/^0?(\d{1,2}):(\d{2})$/, "$1:$2");
}

export function getTaskCompactTimeRangeText(task: Pick<PlannerTask, "startTime" | "endTime">): string {
  return `${compactTimeText(task.startTime)}-${compactTimeText(task.endTime)}`;
}

export function getTaskPosition(task: Pick<PlannerTask, "startTime" | "endTime">) {
  const start = Math.max(plannerStartMinute, Math.min(plannerEndMinute, getTaskStartMinutes(task)));
  const end = Math.max(start + 1, Math.min(plannerEndMinute, getTaskEndMinutes(task)));
  return {
    left: ((start - plannerStartMinute) / plannerTotalMinutes) * 100,
    width: ((end - start) / plannerTotalMinutes) * 100,
  };
}

export function getPlannerDayTaskLayout(tasks: PlannerTask[]) {
  const sorted = tasks.slice().sort((left, right) =>
    getTaskStartMinutes(left) - getTaskStartMinutes(right) ||
    getTaskEndMinutes(left) - getTaskEndMinutes(right) ||
    left.title.localeCompare(right.title),
  );
  const laneEnds: number[] = [];
  const items = sorted.map((task) => {
    const start = getTaskStartMinutes(task);
    const end = getTaskEndMinutes(task);
    let laneIndex = laneEnds.findIndex((laneEnd) => laneEnd <= start);

    if (laneIndex === -1) {
      laneIndex = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[laneIndex] = end;
    }

    return {
      task,
      laneIndex,
    };
  });

  return {
    items,
    laneCount: Math.max(laneEnds.length, 1),
  };
}

export function normalizePlannerTask(value: unknown, index = 0): PlannerTask | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<PlannerTask>;
  const title = String(raw.title || "").trim().slice(0, 60);
  if (!title) return null;

  const day = clampPlannerDay(raw.day);
  const fallbackStart = plannerStartMinute;
  const fallbackEnd = plannerStartMinute + 60;
  const startMinutes = Math.max(
    plannerStartMinute,
    Math.min(plannerEndMinute - 1, timeToMinutes(clampPlannerTime(raw.startTime, fallbackStart)) ?? fallbackStart),
  );
  const rawEndMinutes = timeToMinutes(clampPlannerTime(raw.endTime, fallbackEnd)) ?? fallbackEnd;
  const endMinutes = Math.max(startMinutes + 1, Math.min(plannerEndMinute, rawEndMinutes));
  const type = typeIds.has(raw.type as PlannerTaskType) ? raw.type as PlannerTaskType : "custom";

  return {
    id: String(raw.id || `planner-task-${index + 1}`).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80),
    title,
    type,
    day,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
    note: String(raw.note || "").trim().slice(0, 120),
  };
}

export function normalizePlannerTasks(values: unknown): PlannerTask[] {
  if (!Array.isArray(values)) return defaultPlannerTasks;
  const normalized = values
    .map((value, index) => normalizePlannerTask(value, index))
    .filter((value): value is PlannerTask => Boolean(value))
    .sort((left, right) =>
      left.day - right.day ||
      getTaskStartMinutes(left) - getTaskStartMinutes(right) ||
      getTaskEndMinutes(left) - getTaskEndMinutes(right) ||
      left.title.localeCompare(right.title),
    );

  return normalized;
}

export function getPlannerPayload() {
  return {
    storageKey: plannerStorageKey,
    weekStoragePrefix: plannerWeekStoragePrefix,
    exportSchema: plannerExportSchema,
    exportVersion: plannerExportVersion,
    days: plannerDays,
    taskTypes: plannerTaskTypes,
    defaultTasks: defaultPlannerTasks,
    startMinute: plannerStartMinute,
    endMinute: plannerEndMinute,
    hourTicks: plannerHourTicks,
    halfHourTicks: plannerHalfHourTicks,
  };
}
