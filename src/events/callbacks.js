import { openTicketModal } from "../forms/openTicket.js";
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { title } from 'node:process';
import { fileURLToPath } from 'node:url';

import { ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { openFeedbackModal } from "../forms/feedback.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, '../configs/ticket.json');

async function loadConfig() {
    try {
        const raw = await readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { guilds: {} };
    }
}

function hasPermission(config, interaction) {
    const member = interaction.member;
    const roleId = config.ticket.staffRoleId;

    if (!member) return false;

    return (
        member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        (roleId && member.roles.cache.has(roleId))
    );
}

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        let client = interaction.client;

        if (interaction.isModalSubmit()) {
            const guild = interaction.guild;
            const user = interaction.user;

            const rawConfig = await loadConfig();
            const guildId = interaction.guildId;

            if (!rawConfig.guilds?.[guildId]) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❎ Algo deu errado..')
                    .setDescription(`> Reporte aos membros da staff o erro *NCF01*`)
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

            if (interaction.customId === 'ticketModal') {

                const assunto = interaction.fields.getTextInputValue('assunto');
                const descricao = interaction.fields.getTextInputValue('descricao');

                const canal = await client.channels.fetch(config.ticket.channelId).catch(() => null);

                if (!canal || canal.type !== ChannelType.GuildText) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('❎ Algo deu errado..')
                        .setDescription(`> Reporte aos membros da staff o erro *NCN01*`)
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

                const staffRoleId = config.ticket.staffRoleId;

                const ticketCN = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    parent: config.ticket.categories.naoAssumidos,
                    topic: `ticketOwner:${user.id}`,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [
                                PermissionsBitField.Flags.ViewChannel,
                            ],
                        },

                        // usuário do ticket
                        {
                            id: user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                            ],
                        },

                        // staff
                        {
                            id: staffRoleId,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageMessages,
                            ],
                        },

                        // bot
                        {
                            id: guild.members.me.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageChannels,
                            ],
                        },
                    ],
                });

                // Mensagem Do Ticket

                const bfechar = new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Fechar Ticket")
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Secondary);

                const bassumir = new ButtonBuilder()
                    .setCustomId("claim_ticket")
                    .setLabel("Assumir Ticket")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success);

                const bnotificar = new ButtonBuilder()
                    .setCustomId("notify_ticket")
                    .setLabel("Notificar")
                    .setEmoji("🛎️")
                    .setStyle(ButtonStyle.Secondary);


                const row = new ActionRowBuilder()
                    .addComponents(bfechar, bassumir, bnotificar);

                const tmsg = new EmbedBuilder()
                    .setTitle("🎟️ Ticket Criado com Sucesso!")
                    .setDescription(
                        `Olá! Seu atendimento foi aberto com sucesso.\n\n` +
                        `📌 **Detalhes do ticket:**\n` +
                        `• **Assunto:** ${assunto}\n` +
                        `• **Descrição:** ${descricao}\n\n` +
                        `⏳ Nossa equipe de suporte irá atendê-lo em breve.`
                    )
                    .setColor("Green")
                    .setFooter({ text: "Central de Atendimento da Liz" });

                await ticketCN.send({
                    content: `👋 Olá, ${user}!`,
                    embeds: [tmsg],
                    components: [row]
                });


                const clogs = await client.channels.fetch(config.ticket.logsChannelId).catch(() => null);

                if (clogs || clogs.type == ChannelType.GuildText) {

                    const lmsg = new EmbedBuilder()
                        .setTitle("🎟️ Um Novo Ticket Foi Criado!")
                        .setDescription(
                            `📌 **Detalhes do ticket:**\n` +
                            `• **Assunto:** ${assunto}\n` +
                            `• **Descrição:** ${descricao}\n\n` +
                            `• **Usuário:** ${user}`
                        )
                        .setColor("Green")
                        .setFooter({ text: "Central de Atendimento da Liz" });

                    await clogs.send({
                        embeds: [lmsg]
                    });
                } else console.log("Canal de logs não compatível ou existente!")
                // Final De Tudo

                return interaction.reply({
                    content: `🎫 Ticket aberto!\n**Assunto:** ${assunto}`,
                    ephemeral: true,
                });
            }

            if (interaction.customId == "feedbackModal") {

                const nota = interaction.fields.getTextInputValue('nota');
                const descricao = interaction.fields.getTextInputValue('descricao');
                const funcionario = interaction.fields.getTextInputValue('funcionario');

                const canal = await client.channels.fetch(config.ticket.feedbackChannelId).catch(() => null);

                if (!canal || canal.type !== ChannelType.GuildText) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('❎ Algo deu errado..')
                        .setDescription(`> Reporte aos membros da staff o erro *NCN02*`)
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

                const emb = new EmbedBuilder()
                    .setTitle("🗳️ Novo Feedback Recebido!")
                    .setDescription("> Novo feedback recebido, agradecemos pela ação de compartilhar sua experiência, isso nos ajuda a mostrar de forma transparente como é nossa qualidade. :3")
                    .setFields(
                        { name: "🙍‍♂️ Usuário", value: interaction.user.tag, inline: true },
                        { name: "🗳️ Nota", value: nota, inline: true },
                        { name: "✉️ Descrição", value: descricao, inline: false },
                        { name: "🧑‍💻 Funcionário", value: funcionario || "Nenhum", inline: false },
                    )
                    .setColor("Green")
                    .setFooter({
                        text: `Utilizado por ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await canal.send({
                    embed: [emb]
                });
            }
        }


        /////////////////////////////////////////////////////////////////////////

        if (interaction.isButton()) {
            const rawConfig = await loadConfig();
            const guildId = interaction.guildId;

            if (!rawConfig.guilds?.[guildId]) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❎ Algo deu errado..')
                    .setDescription(`> Reporte aos membros da staff o erro *NCF01*`)
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

            const client = interaction.client;

            if (interaction.customId == 'open_ticket') {
                return openTicketModal(interaction);
            }

            if (interaction.customId === "close_ticket") {

                let canalMention = `${interaction.channel.name}`;

                if (!hasPermission(config, interaction)) {
                    return openFeedbackModal(interaction);
                }

                const clogs = await client.channels.fetch(config.ticket.logsChannelId).catch(() => null);

                if (clogs || clogs.type == ChannelType.GuildText) {

                    const lmsg = new EmbedBuilder()
                        .setTitle("🎟️ Um Ticket Foi Fechado!")
                        .setDescription(
                            `📌 **Detalhes do ticket:**\n` +
                            `• **Canal:** ${canalMention}\n` +
                            `• **Quem Fechou:** ${interaction.user}`
                        )
                        .setColor("#676767")
                        .setFooter({ text: "Central de Atendimento da Liz" });

                    await clogs.send({
                        embeds: [lmsg]
                    });
                } else console.log("Canal de logs não compatível ou existente!")


                await interaction.reply("✅ Ticket fechado com sucesso! Este canal será fechado em 5 segundos.");

                // Troca o botão "Fechar Ticket" por "Deletar Ticket" (vermelho) e id delete_ticket
                const newComponents = interaction.message.components.map(row => {
                    const rebuiltRow = new ActionRowBuilder();

                    row.components.forEach(component => {
                        // Se for o botão de fechar, substitui por delete_ticket
                        if (component.customId === "close_ticket") {
                            const delBtn = new ButtonBuilder()
                                .setCustomId("delete_ticket")
                                .setLabel("Deletar Ticket")
                                .setEmoji("🗑️")
                                .setStyle(ButtonStyle.Danger);

                            rebuiltRow.addComponents(delBtn);
                            return;
                        }

                        // Mantém os demais botões como estão
                        rebuiltRow.addComponents(ButtonBuilder.from(component));
                    });

                    return rebuiltRow;
                });

                await interaction.message.edit({ components: newComponents });

                const channel = interaction.channel;

                const match = channel.topic?.match(/ticketOwner:(\d+)/);
                const ownerId = match?.[1];

                if (ownerId) {
                    await channel.permissionOverwrites.edit(ownerId, {
                        ViewChannel: false,
                        SendMessages: false,
                    });
                }

                setTimeout(async () => {
                    const channel = interaction.channel;
                    await channel.setParent(config.ticket.categories.fechados, { lockPermissions: false });
                }, 5 * 1000);
            }


            if (interaction.customId == "claim_ticket") {

                let canalMention = `${interaction.channel.name}`;

                if (!hasPermission(config, interaction)) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❎ Sem Permissão..")
                        .setDescription(`> Você não pode efetuar essa aão por falta de permissão.`)
                        .setTimestamp();

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const clogs = await client.channels.fetch(config.ticket.logsChannelId).catch(() => null);

                if (clogs || clogs.type == ChannelType.GuildText) {

                    const lmsg = new EmbedBuilder()
                        .setTitle("🎟️ Um Ticket Foi Assumido!")
                        .setDescription(
                            `📌 **Detalhes do ticket:**\n` +
                            `• **Canal:** ${canalMention}\n` +
                            `• **Quem Assumiu:** ${interaction.user}`
                        )
                        .setColor("Yellow")
                        .setFooter({ text: "Central de Atendimento da Liz" });

                    await clogs.send({
                        embeds: [lmsg]
                    });
                } else console.log("Canal de logs não compatível ou existente!")

                const channel = interaction.channel;

                await interaction.deferUpdate();

                const newComponents = interaction.message.components.map(row => {
                    const rebuiltRow = new ActionRowBuilder();

                    row.components.forEach(component => {
                        const btn = ButtonBuilder.from(component);

                        if (component.customId === "claim_ticket") {
                            btn.setDisabled(true).setLabel("Ticket assumido");
                        }

                        rebuiltRow.addComponents(btn);
                    });

                    return rebuiltRow;
                });

                await interaction.message.edit({ components: newComponents });


                await channel.setParent(config.ticket.categories.assumidos, {
                    lockPermissions: false,
                });

                interaction.channel.send("Ticket assumido!")
            }

            if (interaction.customId == "notify_ticket") {

                if (!hasPermission(config, interaction)) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❎ Sem Permissão..")
                        .setDescription(`> Você não pode efetuar essa aão por falta de permissão.`)
                        .setTimestamp();

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                await interaction.reply("✅ Seu pedido de notifição foi enviado com suceso! Aguarde 5 segundos até chegar...");

                setTimeout(async () => {
                    await interaction.channel.send("🛎️ Um pedido de notificação foi feito! || @here @everyone ||");
                }, 5 * 1000);
            }

            if (interaction.customId == "delete_ticket") {

                let canalMention = `${interaction.channel.name}`;

                if (!hasPermission(config, interaction)) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❎ Sem Permissão..")
                        .setDescription(`> Você não pode efetuar essa aão por falta de permissão.`)
                        .setTimestamp();

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

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
                                `• **Ticket:** ${canalMention}\n` +
                                `• **Quem Deletou:** ${interaction.user}`
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
    }
};
