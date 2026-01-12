import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export async function openTicketModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('ticketModal')
    .setTitle('Abrir Ticket');

  const assuntoInput = new TextInputBuilder()
    .setCustomId('assunto')
    .setLabel('Assunto')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(80);

  const descricaoInput = new TextInputBuilder()
    .setCustomId('descricao')
    .setLabel('Descreva o problema')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const row1 = new ActionRowBuilder().addComponents(assuntoInput);
  const row2 = new ActionRowBuilder().addComponents(descricaoInput);

  modal.addComponents(row1, row2);

  // ✅ resposta do botão é o modal
  await interaction.showModal(modal);
}
