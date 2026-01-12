import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadEvents(client) {
  const eventsPath = path.resolve('src', 'events')
  const files = (await readdir(eventsPath)).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const fileUrl = pathToFileURL(path.join(eventsPath, file)).href
    const mod = await import(fileUrl)
    const event = mod.default

    if (!event?.name || typeof event.execute !== 'function') {
      console.warn(`[Eventos] Arquivo inválido: ${file}`)
      continue
    }

    const handler = async (...args) => {
      try {
        await event.execute(...args)
      } catch (err) {
        console.error(`[Eventos] Erro em ${event.name}:`, err)
      }
    }

    if (event.once) client.once(event.name, handler)
    else client.on(event.name, handler)
  }

  console.log(`[Eventos] Carregados: ${files.length}`)
}
