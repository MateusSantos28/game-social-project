# Projeto: Jornada DS (jogo educativo 2D, Canvas + HTML/CSS)

## Estado atual
- Jogo em HTML/CSS/JS puro: index.html, css/style.css, js/main.js (~2300 linhas).
- Canvas 2D 480x320 para o mapa (tiles de 32px, grade 15x10, câmera fixa).
- Interface (HUD, diálogo, batalha, contrato, minijogos) é HTML/CSS sobreposto.
- Estado global em `state` (state.mode: title, explore, dialogue, minigame,
  battle, contract, hof).
- Blocos existentes: Sound, Storage (localStorage "jornada_ds_v1_save"),
  Dialogue, Battle, MAPS, AREA_INFO, BOSS_DATA, CHAR_PALETTES, drawTile,
  drawPixelChar, renderGame, updatePlayer, gameLoop, minijogos
  runDevM1/M2, runManutM1/M2, runAdmM1/M2, runRedesM1/M2.

## Objetivo da refatoração
Deixar o projeto modular, tipado (TypeScript) e fácil de manter, SEM mudar
o comportamento do jogo.

## Regras obrigatórias
1. Refatoração só move e organiza código. NUNCA altere regras de jogo,
   textos, dados de mapas, missões, dano, HP ou minijogos.
2. Faça somente o passo pedido. Se achar algo a melhorar fora dele,
   apenas me avise no final, sem alterar.
3. Mova o código antes de reescrevê-lo. Preserve nomes de funções e
   variáveis, a menos que o passo peça renomear.
4. Sem bibliotecas novas além das previstas no passo (Vite, TypeScript,
   ESLint, Prettier, Vitest).
5. Sem dependências circulares entre módulos. Ordem de dependência:
   data -> systems -> rendering -> scenes -> main.
   Módulos em `data/` não importam nada do projeto.
6. Ao extrair código para módulos, procure por `onclick=`, `onchange=` e
   funções chamadas por texto/HTML gerado: funções deixam de ser globais
   em módulos e esses handlers quebram. Troque por addEventListener.
7. TypeScript gradual: `strict` começa desligado. Evite `any`; se precisar,
   comente `// TODO tipar`.
8. Ao terminar cada passo: rode o build e o ESLint, abra o jogo e
   execute o checklist abaixo. Relate o resultado.
9. Explique as mudanças de forma simples, como para um estudante iniciante.
10. Nunca corrija bugs nem mude regras durante a refatoração; registre em BACKLOG.md

## Checklist de regressão (testar após cada passo)
- [ ] Tela inicial aparece e o botão de iniciar funciona
- [ ] Helena anda em 4 direções e colide com paredes e NPCs
- [ ] Portais trocam de mapa
- [ ] Falar com NPC abre o diálogo e o texto avança
- [ ] Um minijogo abre, funciona e conclui a missão
- [ ] Batalha com chefe: golpes, HP e fim da batalha
- [ ] Salvar e continuar restauram o progresso
- [ ] Sem erros no console do navegador (F12)

## Estrutura alvo
src/
  main.ts            ponto de entrada
  core/              constants, state, Game (loop), Input
  data/              maps, bosses, areas, palettes (sem lógica)
  systems/           Sound, Storage, Dialogue, Battle
  rendering/         tiles, characters, renderGame
  minigames/         dev, manut, adm, redes
  scenes/            ExploreScene, BattleScene, etc. (fase final)