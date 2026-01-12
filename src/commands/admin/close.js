import { SlashCommandBuilder, ChannelType, EmbedBuilder } from 'discord.js'
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { title } from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, '../../configs/ticket.json');

async function loadConfig() {
    try {
        const raw = await readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { guilds: {} };
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletar o ticket atual'),

    async execute(interaction) {

        const client = interaction.client;
        
        const rawConfig = await loadConfig();
        const guildId = interaction.guildId;

        if (!rawConfig.guilds?.[guildId]) {
            const embed = new EmbedBuilder()
                .setColor('Red') // verde sucesso
                .setTitle('❎ O servidor não está configurado..')
                .setDescription(`> Para conseguir enviar a mensagem primeiro é preciso configurar o servidor...`)
                .setFooter({
                    text: `Utilizado por ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }

        const config = rawConfig.guilds[guildId];

        let canalMention = `<#${interaction.channel.id}>`;

        await interaction.reply({
            content: "✅ Ticket deletado com sucesso! Este canal será deletado em 5 segundos.",
            ephemeral: true
        });

        setTimeout(async () => {
            await interaction.channel.delete("Ticket deletado");

            const clogs = await client.channels.fetch(config.ticket.logsChannelId).catch(() => null);

            if (clogs || clogs.type == ChannelType.GuildText) {

                const lmsg = new EmbedBuilder()
                    .setTitle("🎟️ Um Ticket Foi Deletado!")
                    .setDescription(
                        `📌 **Detalhes do ticket:**\n` +
                        `• **Canal:** ${canalMention}\n` +
                        `• **Usuário:** ${interaction.user}`
                    )
                    .setColor("Red")
                    .setFooter({ text: "Central de Atendimento da Liz" });

                await clogs.send({
                    embeds: [lmsg]
                });
            } else console.log("Canal de logs não compatível ou existente!")
        }, 5 * 1000);
    }
}
