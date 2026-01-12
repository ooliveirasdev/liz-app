import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(client) {
    const commandsPath = path.resolve(__dirname, '../commands');

    const files = await readdir(commandsPath, {
        recursive: true,
        withFileTypes: true,
    });

    const commandsJson = [];

    for (const file of files) {
        if (!file.isFile() || !file.name.endsWith('.js')) continue;
        
        const fullPath = file.path
            ? path.join(file.path, file.name)
            : path.join(commandsPath, file.name);

        const fileUrl = pathToFileURL(fullPath).href;

        const { default: command } = await import(fileUrl);

        if (!command?.data?.name || typeof command.execute !== 'function') {
            console.warn(`[Comandos] Arquivo inválido: ${fullPath}`);
            continue;
        }

        client.commands.set(command.data.name, command);
        commandsJson.push(command.data.toJSON());
    }

    console.log(`[Comandos] Carregados: ${client.commands.size}`);

    const rest = new REST({ version: '10' }).setToken(process.env.APP_TOKEN);

    const CLIENT_ID = process.env.CLIENT_ID;
    const GUILD_ID = process.env.GUILD_ID;

    try {
        if (process.env.NODE_ENV === 'development') {

            console.log('[Comandos] Registrando slash commands…');

            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commandsJson }
            );

            console.log('[Comandos] Slash commands registrados com sucesso!');
        }

        console.log('[Comandos] Slash commands carregados com sucesso!');
    } catch (err) {
        
        console.error('[Comandos] Erro ao registrar slash commands:', err);
    }
}
