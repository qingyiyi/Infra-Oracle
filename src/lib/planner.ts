export const plannerStorageKey = "infra-oracle.weekly-planner.v1";

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
  { id: "work", label: "工作", color: "#7aa2ff" },
  { id: "reading-paper", label: "读论文", color: "#54d2a0" },
  { id: "paper-revision", label: "改论文", color: "#f0c96c" },
  { id: "movie", label: "看电影", color: "#ff9cb8" },
  { id: "rest", label: "休息", color: "#9ca3af" },
  { id: "game", label: "game", color: "#b59cff" },
  { id: "drama", label: "刷剧", color: "#70d6ff" },
  { id: "novel", label: "看小说", color: "#c9a86a" },
  { id: "exercise", label: "运动", color: "#74d680" },
  { id: "project", label: "做项目", color: "#ff8a7a" },
  { id: "custom", label: "自定义", color: "#c7cad2" },
] as const;

export type PlannerTaskType = (typeof plannerTaskTypes)[number]["id"];

export interface PlannerTask {
  id: string;
  title: string;
  type: PlannerTaskType;
  startDay: number;
  endDay: number;
  note: string;
}

export const defaultPlannerTasks: PlannerTask[] = [
  {
    id: "default-work",
    title: "处理工作",
    type: "work",
    startDay: 0,
    endDay: 1,
    note: "先把最吵的事情排好队。",
  },
  {
    id: "default-reading-paper",
    title: "读两篇论文",
    type: "reading-paper",
    startDay: 0,
    endDay: 2,
    note: "重点看方法和实验设置，不逐字啃。",
  },
  {
    id: "default-paper-revision",
    title: "改论文",
    type: "paper-revision",
    startDay: 2,
    endDay: 4,
    note: "把 Related Work 和图表说明收紧一点。",
  },
  {
    id: "default-project",
    title: "做项目",
    type: "project",
    startDay: 3,
    endDay: 5,
    note: "给 Infra-Oracle 加一个会常用的小部件。",
  },
  {
    id: "default-exercise",
    title: "运动",
    type: "exercise",
    startDay: 4,
    endDay: 4,
    note: "别让肩颈替日程报警。",
  },
  {
    id: "default-movie",
    title: "看电影",
    type: "movie",
    startDay: 4,
    endDay: 4,
    note: "给周五晚上留一个不赶进度的窗口。",
  },
  {
    id: "default-game",
    title: "game",
    type: "game",
    startDay: 5,
    endDay: 5,
    note: "打一小会儿，不打到凌晨。",
  },
  {
    id: "default-drama",
    title: "刷剧",
    type: "drama",
    startDay: 5,
    endDay: 5,
    note: "只看两集，第三集交给下周。",
  },
  {
    id: "default-novel",
    title: "看小说",
    type: "novel",
    startDay: 6,
    endDay: 6,
    note: "半小时也算阅读生活。",
  },
  {
    id: "default-rest",
    title: "休息",
    type: "rest",
    startDay: 6,
    endDay: 6,
    note: "不要把周日写成另一个周一。",
  },
  {
    id: "default-custom",
    title: "自定义小安排",
    type: "custom",
    startDay: 1,
    endDay: 1,
    note: "给突然出现的好主意留一格。",
  },
];

const typeIds = new Set(plannerTaskTypes.map((type) => type.id));

export function getPlannerTaskType(typeId: string) {
  return plannerTaskTypes.find((type) => type.id === typeId) ?? plannerTaskTypes.at(-1)!;
}

export function clampPlannerDay(value: unknown): number {
  const day = Number(value);
  if (!Number.isFinite(day)) return 0;
  return Math.max(0, Math.min(6, Math.trunc(day)));
}

export function normalizePlannerTask(value: unknown, index = 0): PlannerTask | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<PlannerTask>;
  const title = String(raw.title || "").trim().slice(0, 60);
  if (!title) return null;
  const startDay = clampPlannerDay(raw.startDay);
  const endDay = Math.max(startDay, clampPlannerDay(raw.endDay));
  const type = typeIds.has(raw.type as PlannerTaskType) ? raw.type as PlannerTaskType : "custom";

  return {
    id: String(raw.id || `planner-task-${index + 1}`).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80),
    title,
    type,
    startDay,
    endDay,
    note: String(raw.note || "").trim().slice(0, 120),
  };
}

export function normalizePlannerTasks(values: unknown): PlannerTask[] {
  if (!Array.isArray(values)) return defaultPlannerTasks;
  const normalized = values
    .map((value, index) => normalizePlannerTask(value, index))
    .filter((value): value is PlannerTask => Boolean(value))
    .sort((left, right) => left.startDay - right.startDay || left.endDay - right.endDay || left.title.localeCompare(right.title));

  return normalized.length ? normalized : defaultPlannerTasks;
}

export function getPlannerPayload() {
  return {
    storageKey: plannerStorageKey,
    days: plannerDays,
    taskTypes: plannerTaskTypes,
    defaultTasks: defaultPlannerTasks,
  };
}
