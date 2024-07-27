export default function safe_value_with_unit(
    value: number | null | string,
    unit: string | null
) {
    if (typeof value === "number") value = value.toFixed(2);
    if (unit === "none" || value === null) unit = "";
    if (value === null) value = "-";
    return `${value} ${unit}`;
}
