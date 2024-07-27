export type TargetWeatherStationState = "active" | "inactive";

export const TargetWeatherStationStates: TargetWeatherStationState[] = [
    "active",
    "inactive",
];

export type WeatherStationState =
    | "connecting"
    | "connected"
    | "connecting-failed"
    | "disconnected";

export const WeatherStationStates: WeatherStationState[] = [
    "connecting",
    "connected",
    "connecting-failed",
    "disconnected",
];
