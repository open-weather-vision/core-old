import vine from "@vinejs/vine";
import { Unit, Units } from "../units/units.js";

export class WeatherStationInterface<T>{
    protected config: T;

    constructor(config: T){
        this.config = config;
    }

    public async connect(): Promise<boolean>{
        return true;
    }

    public async disconnect(): Promise<boolean>{
        return true;
    }

    public async record(sensor_slug: string): Promise<Record>{
        return Record.nullRecord(sensor_slug);
    }

    public async command(command: string, params: any[]): Promise<CommandResponse>{
        return CommandResponse.unknownCommand(command); 
    }
}

export class Record{
    private type = "record-response";
    private sensor_slug: string;
    private value: number | null;
    private unit: Unit | "none";
    private id?: string;

    constructor(sensor_slug: string, value: number | null, unit: Unit | "none"){
        this.sensor_slug = sensor_slug;
        this.value = value;
        this.unit = unit;
    }

    static nullRecord(sensor_slug: string){
        return new Record(sensor_slug, null, "none");
    }

    withId(id: string){
        this.id = id;
        return this;
    }
}

export class CommandResponse{
    private type = "command-response";
    private command: string;
    private message: string;
    private success: boolean;
    private data?: any;
    private id?: string;

    constructor(command: string, message: string, success: boolean, data?: any){
        this.command = command;
        this.message = message;
        this.success = success;
        this.data = data;
    }

    static unknownCommand(command: string){
        return new CommandResponse(command, `Unknown command '${command}'!`, false);
    }

    withId(id: string){
        this.id = id;
        return this;
    }
}