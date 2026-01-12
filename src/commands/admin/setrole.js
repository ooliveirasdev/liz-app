import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, "../../configs/ticket.json");

async function loadConfig() {
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { guilds: {} };
  }
}

async function saveConfig(config) {
  await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

export default {
  data: new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("Define o cargo que terá permissão nos tickets.")
    .addRoleOption(option =>
      option
        .setName("cargo")
        .setDescription("Cargo de atendente (terá acesso aos tickets).")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("cargo");

    const config = await loadConfig();
    const guildId = interaction.guildId;

    config.guilds[guildId] ??= {};
    config.guilds[guildId].ticket ??= { categories: {} };

    config.guilds[guildId].ticket.staffRoleId = role.id;

    await saveConfig(config);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Cargo de atendente definido")
      .setDescription(`Agora o cargo ${role} terá permissão nos tickets.`)
      .setFooter({
        text: `Configurado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
