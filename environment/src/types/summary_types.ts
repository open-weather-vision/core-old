import { TimeUnit } from "../scheduler/scheduler.js";

export type ElementSummaryType =
    | "max"
    | "min"
    | "min-max"
    | "min-avg"
    | "max-avg"
    | "min-max-avg"
    | "avg"
    | "latest"
    | "oldest"
    | "sum"
    | "wind-dir-avg"
    | "custom";

export const ElementSummaryTypes: ElementSummaryType[] = [
    "max",
    "min",
    "min-max",
    "min-avg",
    "max-avg",
    "min-max-avg",
    "avg",
    "latest",
    "oldest",
    "sum",
    "wind-dir-avg",
    "custom",
];

export type SummaryInterval =
    | Exclude<TimeUnit, "second" | "minute">
    | "alltime";
export const SummaryIntervals: SummaryInterval[] = [
    "hour",
    "day",
    "week",
    "month",
    "year",
    "alltime",
];
