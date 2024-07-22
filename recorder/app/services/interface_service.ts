import StationInterface from '#models/station_interface'
import { ChildProcess, spawn } from 'child_process'
import Service from './service.js'
import {
  InterfaceConfig,
  MessageRequestCreator,
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

  public async terminate() {
    for (const station_slug of this.connected_stations) {
      await this.disconnect_from_station(station_slug)
    }
    return this.process?.kill()
  }

  public connect_to_station(station_slug: string, config: InterfaceConfig) {
    logger.info(`Connecting to station '${station_slug}'...`)
    const promise = new Promise<void>((res, rej) => {
      this.process?.once('message', async (raw_message) => {
        const [error, message] = await server_message_validator.tryValidate(raw_message)
        if (!error && message.type === 'connect-response') {
          if (message.success) {
            this.connected_stations.push(station_slug)
            res()
          } else {
            rej(new Error(`Failed to connect to '${station_slug}': ${message.message}!`)) // TODO: error feedback
          }
        } else {
          rej(
            new Error(
              `Failed to connect to '${station_slug}': ${error ? `${error.message}: ${error.messages[0].message}` : `Received unexpected response type (${message.type})!`}`
            )
          )
        }
      })
    })
    this.process?.send(MessageRequestCreator.ConnectRequest(station_slug, config))
    return promise
  }

  public disconnect_from_station(station_slug: string) {
    logger.info(`Disconnecting from station '${station_slug}'...`)
    const promise = new Promise<void>((res, rej) => {
      this.process?.once('message', async (raw_message) => {
        const [error, message] = await server_message_validator.tryValidate(raw_message)
        if (!error && message.type === 'disconnect-response') {
          if (message.success) {
            this.connected_stations = this.connected_stations.filter((slug) => slug != station_slug)
            res()
          } else {
            rej(new Error(`Failed to disconnect from '${station_slug}': ${message.message}!`)) // TODO: error feedback
          }
        } else {
          rej(
            new Error(
              `Failed to disconnect from '${station_slug}': ${error ? error.messages[0].message : `Received unexpected response type (${message.type})!`}`
            )
          )
        }
      })
    })
    this.process?.send(MessageRequestCreator.DisconnectRequest(station_slug))
    return promise
  }

  public record(station_slug: string, sensor_slug: string) {
    logger.info(`Requesting record '${station_slug}/${sensor_slug}'`)
    const promise = new Promise<{
      unit: Unit | 'none'
      value: number | null
    }>((res, rej) => {
      this.process?.once('message', async (raw_message) => {
        const [error, message] = await server_message_validator.tryValidate(raw_message)
        if (!error && message.type === 'record-response') {
          res(message.data)
        } else {
          rej(
            new Error(
              `Failed to create record for '${station_slug}/${sensor_slug}': ${error ? error.messages[0].message : `Received unexpected response type (${message.type})!`}`
            )
          )
        }
      })
    })
    this.process?.send(MessageRequestCreator.RecordRequest(station_slug, sensor_slug))
    return promise
  }

  public command(station_slug: string, command: string, params: any[]) {
    logger.info(`Sending command '${station_slug}/${command}'`)
    const promise = new Promise<{
      success: boolean
      data: any
      message: string
    }>((res, rej) => {
      this.process?.once('message', async (raw_message) => {
        const [error, message] = await server_message_validator.tryValidate(raw_message)
        if (!error && message.type === 'command-response') {
          res({
            success: message.success,
            data: message.data,
            message: message.message,
          })
        } else {
          rej(
            new Error(
              `Failed to execute command '${command}' on station '${station_slug}': ${error ? error.messages[0].message : `Received unexpected response type (${message.type})!`}`
            )
          )
        }
      })
    })
    this.process?.send(MessageRequestCreator.CommandRequest(station_slug, command, params))
    return promise
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
