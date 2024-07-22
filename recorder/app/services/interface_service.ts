import StationInterface from '#models/station_interface'
import { ChildProcess, spawn } from 'child_process'
import Service from './service.js'
import {
  CommandResponseMessage,
  ConnectResponseMessage,
  DisconnectResponseMessage,
  InterfaceConfig,
  MessageRequestCreator,
  RecordResponseMessage,
  RequestMessage,
  ResponseMessage,
  server_message_validator,
} from 'owvision-environment/interfaces'
import { Unit } from 'owvision-environment/units'
import { sleepAwait } from 'sleep-await'
import { Logger } from '@adonisjs/core/logger'
import logger from '@adonisjs/core/services/logger'

export class StationInterfaceCommunicator {
  public station_interface: StationInterface
  private process?: ChildProcess
  private connected_stations: string[] = []

  constructor(station_interface: StationInterface) {
    this.station_interface = station_interface
    logger.info(`Spawning interface child process...`)
    this.process = spawn('node', [station_interface.meta_information.entrypoint], {
      cwd: `/interfaces/${station_interface.slug}`,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    logger.info(`Spawned interface child process!`)
    this.process.on('error', (err) => {
      logger.error(`Error on interface '${station_interface.slug}': ${err.message}`)
    })
  }

  public static async create(station_interface: StationInterface) {
    const communicator = new StationInterfaceCommunicator(station_interface)
    await sleepAwait(5000)
    return communicator
  }

  private send_request_and_wait_for_response(request: RequestMessage): Promise<ResponseMessage> {
    const promise = new Promise<ResponseMessage>((res, rej) => {
      const on_message = async (raw_message: any) => {
        const [error, message] = await server_message_validator.tryValidate(raw_message)
        if (message && message.id === request.id) {
          this.process?.removeListener('message', on_message)
          res(message)
        } else if (error && raw_message.id === request.id) {
          this.process?.removeListener('message', on_message)
          rej(
            new Error(`Validation error (request-id: ${request.id}): ${error.messages[0].message}`)
          )
        }
      }
      this.process?.on('message', on_message)
    })
    this.process?.send(request)
    return promise
  }

  public async terminate() {
    for (const station_slug of this.connected_stations) {
      await this.disconnect_from_station(station_slug)
    }
    return this.process?.kill()
  }

  public async connect_to_station(station_slug: string, config: InterfaceConfig) {
    logger.info(`Connecting to station '${station_slug}'...`)
    const response = (await this.send_request_and_wait_for_response(
      MessageRequestCreator.ConnectRequest(station_slug, config)
    )) as ConnectResponseMessage

    if (!response.success) {
      throw new Error(`Failed to connect to station '${station_slug}': ${response.message}`)
    }
  }

  public async disconnect_from_station(station_slug: string) {
    logger.info(`Disconnecting from station '${station_slug}'...`)
    const response = (await this.send_request_and_wait_for_response(
      MessageRequestCreator.DisconnectRequest(station_slug)
    )) as DisconnectResponseMessage

    if (!response.success) {
      throw new Error(`Failed to disconnect from station '${station_slug}': ${response.message}`)
    }
  }

  public async record(station_slug: string, sensor_slug: string) {
    logger.info(`Requesting record '${station_slug}/${sensor_slug}'`)
    const response = (await this.send_request_and_wait_for_response(
      MessageRequestCreator.RecordRequest(station_slug, sensor_slug)
    )) as RecordResponseMessage
    return response.data
  }

  public async command(station_slug: string, command: string, params: any[]) {
    logger.info(`Sending command '${station_slug}/${command}'`)
    const response = (await this.send_request_and_wait_for_response(
      MessageRequestCreator.CommandRequest(station_slug, command, params)
    )) as CommandResponseMessage
    return {
      success: response.success,
      message: response.message,
      data: response.data,
    }
  }
}

class InterfaceService extends Service {
  private interfaces: { [Property in string]: StationInterfaceCommunicator } = {}

  async ready() {
    logger.info(`Starting interface service`)
    const interfaces = await StationInterface.query().exec()
    for (const station_interface of interfaces) {
      try {
        await this.start_interface(station_interface)
      } catch (err) {
        logger.error(err.message)
      }
    }
  }

  async start_interface(station_interface: StationInterface) {
    logger.info(`Starting station interface '${station_interface.slug}'...`)
    this.interfaces[station_interface.slug] =
      await StationInterfaceCommunicator.create(station_interface)
  }

  get_interface_communicator(interface_slug: string): StationInterfaceCommunicator | undefined {
    return interface_slug in this.interfaces ? this.interfaces[interface_slug] : undefined
  }

  async terminating(): Promise<void> {
    for (const slug in this.interfaces) {
      await this.interfaces[slug].terminate()
    }
  }
}

export default new InterfaceService()
