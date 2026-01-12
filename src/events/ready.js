import { ActivityType, Client } from 'discord.js'

export default {
  name: 'ready',
  once: true,

  /**
   * @param {Client} client Cliente do Discord
   */
  execute(client) {
    let activitiesList =[
      "Já atendo todos..",
      "Programada pelo Oliveira",
      "Sayure me deu forma",
      "Nascida em Liones",
      "Cuidando dos atendimentos",
      `Estou em ${client.guilds.cache.size} servidores`,
      `Operando a ${client.ws.ping}ms`
    ]

    let index = 0
    setInterval(() => {

      const line = activitiesList[index];

      client.user.setPresence({
        status: 'online',
        activities: [
          {
            name: line,
            type: ActivityType.Playing
          }
        ]
      })

      index = (index + 1) % activitiesList.length

    }, 5 * 1000);

    console.log(`Liz - V1 | Logado como ${client.user.tag}`)
  }
}
