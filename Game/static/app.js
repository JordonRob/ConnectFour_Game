'use strict';

let GAME = new ConnectFour();

let MAXIMINION = new Maxaminion();

const startBtns = document.getElementsByClassName('start-btn');
[...startBtns].forEach(btn => {
  btn.addEventListener('click', restartGame);
});

function restartGame(e) {
  GAME.initGame();
}

const settings = document.querySelector('.settings-zone img');
settings.addEventListener('click', toggleSettingsPanel);

const settingsPanel = document.querySelector('.settings-panel');

let settingsPanelTimer;

function toggleSettingsPanel(e) {
  if (settingsPanel.classList.contains('hidden')) {
    settingsPanel.classList.remove('hidden');
    settingsPanel.classList.remove('opaque');
  } 
  else {
    settingsPanel.classList.add('opaque');
    setTimeout(() => {
      settingsPanel.classList.add('hidden');
    }, 550);
  }
}

function refreshSettingPanelTimeout() {
  clearTimeout(settingsPanelTimer);
  settingsPanelTimer = setTimeout(() => {
    toggleSettingsPanel();
  }, 2000);
}

function clearSettingPanelTimeout() {
  clearTimeout(settingsPanelTimer);
}

document
  .querySelector('.settings-panel')
  .addEventListener('change', settingsChange);

function settingsChange(e) {
  const targ = e.target;
  switch (targ.name) {
    case 'ai-players': {
      const aiPlayers = +targ.value;
      GAME.aiPlayers = aiPlayers;
      showHideAiZones(aiPlayers);
      break;
    }
    case 'ai-algo': {
      MAXIMINION.switchEvalAlgo = +targ.value;
      break;
    }
    case 'depth': {
      MAXIMINION.depth = +targ.value;
      break;
    }
    case 'ai-algo-2': {
      MAXIMINION.switchEvalAlgo2 = +targ.value;
      break;
    }
    case 'depth2': {
      MAXIMINION.depth2 = +targ.value;
      break;
    }
    case 'drop-delay': {
      GAME.dropDelay = +targ.value;
      break;
    }
    default:
      console.error('bad flag settings change', targ.name);
  }
}

function showHideAiZones(aiPlayers) {
  const aiOneZone = document.getElementById('ai-1-zone');
  const aiTwoZone = document.getElementById('ai-2-zone');
  if (aiPlayers === 1 || aiPlayers === 2)
    aiOneZone.classList.remove('display-none');
  else aiOneZone.classList.add('display-none');
  if (aiPlayers === 2) aiTwoZone.classList.remove('display-none');
  else aiTwoZone.classList.add('display-none');
}

document.querySelector('.swatch-zone').addEventListener('click', changeBG);

function changeBG(e) {
  const root = document.documentElement;
  switch (e.target.id) {
    case 'swatch1': {
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#3399ff, rgb(51, 153, 255))'
      );
      break;
    }
    case 'swatch2': {
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#746559, rgba(166, 82, 13, 0.3))'
      );
      break;
    }
    case 'swatch3': {
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#570195, rgba(59, 13, 166, 0.3))'
      );
      break;
    }
    case 'swatch4': {
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#a60d8e, rgba(166, 13, 143, 0.3))'
      );
      break;
    }
    case 'swatch5': {
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#480093, rgba(0, 255, 150, 0.3))'
      );
      break;
    }
    default:
      root.style.setProperty(
        '--column-bg',
        'linear-gradient(#0da2a6, rgba(13, 160, 165, 0.3))'
      );
  }
}

document
  .querySelector('.board-type-zone')
  .addEventListener('click', changeBoardType);

function changeBoardType(e) {
  if (e.target.id == 'board-grid-icon') {
    [...GAME.DOMColumns].forEach(col => col.classList.remove('column-visible'));
    document.querySelector('.grid-board').classList.remove('hidden');
  } else if (e.target.id == 'board-columns-icon') {
    [...GAME.DOMColumns].forEach(col => col.classList.add('column-visible'));
    document.querySelector('.grid-board').classList.add('hidden');
  }
}

document
  .querySelector('.game-over-wrapper')
  .addEventListener('click', function (e) {
    GAME.clearGameOverPlacard();
  });
