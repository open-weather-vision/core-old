import vine from "@vinejs/vine";
import {WeatherStationInterface} from "./weather_station_interface.js";
import { Units } from "../units/index.js";
import { randomUUID } from "crypto";

const client_message_types = vine.group([
    vine.group.if((data) => data.type === "command-request", {
      type: vine.literal("command-request"),
      command: vine.string().email(),
      params: vine.array(vine.any()) 
    }),
    vine.group.if((data) => data.type === "record-request", {
      type: vine.literal("record-request"),
      sensor_slug: vine.string()
    }),
    vine.group.if((data) => data.type === "connect-request", {
        type: vine.literal("connect-request"),
        config: vine.object({}).allowUnknownProperties()
      }),
    vine.group.if((data) => data.type === "disconnect-request", {
        type: vine.literal("disconnect-request"),
      }),
  ])

const server_message_types = vine.group([
    vine.group.if((data) => data.type === "record-response", {
        type: vine.literal("record-response"),
        sensor_slug: vine.string(),
        data: vine.object({
            value: vine.number().nullable(),
            unit: vine.enum([...Units, "none"]),
        })
      }),
      vine.group.if((data) => data.type === "command-response", {
        type: vine.literal("command-response"),
        command: vine.string(),
        message: vine.string(),
        success: vine.boolean(),
        data: vine.any().optional(),
      }),
      vine.group.if((data) => data.type === "connect-response", {
        type: vine.literal("connect-response"),
        station_slug: vine.string(),
        success: vine.boolean(),
      }),
      vine.group.if((data) => data.type === "disconnect-response", {
        type: vine.literal("disconnect-response"),
        station_slug: vine.string(),
        success: vine.boolean(),
      }),
])



export const client_message_validator = vine.compile(
    vine.object({
        station_slug: vine.string(),
        id: vine.string().uuid({version: [4]}),
    }).merge(client_message_types),
)

export const server_message_validator = vine.compile(
    vine.object({
        station_slug: vine.string(),
        id: vine.string().uuid({version: [4]}),
    }).merge(server_message_types),
)

export class MessageRequestCreator{
    public static RecordRequest(station_slug: string, sensor_slug: string){
        return {
            type: 'record-request',
            station_slug,
            sensor_slug,
            id: randomUUID(),
        }
    }

    public static CommandRequest(station_slug: string, command: string, params: any[]){
        return {
            type: 'command-request',
            station_slug,
            command,
            params,
            id: randomUUID(),
        }
    }

    public static ConnectRequest(station_slug: string, config: any){
        return {
            type: 'connect-request',
            station_slug,
            id: randomUUID(),
            config,
        }
    }

    public static DisconnectRequest(station_slug: string){
        return {
            type: 'disconnect-request',
            station_slug,
            id: randomUUID(),
        }
    }
}


export class InterfaceManager<T extends typeof WeatherStationInterface>{
    interfaces: { [Property in string]: WeatherStationInterface<any> | undefined } = {}
    interface_class: T;

    constructor(interface_class: T){
        this.interface_class = interface_class;
    }

    public start(){
        process.on("message", async (raw_message: any) => {
            const [error, message] = await client_message_validator.tryValidate(raw_message);
        
            if(error){
                return console.error("Received message in invalid format: " + error.messages[0]);
            }
        
            if(message.type === "connect-request"){
                const success = await this.connect(message.station_slug, message.config);
                process.send!({
                    type: "new-station-response",
                    station_slug: message.station_slug,
                    success
                });
            }else if(message.type === "disconnect-request"){
                const success = await this.delete(message.station_slug);
                process.send!({
                    type: "delete-station-response",
                    station_slug: message.station_slug,
                    success
                });
            }else{
                const station_interface = this.interfaces[message.station_slug];
                if(!station_interface){
                    return console.error(`Received message for unknown station interface '${message.station_slug}'!`);
                }

                let data;
                if(message.type === "command-request"){
                    data = (await station_interface.command(message.command, message.params)).withId(message.id);
                }else if(message.type === "record-request"){
                    data = (await station_interface.record(message.sensor_slug)).withId(message.id);
                }
                
                process.send!(data);
            }
            
        });
    }

    private async connect(station_slug: string, config: any){
        this.interfaces[station_slug] = new this.interface_class(config);
        return await this.interfaces[station_slug].connect();
    }

    private async delete(station_slug: string){
        const success = await this.interfaces[station_slug]?.disconnect() ?? false;
        this.interfaces[station_slug] = undefined;
        return success;
    }
}

/**
 * Configures the passed class as weather station interface of this package.
 * @param interface_class 
 */
export function setup<T extends typeof WeatherStationInterface>(interface_class: T): void{
    const manager = new InterfaceManager(interface_class);

    manager.start();
}