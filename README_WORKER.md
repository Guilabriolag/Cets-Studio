# LABRIOLAG · Worker Lightning — Deploy Guide

## Setup em 3 passos

### 1. Instalar Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Configurar secrets
```bash
# Seu token da Bipa (dashboard.bipa.app → API Keys)
npx wrangler secret put BIPA_TOKEN

# Opcional: KV para cache de pagamentos
npx wrangler kv:namespace create "LN_CACHE"
# Copie o ID gerado e cole no wrangler.toml (descomente o bloco kv_namespaces)
```

### 3. Deploy
```bash
npx wrangler deploy
```

## Endpoints

| Endpoint | Descrição |
|---|---|
| `GET /health` | Status do worker |
| `GET /invoice?sats=1` | Gera invoice de 1 sat |
| `GET /check?hash=...` | Verifica se foi pago |

## Conectar ao Studio Plus

No `CETS_HQ_Studio_PLUS.html`, troque:
```js
const WORKER_URL = 'https://labriolag-ln.workers.dev';
const LN_ADDRESS = 'labriolag@bipa.app'; // seu address
```

## Modo Demo (sem Worker)
O Studio detecta automaticamente se o Worker está offline e ativa o 
modo demo com botão "Simular Pagamento" — perfeito para Alphaville.

---
LABRIOLAG HOLDING · Protocolo lab:// · v12W
