let coins = 1250;
let pendingPlayer = null;
let startingXI = [null, null, null, null, null];
let myBets = [];
let currentParlay = [];
let gameTime = 63000;
let isGeneratingNewMatches = false;

let teamEnergy = 100;
let isDraftPlaying = false;


let lastClaimTime = Date.now();
const incomeRatePerHour = 6500;
const maxIncome = 6500;
let currentIncome = 0;

const balanceEl = document.getElementById('user-balance');
const modalOverlay = document.getElementById('modal-overlay');
const newCardContainer = document.getElementById('new-card-container');
const animationOverlay = document.getElementById('animation-overlay');
const packAnimationVideo = document.getElementById('pack-animation-video');
const matchesContainer = document.getElementById('matches-container');
const bettingModalOverlay = document.getElementById('betting-modal-overlay');
const gameClockEl = document.getElementById('game-clock');
const notificationBox = document.getElementById('notification-box');
const notificationMessage = document.getElementById('notification-message');
let notificationTimeout;
const music = document.getElementById('background-music');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const squadOvrRatingEl = document.getElementById('squad-ovr-rating');

const playlist = [
    'track1.mp3',
    'track2.mp3',
    'track3.mp3',
    'track4.mp3',
    'track5.mp3',
    'track6.mp3',
    'track7.mp3',
    'track8.mp3'
];
let currentTrackIndex = 0;

const squadManagementOverlay = document.getElementById('squad-management-overlay');
const clubPlayersContainer = document.getElementById('club-players-container');
const formationKeeperRow = document.getElementById('formation-keeper');
const formationForwardsRow = document.getElementById('formation-forwards');
const skipAnimationPrompt = document.getElementById('skip-animation-prompt');
const duplicateMessageEl = document.getElementById('duplicate-message');
const newPlayerButton = document.getElementById('new-player-button');
const disclaimerOverlay = document.getElementById('disclaimer-overlay');
const disclaimerContinueBtn = document.getElementById('disclaimer-continue-btn');
const marketModalOverlay = document.getElementById('market-modal-overlay');
const incomeFillEl = document.getElementById('income-fill');
const incomeValueEl = document.getElementById('income-value');

const staminaFillEl = document.getElementById('team-stamina-fill');
const staminaValueEl = document.getElementById('stamina-value');
const draftStatusEl = document.getElementById('draft-status');

function updateBalance(amount) {
    coins += amount;
    balanceEl.innerText = coins;
    saveGame();
}

function updateIncomeUI() {
    const now = Date.now();
    const elapsedHours = (now - lastClaimTime) / (1000 * 3600) ;
    let accrued = elapsedHours * incomeRatePerHour;
    
    if (accrued > maxIncome) accrued = maxIncome;
    currentIncome = Math.floor(accrued);

    const percentage = (currentIncome / maxIncome) * 100;
    if (incomeFillEl) {
        incomeFillEl.style.width = `${percentage}%`;
        incomeValueEl.innerText = `${currentIncome} €`;
    }
}

function claimIncome() {
    updateIncomeUI();
    if (currentIncome > 0) {
        updateBalance(currentIncome);
        showNotification(`Собрана выручка: ${currentIncome} €`);
        lastClaimTime = Date.now();
        currentIncome = 0;
        updateIncomeUI();
        saveGame();
    }
}

setInterval(updateIncomeUI, 1000);


let currentMarketTab = 'store';

function openMarketModal() {
    marketModalOverlay.classList.remove('hidden');
    switchMarketTab('store');
}

function closeMarketModal() {
    marketModalOverlay.classList.add('hidden');
}

function switchMarketTab(tabName) {
    currentMarketTab = tabName;
    
    document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.market-tab-content').forEach(c => c.classList.remove('active'));
    
    if (tabName === 'store') document.querySelector('button[onclick="switchMarketTab(\'store\')"]').classList.add('active');
    else if (tabName === 'transfer-buy') document.querySelector('button[onclick="switchMarketTab(\'transfer-buy\')"]').classList.add('active');
    else if (tabName === 'transfer-sell') document.querySelector('button[onclick="switchMarketTab(\'transfer-sell\')"]').classList.add('active');

    if (tabName === 'store') {
        document.getElementById('tab-store').classList.add('active');
        renderPacks();
    } else {
        document.getElementById('tab-transfers').classList.add('active');
        renderMarketList();
    }
}

function createCardHTML(player, onclickAction = '', onContextAction = '') {
    const actionAttr = onclickAction ? `onclick="${onclickAction}" style="cursor: pointer;"` : '';
    const contextAttr = onContextAction ? `oncontextmenu="${onContextAction}; return false;" title="ЛКМ: В состав | ПКМ: Продать"` : '';
    
    const keepOldFormatNames = ['SELIM', 'BAYTURAN', 'CAXANGIR'];
    let filename;

    if (player.type === 'toty' || player.type === 'cl' || keepOldFormatNames.includes(player.name)) {
        filename = `card_${player.name}_${player.type}.png`;
    } else {
        const simpleName = player.name.charAt(0).toUpperCase() + player.name.slice(1).toLowerCase();
        filename = `${simpleName}.png`;
    }

    return `<img src="img/cards/${filename}" class="squad-card-image" ${actionAttr} ${contextAttr} alt="${player.name}">`;
}

function renderLobby() {
    const ovr = calculateOVR();
    squadOvrRatingEl.innerText = ovr > 0 ? ovr : '--';
}

function calculateOVR() {
    const playersInXI = startingXI.filter(p => p !== null);
    if (playersInXI.length === 0) return 0;
    const totalRating = playersInXI.reduce((sum, player) => sum + player.rating, 0);
    return Math.round(totalRating / playersInXI.length);
}

function renderPacks() {
    const container = document.getElementById('packs-container');
    container.innerHTML = `
        <div class="pack-item">
            <div class="pack-visual-card" style="background: linear-gradient(135deg, #cd7f32, #8b4513);"></div>
            <h3>Standard Pack</h3>
            <p>Бронза, Серебро, Золото</p>
            <span class="pack-price">2,500 €</span>
            <button class="btn-gold" onclick="buyPack('standard')">Купить</button>
        </div>
        <div class="pack-item">
            <div class="pack-visual-card" style="background: linear-gradient(135deg, #1e3c72, #2a5298); border: 1px solid cyan;"></div>
            <h3>Champions Pack</h3>
            <p>Только CL карты</p>
            <span class="pack-price">15,000 €</span>
            <button class="btn-gold" onclick="buyPack('cl')">Купить</button>
        </div>
        <div class="pack-item">
            <div class="pack-visual-card" style="background: linear-gradient(135deg, #000, #1c2833); border: 2px solid var(--gold);"></div>
            <h3>TOTY Pack</h3>
            <p>Только TOTY карты</p>
            <span class="pack-price">30,000 €</span>
            <button class="btn-gold" onclick="buyPack('toty')">Купить</button>
        </div>
    `;
}

function buyPack(type) {
    let cost = 0;
    if (type === 'standard') cost = 2500;
    if (type === 'cl') cost = 15000;
    if (type === 'toty') cost = 30000;

    if (coins < cost) {
        showNotification("Недостаточно монет!");
        return;
    }

    updateBalance(-cost);
    closeMarketModal();

    let chosenType;
    const rand = Math.random();

    if (type === 'standard') {
        if (rand < 0.23) chosenType = 'gold';
        else if (rand < 0.53) chosenType = 'silver';
        else chosenType = 'bronze';
    } else if (type === 'cl') {
        chosenType = 'cl';
    } else if (type === 'toty') {
        chosenType = 'toty';
    }

    let potentialPlayers = playersDB.filter(p => p.type === chosenType);

    if (potentialPlayers.length === 0) {
        potentialPlayers = playersDB.filter(p => p.type === 'bronze');
    }
    
    const randomIndex = Math.floor(Math.random() * potentialPlayers.length);
    const newPlayer = potentialPlayers[randomIndex];
    
    startPackOpeningSequence(newPlayer);
}

function getSellPrice(player) {
    if (player.name === 'RAUL') return 200;
    if (player.name === 'AYLA') return 450;
    
    if (player.type === 'gold') {
        if (player.rating >= 31 && player.rating <= 79) return 1300;
        if (player.rating >= 80 && player.rating <= 86) return 1700;
        if (player.rating >= 87) return 2000;
    }

    if (player.type === 'cl') return 4000 + (player.rating * 50); 
    if (player.type === 'toty') return 8000 + (player.rating * 100);

    return 100;
}

function renderMarketList() {
    const container = document.getElementById('market-list');
    container.innerHTML = '';

    const searchQuery = document.getElementById('market-search').value.toLowerCase();
    const sortValue = document.getElementById('market-sort').value;

    let list = [];
    let mode = '';

    if (currentMarketTab === 'transfer-buy') {
        mode = 'buy';
        list = [...playersDB];
    } else {
        mode = 'sell';
        list = mySquad.map((p, index) => ({...p, originalIndex: index}));
    }

    if (searchQuery) {
        list = list.filter(p => p.name.toLowerCase().includes(searchQuery));
    }

    const lockedIdsCount = {};
    if (mode === 'sell') {
        startingXI.forEach(p => {
            if (p) lockedIdsCount[p.id] = (lockedIdsCount[p.id] || 0) + 1;
        });
    }

    list.sort((a, b) => {
        const priceA = mode === 'buy' ? (a.buyPrice || 0) : getSellPrice(a);
        const priceB = mode === 'buy' ? (b.buyPrice || 0) : getSellPrice(b);

        if (sortValue === 'rating_desc') return b.rating - a.rating;
        if (sortValue === 'rating_asc') return a.rating - b.rating;
        if (sortValue === 'price_desc') return priceB - priceA;
        if (sortValue === 'price_asc') return priceA - priceB;
        return 0;
    });

    list.forEach(player => {
        const price = mode === 'buy' ? (player.buyPrice || '???') : getSellPrice(player);
        
        let btnText = mode === 'buy' ? 'Купить' : 'Продать';
        let btnAction = mode === 'buy' ? `buyPlayer(${player.id})` : `sellPlayerMarket(${player.originalIndex})`;
        let btnClass = mode === 'buy' ? 'btn-green' : 'btn-gold';
        let btnAttributes = '';

        if (mode === 'buy' && mySquad.some(p => p.id === player.id)) {
            btnText = 'ИМЕЕТСЯ!';
            btnAction = '';
            btnClass = 'btn-outline';
            btnAttributes = 'disabled style="opacity: 0.5; cursor: not-allowed; border-color: #666; background: #333;"';
        }

        if (mode === 'sell') {
            if (lockedIdsCount[player.id] && lockedIdsCount[player.id] > 0) {
                btnText = 'В СОСТАВЕ';
                btnAction = '';
                btnClass = 'btn-outline';
                btnAttributes = 'disabled style="opacity: 0.5; cursor: not-allowed; border-color: #666; background: #333;"';
                lockedIdsCount[player.id]--;
            }
        }

        const cardDiv = document.createElement('div');
        cardDiv.className = 'market-card';
        cardDiv.innerHTML = `
            ${createCardHTML(player)}
            <div class="card-price-tag">${price} €</div>
            <button class="${btnClass}" onclick="${btnAction}" ${btnAttributes}>${btnText}</button>
        `;
        container.appendChild(cardDiv);
    });
}

function filterMarket() {
    renderMarketList();
}

function buyPlayer(playerId) {
    const player = playersDB.find(p => p.id === playerId);
    if (!player) return;
    
    if (mySquad.some(p => p.id === playerId)) {
        showNotification("Этот игрок уже есть в вашем клубе!");
        return;
    }

    const price = player.buyPrice || 999999;
    if (coins < price) {
        showNotification("Недостаточно средств!");
        return;
    }

    updateBalance(-price);
    mySquad.push(player);
    showNotification(`Вы купили ${player.name} за ${price} €`);
    saveGame();
}

function sellPlayerMarket(squadIndex) {
    if (mySquad[squadIndex]) {
        const player = mySquad[squadIndex];
        const price = getSellPrice(player);
        
        updateBalance(price);
        mySquad.splice(squadIndex, 1);
        showNotification(`Продан: ${player.name} (+${price} €)`);
        saveGame();
        renderMarketList();
    }
}


function startPackOpeningSequence(player) {
    
    const currentVol = music.volume;
    music.volume = 0.05;

    playVideo('animations/pack_open.mp4', () => {
        
        if (player.type === "toty") {
            playVideo(`animations/${player.name}Toty.mp4`, () => {
                finishPackOpening(player, currentVol);
            });
        } else {
            finishPackOpening(player, currentVol);
        }
    });
}

function playVideo(src, onEndedCallback) {
    const isSkippable = src === 'animations/pack_open.mp4';

    packAnimationVideo.playbackRate = 1.0;
    skipAnimationPrompt.classList.add('hidden');
    animationOverlay.onclick = null; 

    animationOverlay.classList.remove('hidden');
    packAnimationVideo.src = src;
    
    if (isSkippable) {
        skipAnimationPrompt.classList.remove('hidden');
        animationOverlay.style.cursor = 'pointer';
        animationOverlay.onclick = () => {
            packAnimationVideo.playbackRate = 3.0;
            skipAnimationPrompt.classList.add('hidden');
            animationOverlay.onclick = null;
            animationOverlay.style.cursor = 'default';
        };
    } else {
        animationOverlay.style.cursor = 'default';
    }
    
    packAnimationVideo.muted = false;
    
    packAnimationVideo.play().catch(e => console.error("Video play failed", e));
    packAnimationVideo.onended = () => {
        packAnimationVideo.playbackRate = 1.0;
        skipAnimationPrompt.classList.add('hidden');
        animationOverlay.onclick = null;
        animationOverlay.style.cursor = 'default';
        
        onEndedCallback();
    };
}

function finishPackOpening(player, originalVolume) {
    animationOverlay.classList.add('hidden');
    music.volume = originalVolume;

    const isDuplicate = mySquad.some(p => p.id === player.id);

    mySquad.push(player);
    saveGame();
    showNewPlayer(player, isDuplicate);
}
function showNewPlayer(player, isDuplicate = false) {
    newCardContainer.innerHTML = createCardHTML(player);
    
    if (isDuplicate) {
        duplicateMessageEl.innerText = "ДУБЛИКАТ!";
        duplicateMessageEl.classList.remove('hidden');
        newPlayerButton.innerText = "OK";
    } else {
        duplicateMessageEl.classList.add('hidden');
        newPlayerButton.innerText = "ЗАБРАТЬ";
    }

    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

function playDraft() {
    if (isDraftPlaying) return;

    if (startingXI.includes(null)) {
        showNotification("Сначала соберите полный состав!");
        return;
    }

    if (teamEnergy < 15) {
        showNotification("Команда слишком устала! Подожди восстановления.");
        return;
    }

    const betInput = document.getElementById('draft-bet');
    const difficultySelect = document.getElementById('draft-difficulty');
    const bet = parseInt(betInput.value);
    const difficulty = difficultySelect.value;

    if (isNaN(bet) || bet <= 0) {
        showNotification("Введите сумму ставки!");
        return;
    }
    if (bet > coins) {
        showNotification("Недостаточно монет!");
        return;
    }

    if (difficulty === 'easy' && bet > 1250) {
        showNotification("Макс. ставка на Лёгком: 1250 €");
        return;
    }
    if (difficulty === 'medium' && bet > 5000) {
        showNotification("Макс. ставка на Среднем: 5000 €");
        return;
    }

    updateBalance(-bet);
    
    teamEnergy = Math.max(0, teamEnergy - 15);
    updateStaminaUI();

    isDraftPlaying = true;
    const btn = document.getElementById('play-draft-btn');
    btn.innerText = "ИГРАЕМ...";
    btn.style.opacity = 0.5;
    draftStatusEl.classList.remove('hidden');

    let totalRating = 0;
    const playersInXI = startingXI.filter(p => p !== null);
    if (playersInXI.length > 0) {
        playersInXI.forEach(player => totalRating += player.rating);
    }
    
    let myRating = playersInXI.length > 0 ? Math.round(totalRating / playersInXI.length) : 0;

    if (teamEnergy < 50) {
        myRating = Math.floor(myRating * 0.8);
        draftStatusEl.innerText = "⚠ Команда уставшая! Сила снижена!";
    }

    let botRating = 0;
    let multiplier = 1.0;

    if (difficulty === 'easy') {
        botRating = Math.max(50, myRating - 15);
        multiplier = 1.1;
    } else if (difficulty === 'medium') {
        botRating = Math.min(99, myRating - 5 + Math.floor(Math.random() * 10));
        multiplier = 1.8
    } else if (difficulty === 'hard') {
        botRating = Math.min(99, myRating + 5 + Math.floor(Math.random() * 5));
        multiplier = 3.5;
    }

    const comments = ["Свисток арбитра!", "Опасная атака...", "Удар по воротам!", "Вратарь спасает!", "Напряженный момент..."];
    let step = 0;

    const simInterval = setInterval(() => {
        if (step < comments.length) {
            draftStatusEl.innerText = `${step * 20}' ${comments[step]}`;
            step++;
        } else {
            clearInterval(simInterval);
            finishDraft(myRating, botRating, bet, multiplier);
        }
    }, 600);
}

function finishDraft(myRating, botRating, bet, multiplier) {
    const botForm = Math.floor(Math.random() * 10); 
    
    const myTotalPower = myRating;
    const botTotalPower = botRating + botForm;

    const btn = document.getElementById('play-draft-btn');
    btn.innerText = "ИГРАТЬ";
    btn.style.opacity = 1;
    isDraftPlaying = false;
    draftStatusEl.classList.add('hidden');

    if (myTotalPower > botTotalPower) {
        const prize = Math.floor(bet * multiplier);
        updateBalance(prize);
        showNotification(`🏆 ПОБЕДА! +${prize} €`);
    } else if (myTotalPower === botTotalPower) {
        updateBalance(bet);
        showNotification(`🤝 НИЧЬЯ! Ставка возвращена.`);
    } else {
        showNotification(`💀 ПОРАЖЕНИЕ. Повезет в следующий раз!`);
    }
    saveGame();
}

function updateStaminaUI() {
    if (staminaFillEl) {
        staminaFillEl.style.width = `${teamEnergy}%`;
        if (teamEnergy > 50) staminaFillEl.style.background = '#2ecc71';
        else if (teamEnergy > 20) staminaFillEl.style.background = '#f1c40f';
        else staminaFillEl.style.background = '#e74c3c';
        
        staminaValueEl.innerText = `${Math.floor(teamEnergy)}%`;
    }
}

function sellPlayerFromClub(playerId) {
    const index = mySquad.findIndex(p => p.id === playerId);
    if (index === -1) return;
    
    const player = mySquad[index];
    
    const price = getSellPrice(player);

    if (confirm(`Продать игрока ${player.name} за ${price} монет?`)) {
        updateBalance(price);
        mySquad.splice(index, 1);
        renderSquadManagementScreen();
        saveGame();
    }
}

function saveGame() {
    const gameData = {
        coins: coins,
        squad: mySquad,
        activeMatches: activeMatches,
        myBets: myBets,
        notifications: notifications,
        startingXI: startingXI,
        teamEnergy: teamEnergy,
        gameTime: gameTime,
        lastClaimTime: lastClaimTime,
        lastSaveTimestamp: Date.now()
    };
    localStorage.setItem('goalyazData', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('goalyazData');
    if (savedData) {
        const data = JSON.parse(savedData) || {};
        coins = data.coins || 1250;
        mySquad = data.squad || [];
        mySquad = mySquad.map(savedPlayer => {
            const dbPlayer = playersDB.find(p => p.id === savedPlayer.id);
            return dbPlayer ? { ...savedPlayer, ...dbPlayer } : savedPlayer;
        });

        startingXI = data.startingXI || [null, null, null, null, null];
        startingXI = startingXI.map(savedPlayer => {
            if (!savedPlayer) return null;
            const dbPlayer = playersDB.find(p => p.id === savedPlayer.id);
            return dbPlayer ? { ...savedPlayer, ...dbPlayer } : savedPlayer;
        });
        
        const lastSaveTimestamp = data.lastSaveTimestamp || Date.now();
        const timePassedOffline = (Date.now() - lastSaveTimestamp) / 1000;
        const gameSecondsPassedOffline = timePassedOffline * 60;

        gameTime = (data.gameTime || 63000) + gameSecondsPassedOffline;
        lastClaimTime = data.lastClaimTime || Date.now();

        activeMatches = data.activeMatches || [];
        
        activeMatches.forEach(m => {
            if (m.finalResult && m.finalResult.home === undefined && m.finalResult.hme !== undefined) {
                m.finalResult.home = m.finalResult.hme;
            }
        });

        myBets = data.myBets || [];
        
        teamEnergy = data.teamEnergy !== undefined ? data.teamEnergy : 100;

        const secondsOffline = (Date.now() - lastSaveTimestamp) / 1000;
        const energyRecovered = Math.floor(secondsOffline / 3);
        teamEnergy = Math.min(100, teamEnergy + energyRecovered);

        const hasBadSchedule = activeMatches.some(m => {
            const h = Math.floor((m.startTime % 86400) / 3600);
            return h < 17; 
        });

        if (hasBadSchedule) {
            activeMatches = [];
            myBets = [];
            gameTime = 63000;
        }

        activeMatches.forEach(match => {
            if (match.status !== 'finished') {
                if (gameTime >= match.startTime + 2400) {
                    match.status = 'finished';
                    match.gameTime = 90;
                    match.score.home = match.finalResult.home;
                    match.score.away = match.finalResult.away;
                    processFinishedMatch(match);
                }
            }
        });

        if (activeMatches.length === 0 || activeMatches.every(m => m.status === 'finished')) {
            generateMatches();
            myBets = [];
        }

        notifications = data.notifications || [];
        balanceEl.innerText = coins;
    } else {
        gameTime = 63000;
        generateMatches();
    }

    renderLobby();
    renderMatches();
    renderNotifications();
}

function openSquadManagement() {
    renderSquadManagementScreen();
    squadManagementOverlay.classList.remove('hidden');
}

function closeSquadManagement() {
    squadManagementOverlay.classList.add('hidden');
}

function renderSquadManagementScreen() {
    formationKeeperRow.innerHTML = createPlayerSlotHTML(0, 'GK');
    formationForwardsRow.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        formationForwardsRow.innerHTML += createPlayerSlotHTML(i, 'ANY');
    }

    clubPlayersContainer.innerHTML = '';
    
    const playersOnFieldIds = startingXI.filter(p => p).map(p => p.id);
    const playersOnFieldNames = startingXI.filter(p => p).map(p => p.name);

    mySquad.forEach(player => {
        const indexInFieldIds = playersOnFieldIds.indexOf(player.id);
        
        if (indexInFieldIds !== -1) {
            playersOnFieldIds.splice(indexInFieldIds, 1);
        } else {
            if (playersOnFieldNames.includes(player.name)) return;

            clubPlayersContainer.innerHTML += createCardHTML(player, `addToXI(${player.id})`);
        }
    });
}

function createPlayerSlotHTML(slotIndex, positionText) {
    const player = startingXI[slotIndex];
    if (player) {
        return `<div class="player-slot" onclick="removeFromXI(${slotIndex})">${createCardHTML(player)}</div>`;
    } else {
        return `<div class="player-slot"><span>${positionText}</span></div>`;
    }
}

function addToXI(playerId) {
    const playerToAdd = mySquad.find(p => p.id === playerId);
    if (!playerToAdd) return;

    let emptySlotIndex = playerToAdd.position === 'GK' ? (startingXI[0] === null ? 0 : -1) : startingXI.indexOf(null, 1);

    if (emptySlotIndex !== -1) {
        startingXI[emptySlotIndex] = playerToAdd;
        renderSquadManagementScreen();
        renderLobby();
        saveGame();
    } else {
        showNotification("Нет свободных слотов для этой позиции!");
    }
}

function removeFromXI(slotIndex) {
    if (startingXI[slotIndex]) {
        startingXI[slotIndex] = null;
        renderSquadManagementScreen();
        renderLobby();
        saveGame();
    }
}

function toggleBetSelection(element, group, type, kef, description, value = null) {
    const isCurrentlySelected = element.classList.contains('selected');

    document.querySelectorAll(`.bet-option[data-group='${group}']`).forEach(el => el.classList.remove('selected'));
    currentParlay = currentParlay.filter(s => s.group !== group);

    if (!isCurrentlySelected) {
        const newSelection = { group, type, kef, description };
        if (value !== null) newSelection.value = value;
        currentParlay.push(newSelection);
        element.classList.add('selected');
    }
    
    updateParlayDisplay();
}

function generateMatches() {
    activeMatches = [];
    const numMatches = 8;
    let tempTeams = [...teamsDB];
    
    gameTime = 63000; 
    
    const startHourInSeconds = 18 * 3600;

    for (let i = 0; i < numMatches; i++) {
        const startTime = startHourInSeconds + (i * 3600); 

        if (tempTeams.length < 2) break;

        let index1 = Math.floor(Math.random() * tempTeams.length);
        let homeTeam = tempTeams.splice(index1, 1)[0];

        let index2 = Math.floor(Math.random() * tempTeams.length);
        let awayTeam = tempTeams.splice(index2, 1)[0];

        const homePower = Math.pow(homeTeam.power, 2);
        const awayPower = Math.pow(awayTeam.power, 2);
        const totalPower = homePower + awayPower;

        let homeProb = homePower / totalPower;
        let awayProb = awayPower / totalPower;
        let drawProb = 0.28;

        homeProb *= (1 - drawProb);
        awayProb *= (1 - drawProb);

        const total = homeProb + awayProb + drawProb;
        homeProb /= total; awayProb /= total; drawProb /= total;

        const margin = 0.92;
        const homeKef = Math.max(1.10, 1 / homeProb * margin).toFixed(2);
        const awayKef = Math.max(1.10, 1 / awayProb * margin).toFixed(2);
        const drawKef = Math.max(1.10, 1 / drawProb * margin).toFixed(2);

        const homeGoalsCount = Math.floor(Math.random() * (homeTeam.power / 18));
        const awayGoalsCount = Math.floor(Math.random() * (awayTeam.power / 18));
        
        const homeGoalMinutes = Array.from({length: homeGoalsCount}, () => Math.floor(Math.random() * 90) + 1).sort((a,b)=>a-b);
        const awayGoalMinutes = Array.from({length: awayGoalsCount}, () => Math.floor(Math.random() * 90) + 1).sort((a,b)=>a-b);
        
        const yellowCards = Math.floor(Math.random() * 7); 
        const redCards = Math.random() < 0.30 ? 1 : 0;

        activeMatches.push({
            id: i,
            home: homeTeam,
            away: awayTeam,
            startTime: startTime,
            status: 'scheduled',
            gameTime: 0,
            score: { home: 0, away: 0 },
            goalEvents: { home: homeGoalMinutes, away: awayGoalMinutes },
            finalResult: {
                home: homeGoalsCount,
                away: awayGoalsCount,
                yellow: yellowCards,
                red: redCards,
            },
            kefs: {
                home: homeKef,
                draw: drawKef,
                away: awayKef,
                total_over: (1.85).toFixed(2),
                total_under: (1.85).toFixed(2)
            }
        });
    }
}

function renderMatches() {
    if (isGeneratingNewMatches) return;

    if (matchesContainer.children.length === 0 || matchesContainer.querySelector('.generating-matches-notice')) {
        matchesContainer.innerHTML = '';
    }

    activeMatches.forEach(match => {
        let timeOrScore;
        if (match.status === 'live') {
            timeOrScore = `<span class="live-badge">LIVE ${Math.floor(match.gameTime)}'</span> | ${match.score.home} - ${match.score.away}`;
        } else if (match.status === 'finished') {
            timeOrScore = `FT | ${match.finalResult.home} - ${match.finalResult.away}`;
        } else {
            const startHours = Math.floor((match.startTime % 86400) / 3600).toString().padStart(2, '0');
            const startMinutes = (Math.floor((match.startTime % 86400) / 60) % 60).toString().padStart(2, '0');
            timeOrScore = `Начало в ${startHours}:${startMinutes}`;
        }

        const matchEl = document.getElementById(`match-${match.id}`);

        if (matchEl) {
            const timeEl = matchEl.querySelector('.match-time');
            if (timeEl.innerHTML !== timeOrScore) {
                timeEl.innerHTML = timeOrScore;
            }
        } else {
            const matchHTML = `
                <div class="match-item" id="match-${match.id}" onclick="openBetModal(${match.id})">
                    <div class="match-teams">
                        <div class="team-logo-container">
                            <img src="${match.home.logo}" class="team-logo" alt="${match.home.name}">
                        </div>
                        <span class="vs-text">VS</span>
                        <div class="team-logo-container">
                            <img src="${match.away.logo}" class="team-logo" alt="${match.away.name}">
                        </div>
                    </div>
                    <div class="match-time">${timeOrScore}</div>
                </div>
            `;
            matchesContainer.insertAdjacentHTML('beforeend', matchHTML);
        }
    });
}

function openBetModal(matchId) {
    const match = activeMatches.find(m => m.id === matchId);
    if (!match) return;
    if (match.status !== 'scheduled') {
        showNotification("Ставки на этот матч уже закрыты!");
        return;
    }
    
    if (myBets.some(b => b.matchId === matchId && b.status === 'active')) {
        showNotification("Вы уже сделали ставку на этот матч!");
        return;
    }

    currentParlay = [];
    bettingModalOverlay.dataset.matchId = matchId;

    document.getElementById('bet-modal-header').innerHTML = `
        <div class="team-display">
            <img src="${match.home.logo}" class="team-logo">
            <span>${match.home.name}</span>
        </div>
        <span class="vs-text" style="margin: 0 20px;">VS</span>
        <div class="team-display">
            <img src="${match.away.logo}" class="team-logo">
            <span>${match.away.name}</span>
        </div>
    `;

    document.getElementById('bet-outcome-options').innerHTML = `
        <div class="bet-option" data-group="outcome" onclick="toggleBetSelection(this, 'outcome', 'home_win', ${match.kefs.home}, 'Победа ${match.home.name}')">П1 <span class="kef">${match.kefs.home}</span></div>
        <div class="bet-option" data-group="outcome" onclick="toggleBetSelection(this, 'outcome', 'draw', ${match.kefs.draw}, 'Ничья')">X <span class="kef">${match.kefs.draw}</span></div>
        <div class="bet-option" data-group="outcome" onclick="toggleBetSelection(this, 'outcome', 'away_win', ${match.kefs.away}, 'Победа ${match.away.name}')">П2 <span class="kef">${match.kefs.away}</span></div>
    `;

    document.getElementById('bet-total-options').innerHTML = `
        <div class="bet-option" data-group="total" onclick="toggleBetSelection(this, 'total', 'total_over', ${match.kefs.total_over}, 'Голов 3+')">3+ <span class="kef">${match.kefs.total_over}</span></div>
        <div class="bet-option" data-group="total" onclick="toggleBetSelection(this, 'total', 'total_under', ${match.kefs.total_under}, 'Голов 0-2')">0-2 <span class="kef">${match.kefs.total_under}</span></div>
    `;

    document.getElementById('bet-yellow-cards-option').innerHTML = `
        <div class="bet-range-container">
            <span>ЖК:</span>
            <input type="range" id="yellow-card-input" class="range-slider" min="0" max="10" value="0" oninput="updateDynamicKef('yellow', this.value)">
            <span id="yellow-val" class="range-value">0</span>
            <span id="yellow-kef" class="kef">x---</span>
        </div>
    `;
    document.getElementById('bet-red-cards-option').innerHTML = `
        <div class="bet-range-container">
            <span>КК:</span>
            <input type="range" id="red-card-input" class="range-slider" min="0" max="5" value="0" oninput="updateDynamicKef('red', this.value)">
            <span id="red-val" class="range-value">0</span>
            <span id="red-kef" class="kef">x---</span>
        </div>
    `;
    
    updateParlayDisplay();
    document.getElementById('place-bet-button').onclick = () => placeBet();

    bettingModalOverlay.classList.remove('hidden');
}

function updateParlayDisplay() {
    const btn = document.getElementById('place-bet-button');
    if (!btn) return;

    if (currentParlay.length === 0) {
        btn.innerText = 'Сделать ставку (0)';
        return;
    }
    
    const totalKef = currentParlay.reduce((product, bet) => product * bet.kef, 1).toFixed(2);
    btn.innerText = currentParlay.length > 1 ? `ЭКСПРЕСС (x${totalKef})` : `Поставить x${totalKef}`;
}

function updateDynamicKef(type, value) {
    const val = parseInt(value);
    let kef = 0;
    const group = type === 'yellow' ? 'yellow_cards' : 'red_cards';
    const betType = group;
    let description = type === 'yellow' ? `${val}+ ЖК` : `Точно ${val} КК`;
    const valEl = document.getElementById(`${type}-val`);
    const kefEl = document.getElementById(`${type}-kef`);

    valEl.innerText = val;

    const existingSelectionIndex = currentParlay.findIndex(s => s.group === group);
    if (existingSelectionIndex > -1) {
        currentParlay.splice(existingSelectionIndex, 1);
    }

    if (type === 'yellow') {
        if (val === 0) kef = 1.01;
        else kef = (1.1 + (val * 0.4)).toFixed(2);
    } else if (type === 'red') {
        if (val === 0) kef = 1.5;
        else if (val === 1) kef = 5.0;
        else kef = (val * 10).toFixed(2);
    }

    if (val > 0) {
        kefEl.innerText = `x${kef}`;
        currentParlay.push({ group, type: betType, kef: parseFloat(kef), description, value: val });
    } else {
        kefEl.innerText = 'x---';
    }
    
    updateParlayDisplay();
}


function closeBetModal() {
    bettingModalOverlay.classList.add('hidden');
    document.getElementById('yellow-card-input').value = 0;
    document.getElementById('red-card-input').value = 0;
    document.getElementById('yellow-val').innerText = '0';
    document.getElementById('red-val').innerText = '0';
    document.getElementById('yellow-kef').innerText = 'x---';
    document.getElementById('red-kef').innerText = 'x---';
}

function placeBet() {
    const stake = parseInt(document.getElementById('bet-stake-input').value);
    const matchId = parseInt(bettingModalOverlay.dataset.matchId);

    if (currentParlay.length === 0) {
        showNotification("Выберите хотя бы один исход для ставки!");
        return;
    }
    if (isNaN(stake) || stake <= 0) {
        showNotification("Введите сумму ставки!");
        return;
    }
    if (stake > coins) {
        showNotification("Недостаточно монет!");
        return;
    }

    const totalKef = currentParlay.reduce((product, bet) => product * bet.kef, 1).toFixed(2);
    const description = currentParlay.map(s => s.description).join(' + ');

    myBets.push({ 
        matchId: matchId,
        stake: stake, 
        status: 'active',
        selections: [...currentParlay],
        totalKef: totalKef,
        description: `Экспресс: ${description}`
    });
    
    updateBalance(-stake);
    showNotification(`Ставка принята! (x${totalKef})`);
    closeBetModal();
    saveGame();
}

function processFinishedMatch(match) {
    const betsForThisMatch = myBets.filter(b => b.matchId === match.id && b.status === 'active');
    if (betsForThisMatch.length === 0) return;

    const res = match.finalResult;
    const totalGoals = res.home + res.away;

    betsForThisMatch.forEach(bet => {
        let isWin = true;
        
        for (const selection of bet.selections) {
            let selectionWins = false;
            if (res.home > res.away && selection.type === 'home_win') selectionWins = true;
            else if (res.home < res.away && selection.type === 'away_win') selectionWins = true;
            else if (res.home === res.away && selection.type === 'draw') selectionWins = true;
            else if (totalGoals >= 3 && selection.type === 'total_over') selectionWins = true;
            else if (totalGoals <= 2 && selection.type === 'total_under') selectionWins = true;
            else if (res.yellow >= selection.value && selection.type === 'yellow_cards') selectionWins = true;
            else if (res.red === selection.value && selection.type === 'red_cards') selectionWins = true;

            if (!selectionWins) {
                isWin = false;
                break;
            }
        }

        let resultMessage = `Итог ставки на ${match.home.name} - ${match.away.name} (${bet.description}):`;

        if (isWin) {
            const prize = Math.floor(bet.stake * bet.totalKef);
            updateBalance(prize);
            resultMessage += `\n🔥 ВЫИГРЫШ! +${prize} монет.`;
        } else {
            resultMessage += `\n❌ Проигрыш.`;
        }
        addNotification(resultMessage);
        bet.status = 'finished';
    });
}

function gameLoop() {
    gameTime += 20; 

    if (gameTime % 300 === 0 && teamEnergy < 100) {
        teamEnergy = Math.min(100, teamEnergy + 1);
        updateStaminaUI();
    }

    const hours = Math.floor((gameTime % 86400) / 3600).toString().padStart(2, '0');
    const minutes = (Math.floor((gameTime % 86400) / 60) % 60).toString().padStart(2, '0');
    gameClockEl.innerText = `${hours}:${minutes}`;

    let allMatchesFinished = true;
    activeMatches.forEach(match => {
        if (match.status === 'scheduled' && gameTime >= match.startTime) {
            match.status = 'live';
        }

        if (match.status === 'live') {
            allMatchesFinished = false;
            match.gameTime += 1.5;
            
            match.score.home = match.goalEvents.home.filter(m => m <= match.gameTime).length;
            match.score.away = match.goalEvents.away.filter(m => m <= match.gameTime).length;

            if (match.gameTime >= 90) {
                match.gameTime = 90;
                match.status = 'finished';
                match.score.home = match.finalResult.home;
                match.score.away = match.finalResult.away;
                processFinishedMatch(match);
            }
        } else if (match.status !== 'finished') {
            allMatchesFinished = false;
        }
    });

    if (allMatchesFinished) {
        isGeneratingNewMatches = true;
        matchesContainer.innerHTML = `<div class="generating-matches-notice">Подбираем новые матчи...</div>`;
        setTimeout(() => {
            generateMatches();
            myBets = [];
            matchesContainer.innerHTML = '';
            isGeneratingNewMatches = false;
            saveGame();
            renderMatches();
        }, 5000);
    }

    if (!isGeneratingNewMatches) {
        renderMatches();
    }
}

function showNotification(message) {
    clearTimeout(notificationTimeout);

    notificationMessage.innerText = message;
    notificationBox.classList.add('show');

    notificationTimeout = setTimeout(() => {
        notificationBox.classList.remove('show');
    }, 3000);
}

function addNotification(message) {
    notifications.unshift({ text: message, read: false });
    saveGame();
    renderNotifications();
    showNotification("Новое уведомление!");
}

function renderNotifications() {
    const panel = document.getElementById('notifications-panel');
    const dot = document.getElementById('notification-indicator');
    
    let html = `
        <div class="notifications-header">
            <span>УВЕДОМЛЕНИЯ</span>
            <span class="close-notif" onclick="toggleNotifications()">✖</span>
        </div>
    `;

    let hasUnread = false;

    if (notifications.length === 0) {
        html += `<div class="notification-item" style="text-align: center; color: #aaa; padding: 20px;">Нет новых уведомлений</div>`;
    }

    notifications.forEach(notif => {
        html += `<div class="notification-item ${notif.read ? '' : 'unread'}">${notif.text}</div>`;
        if (!notif.read) hasUnread = true;
    });

    panel.innerHTML = html;

    if (hasUnread) {
        dot.classList.remove('hidden');
        dot.style.animation = 'pulse 1s infinite';
    } else {
        dot.classList.add('hidden');
        dot.style.animation = 'none';
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    const isOpening = panel.classList.contains('hidden');

    panel.classList.toggle('hidden');

    if (isOpening && notifications.some(n => !n.read)) {
        notifications.forEach(notif => notif.read = true);
        renderNotifications();
        saveGame();
    }
}

function playNextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) {
        currentTrackIndex = 0; // Если дошли до конца, начинаем с начала
    }
    playMusic(currentTrackIndex);
}

function playMusic(index) {
    // Запоминаем текущую громкость перед сменой трека (на всякий случай)
    const vol = music.volume;
    
    music.src = `sounds/${playlist[index]}`;
    music.volume = vol;
    
    music.play().catch(e => console.log("Auto-play blocked until interaction"));
}

function init() {
    if (disclaimerOverlay && disclaimerContinueBtn) {
        setTimeout(() => {
            disclaimerOverlay.classList.add('visible');
        }, 100);

        disclaimerContinueBtn.addEventListener('click', () => {
            music.play().catch(error => {
                console.log("Autoplay был заблокирован, но мы это обработали.", error);
            });

            disclaimerOverlay.classList.remove('visible');

            disclaimerOverlay.addEventListener('transitionend', () => {
                disclaimerOverlay.style.display = 'none';
            }, { once: true });
        }, { once: true });
    }

    loadGame();

    activeMatches.forEach(match => {
        if (match.status === 'finished') {
            processFinishedMatch(match);
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const volumeValue = e.target.value / 100;
        music.volume = volumeValue;
        if (volumeValue === 0) {
            volumeIcon.innerText = '🔇';
        } else {
            volumeIcon.innerText = '🔊';
        }
    });
    
    music.volume = volumeSlider.value / 100;


    // Инициализация плейлиста
    if (playlist.length > 0) {
        music.src = `sounds/${playlist[0]}`;
        // Когда трек заканчивается, включаем следующий
        music.onended = playNextTrack;
    }


    setInterval(gameLoop, 200);
    setInterval(saveGame, 5000);

    // Одноразовое начисление бонуса всем пользователям
    if (!localStorage.getItem('promo_bonus_15k_applied')) {
        updateBalance(15000);
        addNotification("вам начислено 15000 евро");
        showNotification("вам начислено 15000 евро");
        localStorage.setItem('promo_bonus_15k_applied', 'true');
        saveGame();
    }
}

init();
