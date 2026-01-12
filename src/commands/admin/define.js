import { ChannelType, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
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

async function saveConfig(config) {
    await mkdir(path.dirname(CONFIG_PATH), { recursive: true });

    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function isDiscordSnowflake(id) {
    return /^\d{17,21}$/.test(id);
}

export default {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Definições do sistema de atendimento.')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal da mensagem do ticket.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('logs')
                .setDescription('Canal da logs dos ticket.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('feedback')
                .setDescription('Canal de recebimento dos feedbacks.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('categoria1')
                .setDescription('Categoria de não assumidos')
                .setMinLength(17)
                .setMaxLength(21)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('categoria2')
                .setDescription('Categoria de assumidos')
                .setMinLength(17)
                .setMaxLength(21)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('categoria3')
                .setDescription('Categoria de fechados')
                .setMinLength(17)
                .setMaxLength(21)
                .setRequired(true)
        ),

    async execute(interaction) {
        const client = interaction.client;

        const canal = interaction.options.getChannel('canal');
        const logs = interaction.options.getChannel('logs');
        const feedb = interaction.options.getChannel('feedback');

        const categoria1 = interaction.options.getString('categoria1');
        const categoria2 = interaction.options.getString('categoria2');
        const categoria3 = interaction.options.getString('categoria3');

        for (const [nome, id] of [
            ['categoria1', categoria1],
            ['categoria2', categoria2],
            ['categoria3', categoria3],
        ]) {
            if (!isDiscordSnowflake(id)) {
                return interaction.reply({
                    content: `❌ O valor de **${nome}** não parece um ID válido (precisa ter 17–21 dígitos).`,
                    ephemeral: true,
                });
            }
        }

        const cat1 = client.channels.cache.get(categoria1);
        const cat2 = client.channels.cache.get(categoria2);
        const cat3 = client.channels.cache.get(categoria3);

        for (const [nome, ch] of [
            ['categoria1', cat1],
            ['categoria2', cat2],
            ['categoria3', cat3],
        ]) {
            if (!ch) {
                return interaction.reply({
                    content: `❌ Não encontrei a **${nome}** no cache. Confere se o ID está certo e se o bot tem acesso ao servidor.`,
                    ephemeral: true,
                });
            }
            if (ch.type !== ChannelType.GuildCategory) {
                return interaction.reply({
                    content: `❌ O ID informado em **${nome}** não é de uma categoria (é: ${ch.type}).`,
                    ephemeral: true,
                });
            }
        }

        const config = await loadConfig();
        const guildId = interaction.guildId;

        config.guilds[guildId] ??= {};

        config.guilds[guildId].ticket = {
            channelId: canal.id,
            logsChannelId: logs.id,
            feedbackChannelId: feedb.id,
            categories: {
                naoAssumidos: categoria1,
                assumidos: categoria2,
                fechados: categoria3,
            },
        };

        await saveConfig(config);

        const embed = new EmbedBuilder()
            .setColor('#ff5efd') // verde sucesso
            .setTitle('✅ Configuração salva com sucesso')
            .setDescription('> O sistema de atendimento foi configurado corretamente :3')
            .addFields(
                {
                    name: '📨 Canal do Ticket',
                    value: `${canal}`,
                    inline: true,
                },
                {
                    name: '📝 Canal de Logs',
                    value: `${logs}`,
                    inline: true,
                },
                {
                    name: '📁 Categorias',
                    value:
                        `🔹 **Não assumidos:** <#${categoria1}>\n` +
                        `🔹 **Assumidos:** <#${categoria2}>\n` +
                        `🔹 **Fechados:** <#${categoria3}>`,
                    inline: false,
                }
            )
            .setFooter({
                text: `Configurado por ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
