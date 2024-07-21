import StationInterface from "#models/station_interface";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import Service from "./service.js";

export class StationInterfaceCommunicator{
    private station_interface: StationInterface;
    private process?: ChildProcessWithoutNullStreams;

    constructor(station_interface: StationInterface){
        this.station_interface = station_interface;
    }

    private async start_process(){
        this.process = spawn(`cd /interfaces/${this.station_interface.slug} && npm run start`);

        this.process.on("message", (raw_message) => {
            const message = server_message_validator.
        });
    }

    private async connect_to_station(station_slug: string, config: any){

    }

    private async disconnect_from_station(station_slug: string){

    }

    private async record(station_slug: string, sensor_slug: string){

    }
}

class InterfaceService extends Service {
    private interfaces : { [Property in string] : StationInterfaceCommunicator }

    async ready() {
        this.logger.info(`Starting interface service`)
        const interfaces = await StationInterface.query().exec()
        for (const station_interface of interfaces) {
          try{
            await this.start_interface(station_interface)
          }catch(err){
            this.logger.error(err.message);
          }
        }
      }
    
    async start_interface(station_interface: StationInterface){

    }
}

export default new InterfaceService();