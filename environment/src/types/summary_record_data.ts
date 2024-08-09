import { DateTime } from "luxon";

export type SummaryRecordData = {
    min_time?: DateTime | null;
    min_value?: number | null;

    max_time?: DateTime | null;
    max_value?: number | null;

    value?: number | null;
    time?: DateTime | null;

    avg_value?: number | null;

    record_count: number;
    valid_record_count: number;
    latest_update: DateTime | null;
    latest_valid_update: DateTime | null;
};
