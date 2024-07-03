import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const admin = await User.create({
      name: "admin",
      password: await hash.make("admin"),
      role: "admin",
    })

    const recorder = await User.create({
      name: "recorder",
      password: await hash.make("recorder"),
      role: "recorder",
    })

    const viewer = await User.create({
      name: "viewer",
      password: await hash.make("viewer"),
      role: "viewer",
    })
  }
}