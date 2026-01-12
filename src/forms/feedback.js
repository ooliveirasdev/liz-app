import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export async function openFeedbackModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('feedbackModal')
    .setTitle('Nos Dê Seu Feedback');

  const notaInput
   = new TextInputBuilder()
    .setCustomId('nota')
    .setLabel('Nota De 0 a 10')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(4);

  const descricaoInput = new TextInputBuilder()
    .setCustomId('descricao')
    .setLabel('Descreva Sua Experiência')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const employerInput = new TextInputBuilder()
    .setCustomId('funcionario')
    .setLabel('Funcionário Especifico ( Caso não tenha, use "nenhum" )')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50);

  const row1 = new ActionRowBuilder().addComponents(notaInput);
  const row2 = new ActionRowBuilder().addComponents(descricaoInput);
  const row3 = new ActionRowBuilder().addComponents(employerInput);

  modal.addComponents(row1, row2, row3);

  // ✅ resposta do botão é o modal
  await interaction.showModal(modal);
}
