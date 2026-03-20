# CETS HQ Studio PLUS v2
### LABRIOLAG HOLDING · lab:// · v12W

## Conteudo do pacote

| Arquivo                       | O que e                                      |
|-------------------------------|----------------------------------------------|
| CETS_HQ_Studio_PLUSv2.html   | App completo (abra no navegador)             |
| worker.js                     | Cloudflare Worker — checkout Lightning       |
| wrangler.toml                 | Config do Worker (deploy Cloudflare)         |
| README_WORKER.md              | Instrucoes de deploy do Worker               |

## Uso imediato (sem Worker)

1. Abra `CETS_HQ_Studio_PLUSv2.html` no navegador
2. Toque na capa para entrar
3. Va em **Criar HQ**
4. Selecione personagens, cenario, escreva baloes
5. Clique **Baixar** -> modal Win98 abre -> clique **Simular Pagamento**
6. Download do PNG liberado automaticamente

## Personagens disponiveis

**CETS:** Sati (moeda dourada), Pikis (cartao PIX verde), Voutcher (nota fiscal roxa)

**Food:** Pizza, Hamburguer, Fritas, IceCream, Hotdog, Taco, Cafe, Donut

## Funcionalidades

- Arrastar personagens da toolbar para o quadro (drop zone)
- Arrastar personagens ja no canvas para reposicionar
- Baloes de fala arrastaveis no overlay (mouse + touch)
- Duplo clique no balao para remover
- Gabaritor de Falas: frases pre-configuradas pelo lojista
- Upload de figurinha propria com chroma key (fundo branco/verde removido)
- Fundo fotografico via camera ou galeria
- Modal Lightning Win98 com Sati animado
- Stamp LABRIOLAG v12W em todo PNG exportado

## Conectar o Worker Lightning

No arquivo HTML, troque as 2 linhas:

```javascript
const WORKER_URL = 'https://SEU-WORKER.workers.dev';
const LN_ADDRESS = 'labriolag@bipa.app';
```

Veja README_WORKER.md para instrucoes de deploy.

---
LABRIOLAG HOLDING · Protocolo lab:// · Selo v12W
