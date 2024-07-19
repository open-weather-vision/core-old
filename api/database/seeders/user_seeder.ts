import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      name: "admin",
      password: await hash.make("admin"),
      role: "admin",
    })

    await User.create({
      name: "recorder",
      password: await hash.make("recorder"),
      role: "recorder",
    })

    await User.create({
      name: "viewer",
      password: await hash.make("viewer"),
      role: "viewer",
    })
  }
}