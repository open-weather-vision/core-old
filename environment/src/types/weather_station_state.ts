export type ActivityState = "active" | "inactive";

export const ActivityStates: ActivityState[] = ["active", "inactive"];

export type ConnectionState =
    | "connecting"
    | "connected"
    | "connecting-failed"
    | "disconnected";

export const ConnectionStates: ConnectionState[] = [
    "connecting",
    "connected",
    "connecting-failed",
    "disconnected",
];
