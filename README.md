# 🤖 Liz — Bot de Atendimento para Discord

Liz é um **bot de atendimento (tickets) para Discord**, desenvolvido em **Node.js** com **discord.js**, criado para resolver um problema real:  
> a falta de um bot **próprio, altamente customizável e realmente adaptável** às necessidades de cada servidor.

O projeto foi pensado para ser **versátil, organizado e fácil de manter**, permitindo que **cerca de 90% das funcionalidades sejam configuráveis**, sem a necessidade de alterar o código-fonte.

---

## ✨ Principais Funcionalidades

### 🎫 Sistema de Tickets Completo
- Criação de tickets por categoria
- Separação automática entre:
  - 🕒 Tickets **não atendidos**
  - ✅ Tickets **em atendimento**
  - 📁 Tickets **finalizados**
- Organização clara e intuitiva para equipes de suporte

### 🧩 Altamente Customizável
- Categorias de tickets configuráveis
- Cargos responsáveis pelo atendimento
- Canais de logs personalizados
- Mensagens, embeds e comportamentos ajustáveis via configuração

### 🧾 Sistema de Logs Avançado
- Logs para **todas as ações importantes**
- Registro de:
  - Criação de ticket
  - Usuário que **assumiu o atendimento**
  - Fechamento do ticket
- Histórico claro para auditoria e organização da equipe

### 👩‍💼 Atendimento Organizado
- Controle de quem assumiu cada ticket
- Evita tickets duplicados ou abandonados
- Ideal para servidores com múltiplos atendentes

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **discord.js**
- JavaScript (ES6+)
- Estrutura modular e organizada
- Boas práticas para bots Discord

---

## 📂 Estrutura do Projeto (exemplo)

```bash
📁 liz-bot
├── 📁 src
│   ├── 📁 commands
│   ├── 📁 events
│   ├── 📁 configs
│   ├── 📁 handlers
│   └── index.js
├── 📄 config.json
├── 📄 package.json
└── 📄 README.md
