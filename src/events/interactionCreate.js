export default {
  name: 'interactionCreate',
  async execute(interaction) {
    let client = interaction.client;
    
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
      await command.execute(interaction, client)
    } catch (err) {
      console.error(err)

      const msg = 'Deu erro ao executar esse comando.'
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: msg, ephemeral: true })
      } else {
        await interaction.reply({ content: msg, ephemeral: true })
      }
    }
  }
}
