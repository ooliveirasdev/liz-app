import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('customize')
        .setDescription('Customizar nome (neste server) e foto (global) do bot.')
        .addStringOption(option =>
            option
                .setName('nome')
                .setDescription('Novo apelido do bot neste servidor')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('foto')
                .setDescription('Link da nova foto de perfil (Isso mudará em TODOS os servers)')
                .setRequired(true)
        )
        // Garante que apenas quem tem permissão de gerenciar apelidos use o comando
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        const novoNome = interaction.options.getString('nome');
        const novaFoto = interaction.options.getString('foto');

        try {
            // 1. Altera o apelido apenas NESTE servidor
            await interaction.guild.members.me.setNickname(novoNome);

            // 2. Altera a foto de perfil GLOBALMENTE 
            // (Note que usamos interaction.client.user)
            await interaction.client.user.setAvatar(novaFoto);

            await interaction.reply({ 
                content: `Sucesso! Apelido alterado para **${novoNome}** neste servidor e foto atualizada globalmente.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Erro ao atualizar: Verifique se o link da imagem é válido ou se estou em "Rate Limit" (limite de trocas de foto).', 
                ephemeral: true 
            });
        }
    }
}