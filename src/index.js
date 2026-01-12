import 'dotenv/config'
import { Client, GatewayIntentBits, ActivityType, Collection } from 'discord.js'
import { loadCommands } from './handlers/commands.js'
import { loadEvents } from './handlers/events.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.commands = new Collection()

await loadCommands(client);
await loadEvents(client);

client.login(process.env.APP_TOKEN)
