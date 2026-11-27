# Backlog

Itens verificados no código atual, sem correções nesta etapa:

- [ ] Ampliar o auto-save para além da conclusão de missões; o salvamento automático ocorre em `completeMission()`, enquanto o botão de salvar continua manual.
- [ ] Iniciar a música de exploração ao começar um jogo novo; `startGameFromTitle()` toca o efeito de sucesso, mas não inicia `Sound.setBgm('explore')`.
- [ ] Remover estilos inline do HTML e dos templates HTML gerados em JavaScript.
- [ ] Centralizar os números fixos restantes de desenho, minijogos e combate; os valores básicos de tile, grade, velocidade e canvas já estão em constantes, mas ainda há literais numéricos espalhados.
- [ ] Avaliar e integrar a funcionalidade “pátio novo” associada ao commit `46f9260`.

Nota: o tile 9 já é tratado como sólido em `isSolidAt()` e não é um problema pendente.
