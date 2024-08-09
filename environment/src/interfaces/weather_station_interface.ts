import vine from "@vinejs/vine";
import { CommandResponseMessage, RecordResponseMessage } from "./setup.js";

const argument_vine_group = vine.group([
    vine.group.if((val) => val.type === "enum", {
        type: vine.literal("enum"),
        choices: vine
            .array(
                vine.object({
                    title: vine.string(),
                    description: vine.string().optional(),
                    value: vine.any(),
                })
            )
            .optional(),
    }),
    vine.group.if((val) => val.type === "boolean", {
        type: vine.literal("boolean"),
    }),
    vine.group.else({
        type: vine.enum(["text", "number", "password"]),
    }),
]);

export const argument_vine_object = vine
    .object({
        default: vine.any(),
        name: vine.string(),
        description: vine.string().optional(),
    })
    .merge(argument_vine_group);

export type Argument<T> = {
    value: T;
    name: string;
    message: string;
    description?: string;
} & (
    | {
          type: "enum";
          choices?: {
              title: string;
              description?: string;
              value: T;
          }[];
      }
    | {
          type: "boolean";
      }
    | {
          type: T extends number
              ? "number"
              : T extends string
              ? "text" | "password"
              : never;
      }
);

export type InterfaceConfig = {
    [Property in string]: Argument<any>;
};

export function validate_config(
    config_schema: InterfaceConfig,
    config: InterfaceConfig
) {
    for (const key in config_schema) {
        const schema_argument = config_schema[key];
        if (!(key in config)) {
            config[key] = schema_argument;
        } else {
            const configured_argument = config[key];
            if (configured_argument.description !== schema_argument.description)
                throw new Error(
                    `Description of argument '${key}' has been damaged!`
                );
            if (configured_argument.message !== schema_argument.message)
                throw new Error(
                    `Message of argument '${key}' has been damaged!`
                );
            if (configured_argument.name !== schema_argument.name)
                throw new Error(`Name of argument '${key}' has been damaged!`);
            if (configured_argument.type !== schema_argument.type)
                throw new Error(`Type of argument '${key}' has been damaged!`);
            if (
                schema_argument.type === "enum" &&
                !schema_argument.choices
                    ?.map((choice) => choice.value)
                    .includes(configured_argument.value)
            ) {
                throw new Error(
                    `Argument '${key}': Invalid value '${configured_argument.value}' selected!`
                );
            } else if (
                (schema_argument.type === "text" ||
                    schema_argument.type === "password") &&
                typeof configured_argument.value !== "string"
            ) {
                throw new Error(
                    `Argument '${key}': Value must be of type string!`
                );
            } else if (
                schema_argument.type === "number" &&
                typeof configured_argument.value !== "number"
            ) {
                throw new Error(
                    `Argument '${key}': Value must be of type number!`
                );
            } else if (
                schema_argument.type === "boolean" &&
                typeof configured_argument.value !== "boolean"
            ) {
                throw new Error(
                    `Argument '${key}': Value must be of type boolean!`
                );
            }
        }
    }
}

export class WeatherStationInterface<T extends InterfaceConfig> {
    protected config: T;

    constructor(config: T) {
        this.config = config;
    }

    public async connect(): Promise<void> {}

    public async disconnect(): Promise<void> {}

    public async record(sensor_slug: string): Promise<Record> {
        return Record.null_record(sensor_slug);
    }

    public async command(
        command: string,
        params: any[]
    ): Promise<CommandResponse> {
        return CommandResponse.unknown_command(command);
    }
}

export class Record {
    private type = "record-response" as const;
    private sensor_slug: string;
    private value: number | null;
    private unit: string | null;

    constructor(
        sensor_slug: string,
        value: number | null,
        unit: string | null
    ) {
        this.sensor_slug = sensor_slug;
        this.value = value;
        this.unit = unit;
    }

    static null_record(sensor_slug: string) {
        return new Record(sensor_slug, null, "none");
    }

    get(id: string, station_slug: string): RecordResponseMessage {
        return {
            type: this.type,
            id,
            sensor_slug: this.sensor_slug,
            station_slug,
            data: {
                value: this.value,
                unit: this.unit,
            },
        };
    }
}

export class CommandResponse {
    private type = "command-response" as const;
    private command: string;
    private message: string;
    private success: boolean;
    private data?: any;

    constructor(
        command: string,
        message: string,
        success: boolean,
        data?: any
    ) {
        this.command = command;
        this.message = message;
        this.success = success;
        this.data = data;
    }

    static unknown_command(command: string) {
        return new CommandResponse(
            command,
            `Unknown command '${command}'!`,
            false
        );
    }

    get(id: string, station_slug: string): CommandResponseMessage {
        return {
            type: this.type,
            id,
            command: this.command,
            success: this.success,
            message: this.message,
            station_slug,
            data: this.data,
        };
    }
}
