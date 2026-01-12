import { ChannelType, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
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
        .setName('send')
        .setDescription('Aplicar mensagem do sistema de atendimento.')
        .addStringOption(option =>
            option
                .setName('titulo')
                .setDescription('Titulo da mensagem')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('mensagem')
                .setDescription('Conteúdo da mensagem')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('botao')
                .setDescription('Mensagem do botão')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('rodape')
                .setDescription('Rodapé da mensagem')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('thumbnail')
                .setDescription('Imagem de cima')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('imagem')
                .setDescription('Imagem de baixo')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('cor')
                .setDescription('Cor do embed, padrão branco')
                .setRequired(false)
        ),

    async execute(interaction) {
        const client = interaction.client;

        const title = interaction.options.getString("titulo");
        const message = interaction.options.getString("mensagem");
        const buttonMsg = interaction.options.getString("botao");
        const footerMsg = interaction.options.getString("rodape");
        const thumb = interaction.options.getString("thumbnail");
        const image = interaction.options.getString("imagem");
        const color = interaction.options.getString("cor") || "White";

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

        const canal = await client.channels.fetch(config.ticket.channelId).catch(() => null);

        if (!canal || canal.type !== ChannelType.GuildText) {
            const embed = new EmbedBuilder()
                .setColor('Red') // verde sucesso
                .setTitle('❎ O canal não é compatível..')
                .setDescription(`> Para conseguir enviar a mensagem o canal deve existir e ser de texto...`)
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

        // Mensagem A Ser Enviada

        const botaum = new ButtonBuilder()
            .setCustomId("open_ticket")
            .setLabel(buttonMsg)
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(botaum);

        const smsg = new EmbedBuilder();

        smsg.setColor(color);
        smsg.setTitle(title);
        smsg.setDescription(message);
        smsg.setFooter(footerMsg);
        if (thumb) smsg.setThumbnail(thumb);
        if (image) smsg.setImage(image);

        await canal.send({
            embeds: [smsg],
            components: [row]
        });

        // Retorno Do Sucesso

        const embed = new EmbedBuilder()
            .setColor('Green') // verde sucesso
            .setTitle('✅ Mensagem enviada com sucesso')
            .setDescription(`> A mensaggem de abrir ticket foi enviada corretamente para o canal ${canal} :3`)
            .setFooter({
                text: `Enviado por ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
