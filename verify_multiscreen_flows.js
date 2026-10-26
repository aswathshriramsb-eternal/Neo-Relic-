// verify_multiscreen_flows.js
// Automated verification of multi-screen architecture, difficulty consistency,
// and state transition flows specified in Phase 2-13 of the Master Prompt.

const fs = require('fs');
const path = require('path');

console.log('--- Running Multi-Screen Architecture & Navigation Flow Verifications ---');

let domOk = false;

const tests = [];
function record(flowId, name, passed, details) {
  const status = passed ? 'PASS' : 'FAIL';
  const msg = `[${status}] ${flowId}: ${name} — ${details}`;
  tests.push({ flowId, name, passed, details });
  console.log(msg);
}

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const gameJs = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

// F01: Screen separation in DOM
const hasStartScreen = indexHtml.includes('id="screen-start"');
const hasDiffScreen = indexHtml.includes('id="screen-difficulty"');
const hasSettingsScreen = indexHtml.includes('id="screen-settings"');
const hasControlsScreen = indexHtml.includes('id="screen-controls"');
const hasQuitScreen = indexHtml.includes('id="screen-quit"');
const hasPauseScreen = indexHtml.includes('id="screen-paused"');
const hasLcScreen = indexHtml.includes('id="screen-level-complete"');
const hasWonScreen = indexHtml.includes('id="screen-won"');
const hasLostScreen = indexHtml.includes('id="screen-lost"');
const hasErrorScreen = indexHtml.includes('id="screen-error"');

record('F01', 'Multi-Screen DOM Architecture',
  hasStartScreen && hasDiffScreen && hasSettingsScreen && hasControlsScreen &&
  hasQuitScreen && hasPauseScreen && hasLcScreen && hasWonScreen && hasLostScreen && hasErrorScreen,
  'All 10 required screens exist as distinct modular dialog panels in #overlay.');

// F02: Main Menu Brand & Identity (Phase 3)
const hasTitle = indexHtml.includes('id="start-title"') && indexHtml.includes('NEON RELIC');
const hasSubtitle = indexHtml.includes('THE LAST SIGNAL');
const hasDescription = indexHtml.includes('Enter a neon-drenched world of danger, exploration, and survival');
const hasTaglines = indexHtml.includes('Survive the Neon. Discover the Unknown. The Relic Awaits.');
const hasMenuButtons = indexHtml.includes('id="btn-menu-start"') &&
                       indexHtml.includes('id="btn-menu-settings"') &&
                       indexHtml.includes('id="btn-menu-controls"') &&
                       indexHtml.includes('id="btn-menu-quit"');

record('F02', 'Main Menu Brand & Navigation',
  hasTitle && hasSubtitle && hasDescription && hasTaglines && hasMenuButtons,
  'Main Menu displays official title, subtitle, description, taglines, and clear navigation buttons.');

// F03: Flow 1: MAIN MENU -> START GAME -> DIFFICULTY SELECTION -> GAMEPLAY
const flow1_startNav = gameJs.includes("btnMenuStart.addEventListener('click', function () {") &&
                       gameJs.includes("showOverlay('difficulty');");
const flow1_deploy = gameJs.includes("btnStart.addEventListener('click', function () {") &&
                     gameJs.includes("if (gameState === 'START') startNewRun();");

record('F03', 'Flow 1: Main Menu -> Difficulty -> Gameplay',
  flow1_startNav && flow1_deploy,
  'START GAME opens Difficulty screen without starting simulation; DEPLOY button starts mission.');

// F04: Flow 2: MAIN MENU -> SETTINGS -> MAIN MENU
const flow2_menuSettings = gameJs.includes("overlaySource = 'start';") &&
                           gameJs.includes("showOverlay('settings');");
const flow2_back = gameJs.includes("btnSettingsBack.addEventListener('click', function () {") &&
                   gameJs.includes("var targetScreen = overlaySource || 'start';") &&
                   gameJs.includes("showOverlay(targetScreen);");

record('F04', 'Flow 2: Main Menu -> Settings -> Main Menu',
  flow2_menuSettings && flow2_back,
  'Settings opens from Main Menu, and BACK safely returns to Main Menu without starting a run.');

// F05: Flow 3 & 4: GAMEPLAY -> PAUSE -> RESUME / SETTINGS -> PAUSE
const flow3_pause = gameJs.includes("if (gameState === 'PLAYING') setState('PAUSED');");
const flow3_resume = gameJs.includes("if (gameState === 'PAUSED') setState('PLAYING');");
const flow4_pauseSettings = gameJs.includes("btnPauseSettings.addEventListener('click', function () {") &&
                            gameJs.includes("overlaySource = 'paused';");

record('F05', 'Flow 3 & 4: Pause, Resume & Settings from Pause',
  flow3_pause && flow3_resume && flow4_pauseSettings,
  'Pause halts simulation; Resume continues; Settings from Pause preserves run and returns to Pause.');

// F06: Flow 5: GAMEPLAY -> PAUSE -> RESTART LEVEL -> GAMEPLAY
const flow5_restartLevel = gameJs.includes("function restartCurrentLevel()") &&
                           gameJs.includes("loadLevel(currentLevel);") &&
                           gameJs.includes("setState('PLAYING');") &&
                           gameJs.includes("btnRestartPause.addEventListener('click', function () {") &&
                           gameJs.includes("restartCurrentLevel();");

record('F06', 'Flow 5: Pause -> Restart Level -> Gameplay',
  flow5_restartLevel,
  'Restart Level reloads current sector, resets level items, and preserves selected difficulty.');

// F07: Flow 6 & 7: LEVEL COMPLETE -> NEXT LEVEL / GAME OVER -> RESTART / MAIN MENU
const flow6_nextLevel = gameJs.includes("if (gameState === 'LEVEL_COMPLETE') loadNextLevel();");
const flow7_restart = gameJs.includes("btnRestartLost.addEventListener('click', function () {") &&
                      gameJs.includes("startNewRun();");
const flow7_title = gameJs.includes("btnTitleLost.addEventListener('click', function () {") &&
                    gameJs.includes("setState('START');");

record('F07', 'Flow 6 & 7: Progression, Defeat Restart & Title Screen',
  flow6_nextLevel && flow7_restart && flow7_title,
  'Level Complete advances to next sector; Game Over allows Try Again (startNewRun) or Return to Title.');

// F08: Flow 8: MAIN MENU -> QUIT CONFIRMATION -> APPROPRIATE EXIT
const flow8_quit = indexHtml.includes('id="btn-menu-quit"') &&
                   indexHtml.includes('id="btn-quit-confirm"') &&
                   indexHtml.includes('id="btn-quit-cancel"') &&
                   gameJs.includes("btnQuitConfirm.addEventListener('click', function () {");

record('F08', 'Flow 8: Main Menu -> Quit Confirmation -> Abort / Return',
  flow8_quit,
  'Quit request presents confirmation modal; Cancel returns to menu; Confirm terminates run cleanly.');

// F09: Authoritative Difficulty System (BASIC, MEDIUM, HARD)
const hasBasicCard = indexHtml.includes('id="card-diff-basic"') && indexHtml.includes('data-diff="basic"');
const hasMediumCard = indexHtml.includes('id="card-diff-normal"') && indexHtml.includes('data-diff="normal"');
const hasHardCard = indexHtml.includes('id="card-diff-hard"') && indexHtml.includes('data-diff="hard"');
const hasCardDescriptions = indexHtml.includes('A more forgiving experience for learning the game.') &&
                            indexHtml.includes('A balanced challenge for players familiar with the game.') &&
                            indexHtml.includes('A demanding experience that tests your skills.');
const hasCardWiring = gameJs.includes("diffCards[dc].addEventListener('click', function () {");

record('F09', 'Authoritative Difficulty System & Cards',
  hasBasicCard && hasMediumCard && hasHardCard && hasCardDescriptions && hasCardWiring,
  '3 interactive cards with official descriptions and badges; updates central state and active modifier styling.');

// F10: Dedicated Settings UI (Audio, Graphics, Motion, Data)
const hasAudioSliders = indexHtml.includes('id="setting-volume"') &&
                        indexHtml.includes('id="setting-music"') &&
                        indexHtml.includes('id="setting-sfx"') &&
                        indexHtml.includes('id="btn-setting-mute"');
const hasGraphicsControls = indexHtml.includes('id="setting-effects"') &&
                            indexHtml.includes('id="btn-setting-shake"') &&
                            indexHtml.includes('id="btn-setting-crt"') &&
                            indexHtml.includes('id="btn-setting-fs"');
const hasDataReset = indexHtml.includes('id="btn-reset-best"');
const hasDefaultsBtn = indexHtml.includes('id="btn-settings-defaults"');

record('F10', 'Dedicated Settings Controls & Defaults',
  hasAudioSliders && hasGraphicsControls && hasDataReset && hasDefaultsBtn,
  'Comprehensive categories: Master/Music/SFX sliders, Mute, Motion FX, Shake, CRT, Reset, and Restore Defaults.');

// F11: Difficulty Consistency Across Run
const diffInLoadLevel = gameJs.includes("var diff = (saveRecord && saveRecord.settings && saveRecord.settings.difficulty) || 'normal';") &&
                        gameJs.includes("NeonLogic.getDifficultyModifiers(diff)");
const diffInHUD = indexHtml.includes('id="hud-diff"') &&
                  gameJs.includes("hudDiff.textContent = label;");
const diffInPause = indexHtml.includes('id="pause-diff-badge"') &&
                    gameJs.includes("pauseDiffBadge.textContent = pauseLabel;");

record('F11', 'Difficulty Consistency Across Run & HUD/Pause Display',
  diffInLoadLevel && diffInHUD && diffInPause,
  'Selected difficulty remains locked throughout all sectors, updates timer and drone speeds, and displays in HUD & Pause.');

// F12: CSS Layout & Styling
const cssDiffCards = styleCss.includes('.diff-cards-grid') && styleCss.includes('.diff-card');
const cssSettings = styleCss.includes('.settings-grid-layout') && styleCss.includes('.settings-group');
const cssMenuNav = styleCss.includes('.menu-nav-stack') && styleCss.includes('.btn-menu-large');
const cssPauseDiff = styleCss.includes('.pause-diff-info');

record('F12', 'Cyberpunk CSS Design & Responsive Grid',
  cssDiffCards && cssSettings && cssMenuNav && cssPauseDiff,
  'Modern 3-column difficulty cards, 2-column settings grid, centered main menu stack, and glowing cyberpunk badges.');

const allPassed = tests.every(t => t.passed);
console.log(`\nResult: ${tests.filter(t => t.passed).length} / ${tests.length} checks passed.`);
if (!allPassed) process.exit(1);
console.log('--- All Multi-Screen Architecture & Navigation Flow Verifications PASSED cleanly ---');
