import { useEffect } from 'react';

function Hud() {
  return (
    <div className="hud-bar">
      <div className="hud-location">
        <div className="hud-area-name" id="hudAreaName">
          EEEP JAIME ALENCAR
        </div>
        <div className="hud-objective" id="hudObjective">
          Fale com a Helena no pátio!
        </div>
      </div>
      <div className="hud-right">
        <div
          className="badges-tray"
          title="Insígnias do Curso de Desenvolvimento de Sistemas"
        >
          <div
            className="badge-slot"
            id="badge-dev"
            title="Insígnia do Código (Desenvolvimento)"
          >
            💻
          </div>
          <div
            className="badge-slot"
            id="badge-manut"
            title="Insígnia do Hardware (Manutenção)"
          >
            🔧
          </div>
          <div
            className="badge-slot"
            id="badge-adm"
            title="Insígnia da Gestão (Administração)"
          >
            📊
          </div>
          <div
            className="badge-slot"
            id="badge-redes"
            title="Insígnia da Conexão (Redes)"
          >
            🌐
          </div>
        </div>
        <button
          className="hud-btn"
          id="btnSaveGame"
          title="Salvar Progresso (Auto-save ativo)"
        >
          💾 SALVAR
        </button>
        <button className="hud-btn" id="btnAudio" title="Ativar/Desativar Som">
          🔊 SOM
        </button>
        <span className="save-toast" id="saveToast">
          SALVO!
        </span>
      </div>
    </div>
  );
}

function TitleScreen() {
  return (
    <div className="overlay-screen active" id="titleScreen">
      <div className="title-badge">
        EDIÇÃO FIRERED • DESENVOLVIMENTO DE SISTEMAS
      </div>
      <div className="title-logo">
        <h1>
          JORNADA DS:
          <br />
          JAIME ALENCAR
        </h1>
        <p>De aluno da Escola Johnson a futuro Dev!</p>
      </div>
      <div className="title-chars">
        <div className="title-char-card">
          <canvas
            id="titleHelena"
            width={48}
            height={48}
            className="battle-sprite-canvas"
          />
          <span>ESTUDANTE HELENA</span>
        </div>
        <div className="title-char-card">
          <canvas
            id="titleLucas"
            width={48}
            height={48}
            className="battle-sprite-canvas"
          />
          <span>GUIA LUCAS</span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          margin: '4px 0'
        }}
      >
        <button
          className="btn-pixel blue"
          id="btnContinueGame"
          style={{ display: 'none' }}
        >
          ▶ CONTINUAR JORNADA
        </button>
        <button className="btn-pixel" id="btnStartGame">
          ▶ INICIAR JORNADA
        </button>
      </div>
      <div className="blink-text">PRESSIONE ENTER OU CLIQUE PARA COMEÇAR</div>
    </div>
  );
}

function DialogueOverlay() {
  return (
    <div id="dialogueOverlay">
      <div className="fr-dialogue-box">
        <div className="dialogue-portrait-wrap">
          <canvas
            id="portraitCanvas"
            width={56}
            height={56}
            className="battle-sprite-canvas"
          />
        </div>
        <div className="dialogue-content">
          <div className="dialogue-speaker" id="dialogueSpeaker">
            HELENA
          </div>
          <div className="dialogue-text" id="dialogueText" />
        </div>
        <div className="dialogue-next">▼</div>
      </div>
    </div>
  );
}

function MinigameOverlay() {
  return (
    <div className="overlay-screen" id="minigameOverlay">
      <div className="mg-header">
        <div className="mg-title" id="mgTitle">
          MISSÃO
        </div>
        <div className="mg-status" id="mgStatus">
          Etapa 1/3
        </div>
        <button className="hud-btn" id="mgExitBtn">
          ✖ SAIR
        </button>
      </div>
      <div className="mg-body" id="mgBody" />
      <div className="mg-feedback" id="mgFeedback" />
    </div>
  );
}

function BattleOverlay() {
  return (
    <div className="overlay-screen" id="battleOverlay">
      <div className="battle-arena theme-dev" id="battleArena">
        <div className="mechanic-bar" id="mechanicBar">
          <span id="mechanicTitle">MECÂNICA ESPECIAL</span>
          <span className="mechanic-pill" id="mechanicValue">
            ATIVO
          </span>
        </div>
        <div className="battle-row-top">
          <div className="hp-card">
            <div className="hp-card-head">
              <span id="bossNameLabel">FALCÃO &amp; ALYSSON</span>
              <span>Nv.25</span>
            </div>
            <div className="hp-bar-outer">
              <div className="hp-bar-inner" id="bossHpBar" />
            </div>
            <div className="hp-numbers" id="bossHpText">
              140 / 140
            </div>
          </div>
          <div className="sprite-stage">
            <canvas
              id="bossSpriteCanvas"
              width={112}
              height={72}
              className="battle-sprite-canvas"
            />
            <div className="sprite-platform" />
          </div>
        </div>
        <div className="battle-row-bottom">
          <div className="sprite-stage">
            <canvas
              id="playerSpriteCanvas"
              width={84}
              height={72}
              className="battle-sprite-canvas"
            />
            <div className="sprite-platform" />
          </div>
          <div className="hp-card">
            <div className="hp-card-head">
              <span>HELENA</span>
              <span>Nv.20</span>
            </div>
            <div className="hp-bar-outer">
              <div className="hp-bar-inner" id="playerHpBar" />
            </div>
            <div className="hp-numbers" id="playerHpText">
              100 / 100
            </div>
          </div>
        </div>
        <div id="qteOverlay">
          <div style={{ fontSize: 10, color: '#fde047', textAlign: 'center' }}>
            ⚡ COMPILAÇÃO CRÍTICA! PARE NA ZONA VERDE!
          </div>
          <div className="qte-bar">
            <div className="qte-zone-yellow" />
            <div className="qte-zone-green" />
            <div className="qte-cursor" id="qteCursor" />
          </div>
          <button className="btn-pixel green" id="btnQteStop">
            COMPILAR AGORA! (ESPAÇO)
          </button>
        </div>
      </div>
      <div className="battle-bottom-panel">
        <div className="battle-log-box" id="battleLog">
          Os chefes entraram na arena!
        </div>
        <div className="battle-moves-grid" id="battleMovesGrid" />
      </div>
    </div>
  );
}

function ContractOverlay() {
  return (
    <div className="overlay-screen" id="contractOverlay">
      <div className="contract-paper">
        <div className="contract-header">
          <h2>
            CONTRATO DE MATRÍCULA OFICIAL
            <br />
            CURSO TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS
          </h2>
        </div>
        <div className="contract-text">
          Eu, <strong>Helena</strong>, estudante vindícola que vem de outra
          escola para conhecer os cursos da{' '}
          <strong>EEEP Jaime Alencar de Oliveira</strong>, declaro que conheci
          com sucesso todas as 4 áreas do curso de Desenvolvimento de Sistemas,
          sob a orientação do guia <strong>Lucas Ferreira</strong>, e confirmo
          minha matrícula para esta nova jornada!
        </div>
        <div className="contract-stamps">
          <span className="stamp-chip">💻 Código ✓</span>
          <span className="stamp-chip">🔧 Hardware ✓</span>
          <span className="stamp-chip">📊 Gestão ✓</span>
          <span className="stamp-chip">🌐 Conexão ✓</span>
        </div>
        <div className="signature-box">
          <label>ASSINE ABAIXO COM O MOUSE OU DEDO (HELENA):</label>
          <canvas id="signatureCanvas" width={460} height={82} />
        </div>
        <div
          className="mg-feedback"
          id="contractMsg"
          style={{ color: '#b91c1c', minHeight: 18 }}
        />
        <div className="contract-actions">
          <button
            className="btn-pixel red"
            id="btnClearSign"
            style={{ padding: '8px 12px', fontSize: 9 }}
          >
            LIMPAR
          </button>
          <button
            className="btn-pixel green"
            id="btnConfirmSign"
            style={{ padding: '8px 14px', fontSize: 9 }}
          >
            ✍ ASSINAR E CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}

function HallOfFameOverlay() {
  return (
    <div className="overlay-screen" id="hallOfFameOverlay">
      <div className="title-badge">
        ★ HALL DA FAMA — EEEP JAIME ALENCAR DE OLIVEIRA ★
      </div>
      <div className="hof-title">PARABÉNS, HELENA!</div>
      <div className="title-chars">
        <div className="title-char-card">
          <canvas
            id="hofHelena"
            width={56}
            height={56}
            className="battle-sprite-canvas"
          />
          <span>NOVA ALUNA DS</span>
        </div>
        <div className="title-char-card">
          <canvas
            id="hofLucas"
            width={56}
            height={56}
            className="battle-sprite-canvas"
          />
          <span>GUIA LUCAS</span>
        </div>
      </div>
      <div className="hof-subtitle">
        Você conquistou as 4 Insígnias, venceu todos os chefes e assinou seu
        contrato! Bem-vindo ao curso de Desenvolvimento de Sistemas!
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <button
          className="btn-pixel blue"
          id="btnContinueExplore"
          style={{ padding: '10px 14px', fontSize: 9 }}
        >
          EXPLORAR CAMPUS
        </button>
        <button
          className="btn-pixel"
          id="btnRestartGame"
          style={{ padding: '10px 14px', fontSize: 9 }}
        >
          JOGAR NOVAMENTE
        </button>
      </div>
    </div>
  );
}

function GameControls() {
  return (
    <div className="gba-controls">
      <div className="dpad">
        <div />
        <button className="dpad-btn" data-dir="up" aria-label="Cima">
          ▲
        </button>
        <div />
        <button className="dpad-btn" data-dir="left" aria-label="Esquerda">
          ◀
        </button>
        <div className="dpad-center" />
        <button className="dpad-btn" data-dir="right" aria-label="Direita">
          ▶
        </button>
        <div />
        <button className="dpad-btn" data-dir="down" aria-label="Baixo">
          ▼
        </button>
        <div />
      </div>
      <div className="gba-mid-buttons">
        <div className="gba-brand">JAIME ALENCAR ADVANCE SP</div>
        <div className="pill-controls">
          <button className="pill-btn" id="btnGuide">
            💬 GUIA LUCAS
          </button>
        </div>
      </div>
      <div className="ab-buttons">
        <button className="round-btn btn-b" id="btnB" aria-label="Botão B">
          B
        </button>
        <button className="round-btn btn-a" id="btnA" aria-label="Botão A">
          A
        </button>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    void import('./main.js');
  }, []);

  return (
    <main className="console-wrapper">
      <Hud />
      <div className="screen-bezel">
        <div className="screen-viewport">
          <canvas id="gameCanvas" width={480} height={320} />
          <div className="fade-overlay" id="fadeOverlay" />
          <TitleScreen />
          <DialogueOverlay />
          <MinigameOverlay />
          <BattleOverlay />
          <ContractOverlay />
          <HallOfFameOverlay />
        </div>
      </div>
      <GameControls />
    </main>
  );
}
