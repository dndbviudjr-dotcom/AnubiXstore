// Chave do localStorage
const STORAGE_KEY = 'gameHub_games';
const FAVORITES_KEY = 'gameHub_favorites';
const HISTORY_KEY = 'gameHub_history';
const PROFILE_KEY = 'gameHub_profile';
const LAST_VIEW_KEY = 'gameHub_last_view';
const XP_PER_LEVEL = 1000;
const XP_GAIN_PER_CYCLE = 20;
const XP_CYCLE_MS = 10 * 60 * 1000;
const FRAME_OPTIONS = [
    'moldura/moldura1.png',
    'moldura/moldura2.png',
    'moldura/moldura3.png',
    'moldura/moldura4.gif',
    'moldura/moldura5.png',
    'moldura/moldura6.png',
    'moldura/moldura7.png',
    'moldura/moldura8.gif',
    'moldura/moldura9.png',
    'moldura/moldura10.png',
    'moldura/moldura11.png',
    'moldura/moldura12.png',
    'moldura/moldura13.png',
    'moldura/moldura14.png',
    'moldura/moldura15.png',
    'moldura/moldura16.png',
    'moldura/moldura17.png',
    'moldura/moldura18.png',
    'moldura/moldura19.png',
    'moldura/moldura20.png',
    'moldura/moldura21.png',
    'moldura/moldura22.png',
    'moldura/moldura23.png',
    'moldura/moldura24.png',
    'moldura/moldura25.png',
    'moldura/moldura26.png',
    'moldura/moldura27.png',
    'moldura/moldura28.png',
    'moldura/moldura29.png',
    'moldura/moldura30.png',
    'moldura/moldura31.png',
    'moldura/moldura32.png',
    'moldura/moldura33.png',
    'moldura/moldura34.png',
    'moldura/moldura35.png',
    'moldura/moldura36.png',
    'moldura/moldura37.png',
    'moldura/moldura38.png',
    'moldura/moldura39.png',
    'moldura/moldura40.png',
    'moldura/moldura41.png',
    'moldura/moldura42.png',
    'moldura/moldura43.png',
    'moldura/moldura44.png',
    'moldura/moldura45.png',
    'moldura/moldura46.png',
    'moldura/moldura47.png',
    'moldura/moldura48.png',
    'moldura/moldura49.png',
    'moldura/moldura50.png',
    'moldura/molduradiscord.png'
];

const BACKGROUND_OPTIONS = [
    'backgrounds/1.mp4',
    'backgrounds/2.mp4',
    'backgrounds/3.mp4',
    'backgrounds/4.mp4',
    'backgrounds/5.mp4',
    'backgrounds/6.mp4',
    'backgrounds/7.mp4',
    'backgrounds/8.mp4',
    'backgrounds/9.mp4',
    'backgrounds/10.mp4',
    'backgrounds/11.mp4',
    'backgrounds/12.mp4',
    'backgrounds/13.mp4',
    'backgrounds/14.mp4',
    'backgrounds/15.mp4',
    'backgrounds/16.mp4',
    'backgrounds/17.mp4',
    'backgrounds/bg-1.svg',
    'backgrounds/bg-2.svg',
    'backgrounds/bg-3.svg',
    'backgrounds/bg-4.svg',
    'backgrounds/bg-5.svg'
];

const SPOTIFY_CLIENT_ID = window.SPOTIFY_CLIENT_ID || 'bd32344bef42422baeda4daf69d2227c';
const SPOTIFY_REDIRECT_URI = window.SPOTIFY_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`;

// ========================================
// RANK REWARDS SYSTEM - Molduras por Rank
// ========================================
const RANK_REWARDS = {
    'Bronze III': 'moldura/moldura9.png',
    'Prata I': 'moldura/moldura28.png',
    'Prata III': 'moldura/moldura47.png',
    'Ouro II': 'moldura/moldura3.png',
    'Ouro III': 'moldura/moldura31.png',
    'Lenda II': 'moldura/moldura14.png',
    'Lenda III': 'moldura/moldura40.png',
    'Ultra I': 'moldura/moldura27.png',
    'Ultra II': 'moldura/moldura13.png',
    'Admin': 'moldura/moldura24.png',
    'Admin I': 'moldura/moldura24.png'
};

function safeAssetUrl(value) {
    return encodeURI(String(value || '')).replace(/#/g, '%23');
}

function makeRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i += 1) {
        text += chars[Math.floor(Math.random() * chars.length)];
    }
    return text;
}

function base64UrlEncode(value) {
    return btoa(String.fromCharCode(...new Uint8Array(value)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function generateSpotifyCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
}

function getSpotifyAuthConfig() {
    if (!SPOTIFY_CLIENT_ID) {
        throw new Error('Falta o Client ID do Spotify. Defina window.SPOTIFY_CLIENT_ID ou a variável global SPOTIFY_CLIENT_ID.');
    }

    return {
        clientId: SPOTIFY_CLIENT_ID,
        redirectUri: SPOTIFY_REDIRECT_URI,
        scopes: 'user-read-email user-read-private'
    };
}

async function connectSpotifyAccount() {
    try {
        const config = getSpotifyAuthConfig();
        const verifier = makeRandomString(64);
        const challenge = await generateSpotifyCodeChallenge(verifier);
        const state = makeRandomString(32);

        sessionStorage.setItem('spotify_code_verifier', verifier);
        sessionStorage.setItem('spotify_auth_state', state);

        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'code',
            redirect_uri: config.redirectUri,
            scope: config.scopes,
            state,
            code_challenge_method: 'S256',
            code_challenge: challenge
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (error) {
        console.error('Erro ao iniciar login do Spotify:', error);
        alert('Não foi possível iniciar a vinculação com o Spotify. Verifique o Client ID do app Spotify.');
    }
}

async function handleSpotifyAuthCallback() {
    const code = new URLSearchParams(window.location.search).get('code');
    const returnedState = new URLSearchParams(window.location.search).get('state');
    const expectedState = sessionStorage.getItem('spotify_auth_state');
    const verifier = sessionStorage.getItem('spotify_code_verifier');

    if (!code) {
        return;
    }

    if (expectedState && returnedState !== expectedState) {
        alert('A vinculação do Spotify falhou por motivo de segurança. Tente novamente.');
        return;
    }

    try {
        const config = getSpotifyAuthConfig();
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: config.clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: config.redirectUri,
                code_verifier: verifier || ''
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
            throw new Error(tokenData.error_description || 'Falha ao trocar o código do Spotify.');
        }

        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            throw new Error(userData.error?.message || 'Não foi possível carregar o perfil do Spotify.');
        }

        const spotifyLink = userData.external_urls?.spotify || `https://open.spotify.com/user/${encodeURIComponent(userData.id || '')}`;
        const spotifyName = userData.display_name || userData.id || 'Spotify';
        const spotifyAvatar = userData.images && userData.images.length > 0 ? userData.images[0].url : '';
        const profile = getProfile();
        const updatedProfile = {
            ...profile,
            spotify: spotifyLink,
            spotifyName,
            spotifyAvatar
        };

        saveProfile(updatedProfile);
        showProfile();

        sessionStorage.removeItem('spotify_code_verifier');
        sessionStorage.removeItem('spotify_auth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error('Spotify auth callback error:', error);
        alert('Não foi possível concluir a vinculação com o Spotify. Tente novamente.');
    }
}

// Variável para controlar a visualização atual
let currentView = 'all';
let isAuthenticated = false;

function saveCurrentViewState() {
    localStorage.setItem(LAST_VIEW_KEY, currentView || 'all');
}

function restoreLastView() {
    const savedView = localStorage.getItem(LAST_VIEW_KEY) || 'all';

    if (savedView === 'profile') {
        showProfile();
        return true;
    }

    if (savedView === 'favorites') {
        showRecentFavorites();
        return true;
    }

    currentView = 'all';
    saveCurrentViewState();
    loadGames();
    return true;
}

// Carregar jogos ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    attachProfileEditorPreviewListeners();
    attachProfileFileInputs();
    
    currentView = 'all';
    updateVideoBackgroundVisibility();

    // Não carrega perfil aqui - deixa Firebase fazer isso após autenticação
    // const profile = getProfile();
    // const frameSelect = document.getElementById('profileFrameSelect');
    // if (frameSelect) {
    //     frameSelect.value = profile.frame || '';
    // }

    syncFrameInventorySelection();

    handleSpotifyAuthCallback();
    restoreLastView();
    applySiteSettings();

    const frameTrigger = document.getElementById('framePickerTrigger');
    if (frameTrigger) {
        frameTrigger.addEventListener('click', () => {
            toggleFramePicker();
        });
    }

    const backgroundTrigger = document.getElementById('backgroundPickerTrigger');
    if (backgroundTrigger) {
        backgroundTrigger.addEventListener('click', () => {
            toggleBackgroundPicker();
        });
    }

    document.addEventListener('click', (event) => {
        const framePicker = document.querySelector('.frame-picker');
        const frameTrigger = document.getElementById('framePickerTrigger');
        const backgroundPicker = document.querySelector('.background-picker');
        const backgroundTrigger = document.getElementById('backgroundPickerTrigger');

        if (framePicker && frameTrigger && !framePicker.contains(event.target) && !frameTrigger.contains(event.target)) {
            closeFramePicker();
        }

        if (backgroundPicker && backgroundTrigger && !backgroundPicker.contains(event.target) && !backgroundTrigger.contains(event.target)) {
            closeBackgroundPicker();
        }
    });
});

// Função para carregar jogos do localStorage
function adminTab(tab) {
    ['users','games','stats'].forEach(t => {
        const key = t.charAt(0).toUpperCase() + t.slice(1);
        document.getElementById(`adminTabContent${key}`).style.display = t === tab ? '' : 'none';
        document.getElementById(`adminTab${key}`).classList.toggle('active', t === tab);
    });
    if (tab === 'games') adminLoadGlobalGames();
    if (tab === 'stats') adminLoadStats();
}

async function adminLoadStats() {
    try {
        const [usersSnap, gamesSnap] = await Promise.all([
            firebase.firestore().collection('profiles').get(),
            firebase.firestore().collection('globalGames').get()
        ]);
        const users = usersSnap.docs.map(d => d.data());
        document.getElementById('statTotalUsers').textContent = users.length;
        document.getElementById('statTotalGames').textContent = gamesSnap.size;
        document.getElementById('statBanned').textContent = users.filter(u => u.banned).length;
        document.getElementById('statAdmins').textContent = users.filter(u => u.isAdmin).length;
    } catch(e) { console.error(e); }
}

async function adminSetName() {
    if (!window.adminSelectedUser) { alert('Busque um usuário primeiro'); return; }
    const val = document.getElementById('adminNameInput').value.trim();
    if (!val) return;
    await firebase.firestore().collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({ name: val });
    document.getElementById('adminUserName').textContent = val;
    document.getElementById('adminNameInput').value = '';
    alert('Nome atualizado!');
}

async function adminSetBio() {
    if (!window.adminSelectedUser) { alert('Busque um usuário primeiro'); return; }
    const val = document.getElementById('adminBioInput').value.trim();
    if (!val) return;
    await firebase.firestore().collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({ bio: val });
    document.getElementById('adminBioInput').value = '';
    alert('Bio atualizada!');
}

async function adminUnbanUser() {
    if (!window.adminSelectedUser) { alert('Busque um usuário primeiro'); return; }
    await firebase.firestore().collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({ banned: false });
    document.getElementById('adminUserStatus').textContent = '✅ Ativo';
    alert('Usuário desbanido!');
}

function loadGames() {
    currentView = 'all';
    const localGames = getGames();

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        firebase.firestore().collection('globalGames').get().then(snap => {
            const globalGames = snap.docs.map(d => ({ ...d.data(), isGlobal: true }));
            const allGames = [...globalGames, ...localGames];
            renderGames(allGames);
        }).catch(() => renderGames(localGames));
    } else {
        renderGames(localGames);
    }
}

function updateVideoBackgroundVisibility() {
    const videoBackground = document.querySelector('.video-background');
    if (!videoBackground) return;

    const shouldShow = currentView === 'all' || currentView === 'favorites' || currentView === 'profile' || currentView === 'friends';
    videoBackground.classList.toggle('hidden', !shouldShow);
}

function showHome() {
    currentView = 'all';
    saveCurrentViewState();
    const managementScreen = document.getElementById('managementScreen');
    if (managementScreen) {
        managementScreen.classList.remove('show');
    }
    updateVideoBackgroundVisibility();
    loadGames();
}

function getGames() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}
// Função para obter favoritos
function getFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Função para obter histórico
function getHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
}
// Função para salvar jogos no localStorage
function saveGames(games) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

// Usar ID sequencial numérico (1, 2, 3, 4...)
function generateProfileId() {
    // Se houver perfil salvo localmente, usar o ID dele
    const profile = getProfile();
    if (profile && profile.id) {
        return profile.id;
    }
    // Se ainda não tiver perfil, retornar placeholder
    return 'pending';
}

function normalizeProfileId(id) {
    // Se for número válido (1, 2, 3...)
    const parsed = Number(id);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    // Se for string 'pending', manter
    if (id === 'pending') {
        return 'pending';
    }
    // Gerar novo
    return generateProfileId();
}

function getNextProfileId() {
    return generateProfileId();
}

function getRankVisual(rankName) {
    const normalized = String(rankName || 'Bronze I').trim();
    const rankMap = {
        'Bronze I': { icon: 'rank/bronze1.png', label: 'Bronze I' },
        'Bronze II': { icon: 'rank/bronze2.png', label: 'Bronze II' },
        'Bronze III': { icon: 'rank/bronze3.png', label: 'Bronze III' },

        'Prata I': { icon: 'rank/prata1.png', label: 'Prata I' },
        'Prata II': { icon: 'rank/prata2.png', label: 'Prata II' },
        'Prata III': { icon: 'rank/prata3.png', label: 'Prata III' },
        'Silver I': { icon: 'rank/prata1.png', label: 'Prata I' },
        'Silver II': { icon: 'rank/prata2.png', label: 'Prata II' },
        'Silver III': { icon: 'rank/prata3.png', label: 'Prata III' },

        'Ouro I': { icon: 'rank/ouro1.png', label: 'Ouro I' },
        'Ouro II': { icon: 'rank/ouro2.png', label: 'Ouro II' },
        'Ouro III': { icon: 'rank/ouro3.png', label: 'Ouro III' },
        'Gold I': { icon: 'rank/ouro1.png', label: 'Ouro I' },
        'Gold II': { icon: 'rank/ouro2.png', label: 'Ouro II' },
        'Gold III': { icon: 'rank/ouro3.png', label: 'Ouro III' },

        'Lenda I': { icon: 'rank/lenda1.png', label: 'Lenda I' },
        'Lenda II': { icon: 'rank/lenda2.png', label: 'Lenda II' },
        'Lenda III': { icon: 'rank/lenda3.png', label: 'Lenda III' },
        'Master': { icon: 'rank/lenda1.png', label: 'Lenda I' },

        'Ultra I': { icon: 'rank/ultra1.png', label: 'Ultra I' },
        'Ultra II': { icon: 'rank/ultra2.png', label: 'Ultra II' },
        'Ultra III': { icon: 'rank/ultra3.png', label: 'Ultra III' },
        'Diamond': { icon: 'rank/ultra1.png', label: 'Ultra I' },

        'Admin I': { icon: 'rank/admin1.png', label: 'Admin I' },
        'Admin': { icon: 'rank/admin1.png', label: 'Admin I' }
    };

    const directMatch = rankMap[normalized];
    if (directMatch) {
        return directMatch;
    }

    const lower = normalized.toLowerCase();
    const aliasMap = {
        'bronze i': 'Bronze I',
        'bronze ii': 'Bronze II',
        'bronze iii': 'Bronze III',
        'prata i': 'Prata I',
        'prata ii': 'Prata II',
        'prata iii': 'Prata III',
        'silver i': 'Prata I',
        'silver ii': 'Prata II',
        'silver iii': 'Prata III',
        'ouro i': 'Ouro I',
        'ouro ii': 'Ouro II',
        'ouro iii': 'Ouro III',
        'gold i': 'Ouro I',
        'gold ii': 'Ouro II',
        'gold iii': 'Ouro III',
        'lenda i': 'Lenda I',
        'lenda ii': 'Lenda II',
        'lenda iii': 'Lenda III',
        'master': 'Lenda I',
        'ultra i': 'Ultra I',
        'ultra ii': 'Ultra II',
        'ultra iii': 'Ultra III',
        'diamond': 'Ultra I',
        'admin i': 'Admin I',
        'admin': 'Admin I'
    };

    const canonical = aliasMap[lower] || normalized;
    return rankMap[canonical] || { icon: 'rank/bronze1.png', label: canonical };
}

function getLevelInfo(xpValue) {
    const xp = Math.max(0, Number(xpValue) || 0);
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInLevel = xp % XP_PER_LEVEL;
    const progress = (xpInLevel / XP_PER_LEVEL) * 100;
    const xpNeeded = XP_PER_LEVEL - xpInLevel;

    return {
        level,
        xp,
        xpInLevel,
        progress,
        xpNeeded
    };
}

// ========================================
// RANK REWARDS - Desbloquear molduras por rank
// ========================================
function migrateOldFrameNames(frameArray) {
    if (!frameArray || !Array.isArray(frameArray)) return frameArray;
    
    const frameMigration = {
        'moldura/moldura3.png': 'moldura/moldura3.png',
        'moldura/moldura9.png': 'moldura/moldura9.png',
        'moldura/moldura13.png': 'moldura/moldura13.png',
        'moldura/moldura14.png': 'moldura/moldura14.png',
        'moldura/moldura24.png': 'moldura/moldura24.png',
        'moldura/moldura27.png': 'moldura/moldura27.png',
        'moldura/moldura28.png': 'moldura/moldura28.png',
        'moldura/moldura31.png': 'moldura/moldura31.png',
        'moldura/moldura40.png': 'moldura/moldura40.png',
        'moldura/moldura47.png': 'moldura/moldura47.png'
    };
    
    return frameArray.map(frame => frameMigration[frame] || frame);
}

function getUnlockedFramesForRank(rankName) {
    const unlockedFrames = [];
    
    // Mapear todos os ranks e verificar quais molduras foram desbloqueadas
    const rankOrder = [
        'Bronze III',
        'Prata I',
        'Prata III',
        'Ouro II',
        'Ouro III',
        'Lenda II',
        'Lenda III',
        'Ultra I',
        'Ultra II',
        'Admin'
    ];
    
    const currentRankIndex = rankOrder.indexOf(rankName);
    
    // Se o rank atual está na lista, desbloquear todas as molduras até esse rank
    if (currentRankIndex !== -1) {
        for (let i = 0; i <= currentRankIndex; i++) {
            const rank = rankOrder[i];
            if (RANK_REWARDS[rank]) {
                unlockedFrames.push(RANK_REWARDS[rank]);
            }
        }
    }
    
    return unlockedFrames;
}

function checkAndUnlockRankRewards(profile) {
    if (!profile) return profile;
    
    const rank = profile.rank || 'Bronze I';
    const unlockedFrames = getUnlockedFramesForRank(rank);
    
    // Inicializar array de molduras desbloqueadas se não existir
    if (!profile.unlockedFrames) {
        profile.unlockedFrames = [];
    } else {
        // Migrar nomes antigos para o padrão atual
        profile.unlockedFrames = migrateOldFrameNames(profile.unlockedFrames);
    }
    
    let framesUnlocked = false;
    
    // Verificar e desbloquear novas molduras
    for (const frame of unlockedFrames) {
        if (!profile.unlockedFrames.includes(frame)) {
            profile.unlockedFrames.push(frame);
            framesUnlocked = true;
            console.log(`🎁 Moldura desbloqueada: ${frame}`);
        }
    }
    
    if (framesUnlocked) {
        console.log(`✨ Molduras desbloqueadas para o rank ${rank}:`, profile.unlockedFrames);
    }
    
    return profile;
}

function applyPendingXp(profile) {
    const now = Date.now();
    const lastXpAt = Number(profile.lastXpAt || now);
    const elapsed = now - lastXpAt;
    const cycles = Math.floor(elapsed / XP_CYCLE_MS);

    if (cycles <= 0) {
        return profile;
    }

    const updatedXp = (Number(profile.xp) || 0) + (cycles * XP_GAIN_PER_CYCLE);
    return {
        ...profile,
        xp: updatedXp,
        lastXpAt: now
    };
}

function getProfile() {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) {
        return null; // Retorna nulo se não houver perfil
    }
    const profile = JSON.parse(stored);
    
    // Migrar nomes antigos de molduras para o padrão atual
    if (profile.frame) {
        const frameMigration = {
            'moldura/moldura3.png': 'moldura/moldura3.png',
            'moldura/moldura9.png': 'moldura/moldura9.png',
            'moldura/moldura13.png': 'moldura/moldura13.png',
            'moldura/moldura14.png': 'moldura/moldura14.png',
            'moldura/moldura24.png': 'moldura/moldura24.png',
            'moldura/moldura27.png': 'moldura/moldura27.png',
            'moldura/moldura28.png': 'moldura/moldura28.png',
            'moldura/moldura31.png': 'moldura/moldura31.png',
            'moldura/moldura40.png': 'moldura/moldura40.png',
            'moldura/moldura47.png': 'moldura/moldura47.png'
        };
        const oldFrame = profile.frame;
        profile.frame = frameMigration[profile.frame] || profile.frame;
        if (oldFrame !== profile.frame) {
            console.log(`🔄 Moldura migrada: ${oldFrame} → ${profile.frame}`);
        }
    }
    
    if (profile.unlockedFrames) {
        profile.unlockedFrames = migrateOldFrameNames(profile.unlockedFrames);
    }
    
    return profile;
}

function saveProfile(profile) {
    // Verificar e desbloquear recompensas de rank antes de salvar
    profile = checkAndUnlockRankRewards(profile);
    
    const xp = Math.max(0, Number(profile.xp) || 0);
    
    // Checar se avatar/banner são base64 (muito grandes)
    const isAvatarBase64 = profile.avatar && profile.avatar.startsWith('data:');
    const isBannerBase64 = profile.banner && profile.banner.startsWith('data:');
    
    // Criar perfil local (com imagens base64)
    const localProfile = {
        ...profile,
        id: normalizeProfileId(profile.id),
        xp,
        lastXpAt: Number(profile.lastXpAt) || Date.now(),
        createdAt: Number(profile.createdAt) || Date.now(),
        name: profile.name || '',
        pronoun: profile.pronoun ?? '',
        bio: profile.bio ?? '',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
        banner: profile.banner || '',
        currentGame: profile.currentGame || 'Nenhum jogo',
        rank: profile.rank || 'Bronze I',
        background: profile.background || '',
        video: profile.video || '',
        frame: profile.frame || '',
        steam: profile.steam || '',
        discord: profile.discord || '',
        spotify: profile.spotify || ''
    };

    console.log('💾 Salvando perfil localmente (com imagens):', {
        ...localProfile,
        avatar: isAvatarBase64 ? '[BASE64 Avatar]' : localProfile.avatar,
        banner: isBannerBase64 ? '[BASE64 Banner]' : localProfile.banner
    });
    
    // Salvar localmente COM as imagens
    localStorage.setItem(PROFILE_KEY, JSON.stringify(localProfile));
    if (typeof updateProfileNav === 'function') {
        updateProfileNav();
    }
    
    // Sync to Firebase (sem imagens base64 muito grandes)
    if (typeof syncProfileToCloud === 'function') {
        console.log('🔄 Enviando para nuvem (sem imagens base64)...');
        // Criar versão comprimida para Firestore
        const cloudProfile = { ...localProfile };
        if (isAvatarBase64) {
            cloudProfile.avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
        }
        if (isBannerBase64) {
            cloudProfile.banner = '';
        }
        syncProfileToCloud(cloudProfile);
    }
}

function startXpTimer() {
    setInterval(() => {
        const profile = getProfile();
        if (!profile) return; // Sem perfil, não faz nada
        
        const updatedProfile = applyPendingXp(profile);

        if (updatedProfile.xp !== profile.xp || updatedProfile.lastXpAt !== profile.lastXpAt) {
            saveProfile(updatedProfile);
            if (currentView === 'profile') {
                showProfile();
            }
        }
    }, 60000);
}

// Expose function for Firebase to update profile UI
function updateProfileUI(cloudProfile) {
    if (cloudProfile) {
        // Verificar e desbloquear recompensas de rank
        const profileWithRewards = checkAndUnlockRankRewards(cloudProfile);
        
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profileWithRewards));
        updateProfileNav();

        const savedView = localStorage.getItem(LAST_VIEW_KEY) || currentView || 'all';
        if (savedView === 'profile') {
            showProfile();
        } else if (savedView === 'favorites') {
            showRecentFavorites();
        } else {
            currentView = 'all';
            saveCurrentViewState();
            loadGames();
        }

        startXpTimer();
        syncFrameInventorySelection();
        renderFrameMenuInventory();
        
        // If profile editor is open, refresh it
        if (document.getElementById('editProfileModal').style.display === 'flex') {
            updateProfileEditorPreview();
        }
    }
}

function updateProfileNav() {
    const profile = getProfile();
    if (!profile) return; // Não há perfil carregado ainda
    
    const avatar = document.getElementById('profileNavAvatar');
    const name = document.getElementById('profileNavName');
    const frame = document.getElementById('profileNavFrame');

    const safeAvatar = profile.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
    const safeName = profile.name || '';

    if (avatar) {
        avatar.src = safeAvatar;
    }

    if (frame) {
        if (profile.frame) {
            frame.src = profile.frame;
            frame.classList.remove('hidden');
        } else {
            frame.src = '';
            frame.classList.add('hidden');
        }
    }

    if (name) {
        name.textContent = safeName;
    }

    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) {
        const profileId = Number(profile.id);
        adminBtn.style.display = profileId === 1 || String(profile.id) === '1' ? 'flex' : 'none';
    }

    const rankValue = document.getElementById('profileRankValue');
    if (rankValue) {
        rankValue.textContent = profile.rank || 'Bronze I';
    }
}

function renderFrameMenuInventory() {
    const inventory = document.getElementById('profileFrameMenuInventory');
    if (!inventory) {
        console.warn('❌ profileFrameMenuInventory não encontrado');
        return;
    }

    const profile = getProfile();
    
    // Mostrar TODAS as molduras disponíveis
    const framesToShow = FRAME_OPTIONS;

    console.log('🖼️ Renderizando molduras no menu:', {
        tem_perfil: !!profile,
        total_molduras: framesToShow.length,
        frame_selecionada: profile?.frame
    });

    inventory.innerHTML = framesToShow.map((frame) => `
        <button type="button" class="frame-menu-option ${profile?.frame === frame ? 'active' : ''}" data-frame="${frame}" aria-label="Selecionar moldura">
            <img src="${frame}" alt="Moldura" />
        </button>
    `).join('');

    inventory.querySelectorAll('.frame-menu-option').forEach((button) => {
        button.addEventListener('click', () => {
            selectFrameFromMenu(button.dataset.frame);
        });
    });
}

function selectFrameFromMenu(frame) {
    const profile = getProfile();
    if (!profile) {
        alert('Faça login com Google primeiro!');
        return;
    }
    
    const nextFrame = frame || '';
    const updatedProfile = {
        ...profile,
        frame: nextFrame
    };

    console.log('🖼️ Moldura selecionada:', nextFrame);
    saveProfile(updatedProfile);
    showProfile();
    closeProfileMenu();

    const editorSelect = document.getElementById('profileFrameSelect');
    if (editorSelect) {
        editorSelect.value = nextFrame;
        syncFrameInventorySelection();
    }
}

function clearSelectedFrame() {
    selectFrameFromMenu('');
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileMenuPanel');
    if (!menu) return;

    renderFrameMenuInventory();
    const isVisible = menu.classList.contains('show');
    document.querySelectorAll('.profile-menu-panel').forEach((panel) => panel.classList.remove('show'));
    if (!isVisible) {
        menu.classList.add('show');
    }
}

function closeProfileMenu() {
    const menu = document.getElementById('profileMenuPanel');
    if (menu) {
        menu.classList.remove('show');
    }
}

window.addEventListener('click', (event) => {
    const profileButton = document.querySelector('.profile-btn');
    const menu = document.getElementById('profileMenuPanel');

    if (!menu || !profileButton) return;

    const clickedInsideButton = profileButton.contains(event.target);
    const clickedInsideMenu = menu.contains(event.target);

    if (!clickedInsideButton && !clickedInsideMenu) {
        closeProfileMenu();
    }
});

// Função para abrir modal de senha
function openCreateMenu() {
    const passwordModal = document.getElementById('passwordModal');
    passwordModal.classList.add('show');
    document.getElementById('password').focus();
}

// Função para fechar modal de senha
function closePasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    passwordModal.classList.remove('show');
    document.getElementById('password').value = '';
}

// Função para verificar senha
function verifyPassword(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const correctPassword = 'Brenno@16';
    
    if (password === correctPassword) {
        closePasswordModal();
        isAuthenticated = true;
        showManagementScreen();
    } else {
        alert('Senha incorreta!');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// Função para mostrar a tela de gerenciamento em tela cheia
function showManagementScreen() {
    const managementScreen = document.getElementById('managementScreen');
    managementScreen.classList.add('show');
    
    // Carregar lista de jogos
    loadManagementFullList();
    
    // Limpar formulário
    document.getElementById('managementGameForm').reset();
}

// Função para configurar listeners da sidebar
function setupSidebarListeners() {
    // Função mantida para compatibilidade mas não usada com bottom nav
}

// Função para adicionar/remover favoritos
function toggleFavorite(gameId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(gameId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(gameId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    // Sincroniza favoritos com o Firestore
    if (typeof firebase !== 'undefined' && firebase.firestore && typeof currentUser !== 'undefined' && currentUser) {
        firebase.firestore().collection('profiles').doc(currentUser.uid).update({ favorites }).catch(() => {});
    }

    // Atualiza só o botão sem recriar o grid
    const btn = document.querySelector(`.favorite-btn[onclick*="toggleFavorite(${gameId})"]`);
    if (btn) {
        const isFav = favorites.includes(gameId);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    if (currentView === 'favorites') {
        showRecentFavorites();
    }
}

// Função para adicionar ao histórico
function addToHistory(gameName) {
    let history = getHistory();
    const entry = {
        name: gameName,
        timestamp: new Date().toLocaleString('pt-BR')
    };
    
    // Limitar a 50 entradas
    history.unshift(entry);
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Função para adicionar novo jogo (legado - usar addGameFromManagement)
function addGame(event) {
    // Esta função mantida apenas por compatibilidade
    // Usar addGameFromManagement ao invés
}

// Função para deletar um jogo
function deleteGame(id) {
    if (confirm('Tem certeza que deseja deletar este jogo?')) {
        let games = getGames();
        games = games.filter(game => game.id !== id);
        saveGames(games);
        
        // Se estiver em tela de gerenciamento, atualizar
        if (isAuthenticated) {
            loadManagementFullList();
        }
        
        // Recarregar visualização atual
        if (currentView === 'all') {
            renderGames(games);
        } else if (currentView === 'favorites') {
            const favorites = getFavorites();
            const favGames = games.filter(g => favorites.includes(g.id));
            renderGames(favGames);
        }
    }
}

// Função para fazer download de um jogo
function downloadGame(url) {
    // Se for uma URL, abre em nova aba
    if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank');
    } else {
        alert('URL inválida!');
    }
}

const GAME_CATEGORIES = ['Todos','Ação','Aventura','RPG','FPS','Estratégia','Esportes','Corrida','Luta','Terror','Indie','Simulação','MMO'];
let activeCategory = 'Todos';

function renderCategoryBar() {
    return `<div class="category-bar" style="grid-column: 1 / -1;">${
        GAME_CATEGORIES.map(c => `<button class="cat-btn${c === activeCategory ? ' active' : ''}" onclick="filterByCategory('${c}')">${c}</button>`).join('')
    }</div>`;
}

function filterByCategory(cat) {
    activeCategory = cat;
    const panel = document.getElementById('categoryPanel');
    if (panel) panel.classList.remove('open');
    loadGames();
}

function toggleCategoryPanel() {
    const panel = document.getElementById('categoryPanel');
    if (panel) panel.classList.toggle('open');
}

function toggleOptionsMenu() {
    const m = document.getElementById('optionsModal');
    if (!m) return;
    if (m.style.display === 'none' || !m.style.display) {
        m.style.display = 'flex';
        loadOptionsValues();
    } else {
        m.style.display = 'none';
    }
}

function closeOptionsMenu() {
    const m = document.getElementById('optionsModal');
    if (m) m.style.display = 'none';
}

function loadOptionsValues() {
    const s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const bgUrl = document.getElementById('optBgUrl');
    const opacity = document.getElementById('optOverlayOpacity');
    const brightness = document.getElementById('optVideoBrightness');
    const blur = document.getElementById('optBlur');
    const speed = document.getElementById('optAnimSpeed');
    if (bgUrl) bgUrl.value = s.bgUrl || '';
    if (opacity) { opacity.value = s.overlayOpacity ?? 60; document.getElementById('optOverlayVal').textContent = opacity.value + '%'; }
    if (brightness) { brightness.value = s.videoBrightness ?? 100; document.getElementById('optBrightnessVal').textContent = brightness.value + '%'; }
    if (blur) { blur.value = s.blur ?? 0; document.getElementById('optBlurVal').textContent = blur.value + 'px'; }
    if (speed) speed.value = s.animSpeed || '0.4s';
}

function previewOverlay(val) {
    document.getElementById('optOverlayVal').textContent = val + '%';
    const overlay = document.querySelector('.video-overlay');
    if (overlay) overlay.style.background = `rgba(0,0,0,${val/100})`;
}

function previewBrightness(val) {
    document.getElementById('optBrightnessVal').textContent = val + '%';
    const video = document.querySelector('.video-background video');
    if (video) video.style.filter = `brightness(${val/100})`;
}

function previewBlur(val) {
    document.getElementById('optBlurVal').textContent = val + 'px';
    const bg = document.querySelector('.video-background');
    if (bg) bg.style.filter = Number(val) > 0 ? `blur(${val}px)` : '';
}

function applyBgSettings() {
    const bgUrl = document.getElementById('optBgUrl').value.trim();
    const opacity = document.getElementById('optOverlayOpacity').value;
    const brightness = document.getElementById('optVideoBrightness').value;
    const blur = document.getElementById('optBlur').value;
    const s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    s.bgUrl = bgUrl; s.overlayOpacity = Number(opacity);
    s.videoBrightness = Number(brightness); s.blur = Number(blur);
    localStorage.setItem('siteSettings', JSON.stringify(s));
    applySiteSettings();
    alert('Fundo aplicado!');
}

function applyAnimSpeed(val) {
    const s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    s.animSpeed = val;
    localStorage.setItem('siteSettings', JSON.stringify(s));
    document.documentElement.style.setProperty('--anim-speed', val);
}

function applySiteSettings() {
    const s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    const video = document.querySelector('.video-background video');
    const source = video?.querySelector('source');
    const overlay = document.querySelector('.video-overlay');
    const bg = document.querySelector('.video-background');
    if (s.bgUrl && source) { source.src = s.bgUrl; video.load(); }
    if (overlay && s.overlayOpacity !== undefined) overlay.style.background = `rgba(0,0,0,${s.overlayOpacity/100})`;
    if (video && s.videoBrightness !== undefined) video.style.filter = `brightness(${s.videoBrightness/100})`;
    if (bg && s.blur) bg.style.filter = `blur(${s.blur}px)`;
    if (s.animSpeed) document.documentElement.style.setProperty('--anim-speed', s.animSpeed);
}

function showCodesModal() {
    document.getElementById('codesModal').style.display = 'flex';
    document.getElementById('codeInput').value = '';
    document.getElementById('codeResult').textContent = '';
}

function closeCodesModal() {
    document.getElementById('codesModal').style.display = 'none';
}

async function redeemCode() {
    const code = document.getElementById('codeInput').value.trim().toUpperCase();
    const result = document.getElementById('codeResult');
    if (!code) { result.textContent = 'Digite um código.'; return; }
    const myProfile = getProfile();
    if (!myProfile) { result.textContent = 'Faça login primeiro.'; return; }
    try {
        const snap = await firebase.firestore().collection('codes').doc(code).get();
        if (!snap.exists) { result.textContent = 'Código inválido.'; return; }
        const data = snap.data();
        if (data.used) { result.textContent = 'Código já utilizado.'; return; }
        // Aplica recompensa
        const updated = { ...myProfile };
        if (data.xp) updated.xp = (Number(updated.xp) || 0) + data.xp;
        if (data.frame) { updated.unlockedFrames = [...(updated.unlockedFrames || []), data.frame]; }
        saveProfile(updated);
        await firebase.firestore().collection('codes').doc(code).update({ used: true, usedBy: myProfile.id });
        result.style.color = '#a8f0c0';
        result.textContent = `Código resgatado! ${data.xp ? '+' + data.xp + ' XP' : ''} ${data.frame ? '+ Moldura' : ''}`;
    } catch(e) {
        result.textContent = 'Erro ao resgatar.';
    }
}

document.addEventListener('click', e => {
    const wrap = document.querySelector('.options-wrap');
    if (wrap && !wrap.contains(e.target)) closeOptionsMenu();
});

function renderSearchBar(currentValue = '') {
    return `
        <div class="search-bar-wrap" style="grid-column: 1 / -1; margin-bottom: 8px;">
            <div class="search-row">
                <input type="text" class="search-input" placeholder="Pesquisar jogos..." value="${currentValue}" oninput="filterCurrentGames(this.value)">
                <div class="filter-wrap">
                    <button class="filter-btn" onclick="toggleCategoryPanel()" title="Filtrar por categoria">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
                            <rect x="3" y="7" width="10" height="1.5" rx="0.75" fill="currentColor"/>
                            <rect x="5" y="11" width="6" height="1.5" rx="0.75" fill="currentColor"/>
                        </svg>
                    </button>
                    <div class="category-dropdown" id="categoryPanel">
                        ${GAME_CATEGORIES.map(c => `
                            <button class="cat-dropdown-item${c === activeCategory ? ' active' : ''}" onclick="filterByCategory('${c}')">${c}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function filterCurrentGames(query) {
    const normalized = query.trim().toLowerCase();
    // Filtra sobre os jogos já carregados no cache sem recriar a search bar
    const allCards = document.querySelectorAll('.game-card');
    allCards.forEach(card => {
        const name = card.querySelector('.game-name')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(normalized) ? '' : 'none';
    });
}

function renderGames(games, searchQuery = '') {
    const gamesGrid = document.getElementById('gamesGrid');
    window.currentFavoritesMode = false;

    const filtered = activeCategory === 'Todos' ? games : games.filter(g => g.category === activeCategory);

    gamesGrid.innerHTML = renderSearchBar() + (
        filtered.length === 0
            ? `<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;"><p style="color: var(--text-muted); font-size: 1.1rem;">Nenhum jogo encontrado</p></div>`
            : filtered.map((game, index) => {
                const favorites = getFavorites();
                const isFavorite = favorites.includes(game.id);
                const catLabel = game.category ? `<span class="game-cat-tag">${game.category}</span>` : '';
                return `
                    <div class="game-card" style="animation-delay: ${index * 50}ms">
                        <div class="game-image-wrap">
                            <img src="${game.image}" alt="${game.name}" class="game-image"
                                 onerror="this.src='https://via.placeholder.com/200x280?text=${encodeURIComponent(game.name)}'">
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${game.id})" title="Favoritar">${isFavorite ? '★' : '☆'}</button>
                        </div>
                        <div class="game-info">
                            ${catLabel}
                            <h3 class="game-name">${game.name}</h3>
                            <p class="game-description">${game.description || ''}</p>
                            <div class="game-actions">
                                <button class="download-btn" onclick="downloadGame('${game.url}'); addToHistory('${game.name}')">Download</button>
                                ${!game.isGlobal ? `<button class="delete-btn" onclick="deleteGame(${game.id})">Remover</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
    );
}

// Adicionar alguns jogos de exemplo ao primeiro uso
function initializeExampleGames() {
    const games = getGames();
    if (games.length === 0) {
        const exampleGames = [
            {
                id: Date.now() + 1,
                name: 'Exemplo: Game 1',
                url: 'https://example.com/game1',
                image: 'https://via.placeholder.com/280x180?text=Game+1',
                description: 'Este é um exemplo. Delete e adicione seus próprios jogos!'
            }
        ];
        saveGames(exampleGames);
    }
}

// Função para renderizar histórico
function renderHistory(history) {
    const gamesGrid = document.getElementById('gamesGrid');
    
    if (history.length === 0) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <p style="color: var(--text-muted); font-size: 1.1rem;">
                    Nenhum histórico ainda
                </p>
                <p style="color: var(--text-muted); margin-top: 10px; font-size: 0.9rem;">
                    Clique em "Download" para adicionar ao histórico
                </p>
            </div>
        `;
        return;
    }
    
    gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1;">
            <div class="history-list">
                ${history.map((item, index) => `
                    <div class="history-item" style="animation-delay: ${index * 50}ms">
                        <span class="history-name">${item.name}</span>
                        <span class="history-time">${item.timestamp}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Função para sair da tela de gerenciamento
function exitManagement() {
    const managementScreen = document.getElementById('managementScreen');
    managementScreen.classList.remove('show');
    isAuthenticated = false;
    document.getElementById('managementGameForm').reset();
}

// Função para carregar lista completa de jogos
function loadManagementFullList() {
    const games = getGames();
    const managementFullList = document.getElementById('managementFullList');
    
    if (games.length === 0) {
        managementFullList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <p style="font-size: 1.1rem; margin-bottom: 10px;">Nenhum jogo adicionado</p>
                <p style="font-size: 0.9rem;">Use o formulário ao lado para adicionar jogos!</p>
            </div>
        `;
        return;
    }
    
    managementFullList.innerHTML = games.map(game => `
        <div class="management-game-item">
            <div class="management-game-info">
                <h4>${game.name}</h4>
                <p>${game.url}</p>
            </div>
            <button type="button" class="delete-btn-mgmt" onclick="deleteGameFromManagement(${game.id})">
                Excluir
            </button>
        </div>
    `).join('');
}

// Função para deletar jogo do management
function deleteGameFromManagement(id) {
    if (confirm('Tem certeza que deseja deletar este jogo?')) {
        let games = getGames();
        games = games.filter(game => game.id !== id);
        saveGames(games);
        loadManagementFullList();
        renderGames(games);
    }
}

// Função para adicionar jogo do management
function addGameFromManagement(event) {
    event.preventDefault();

    const gameName = document.getElementById('mgmtGameName').value.trim();
    const gameUrl = document.getElementById('mgmtGameUrl').value.trim();
    const gameImage = document.getElementById('mgmtGameImage').value.trim();
    const gameDescription = document.getElementById('mgmtGameDescription').value.trim();

    if (!gameName || !gameUrl) {
        alert('Por favor, preencha o nome e a URL do jogo!');
        return;
    }

    const newGame = {
        id: Date.now(),
        name: gameName,
        url: gameUrl,
        image: gameImage || 'https://via.placeholder.com/280x180?text=' + encodeURIComponent(gameName),
        description: gameDescription || 'Sem descrição'
    };

    const games = getGames();
    games.push(newGame);
    saveGames(games);

    // Recarregar lista
    loadManagementFullList();
    
    // Limpar formulário
    document.getElementById('managementGameForm').reset();
    alert('Jogo adicionado com sucesso!');
    
    // Renderizar no grid principal
    renderGames(games);
}
window.onclick = function(event) {
    const passwordModal = document.getElementById('passwordModal');
    
    if (event.target == passwordModal) {
        closePasswordModal();
    }
}

// Função para mostrar perfil do usuário
function showProfile() {
    currentView = 'profile';
    saveCurrentViewState();
    updateVideoBackgroundVisibility();

    const profile = getProfile();
    
    console.log('📋 Carregando perfil para exibição:', {
        tem_perfil: !!profile,
        frame_selecionada: profile?.frame,
        molduras_desbloqueadas: profile?.unlockedFrames?.length || 0
    });
    
    // Se não houver perfil, mostra mensagem
    if (!profile) {
        const gamesGrid = document.getElementById('gamesGrid');
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
                <h2 style="color: #888; margin: 40px 0;">Faça login com Google para ver seu perfil</h2>
            </div>
        `;
        return;
    }

    // Renderizar molduras no menu
    renderFrameMenuInventory();
    
    const gamesGrid = document.getElementById('gamesGrid');
    const bannerFallback = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.03)), radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.4), transparent 25%), linear-gradient(120deg, #191919, #090909 60%, #2a2a2a)';
    const bannerStyle = profile.banner
        ? `background-image: linear-gradient(135deg, rgba(0,0,0,0.18), rgba(0,0,0,0.32)), url('${profile.banner.replace(/'/g, "\\'")}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
        : `background: ${bannerFallback}; background-size: cover; background-position: center;`;

    const levelInfo = getLevelInfo(Number(profile.xp) || 0);
    const safeLevel = levelInfo.level;
    const progressWidth = Math.min(100, Math.max(0, levelInfo.progress));
    const frameImage = profile.frame ? ` <img class="profile-frame-overlay" src="${profile.frame}" alt="Moldura do perfil"> ` : '';

    console.log('🖼️ Renderizando perfil com moldura:', {
        frame: profile.frame,
        tem_frame: !!profile.frame
    });

    gamesGrid.style.position = 'relative';
    gamesGrid.style.background = 'transparent';

    gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 0; position: relative; z-index: 1;">
            <div class="profile-shell">
                <div class="profile-main">
                    <div class="profile-panel">
                        <div class="profile-banner" style="${bannerStyle}"></div>

                        <div class="profile-content">
                            <div class="profile-avatar-wrap">
                                <div class="profile-avatar-frame">
                                    <img
                                        class="profile-avatar-large"
                                        src="${profile.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'}"
                                        alt="Avatar de ${profile.name}"
                                    >
                                    ${frameImage}
                                </div>
                            </div>

                            <div class="profile-header-row">
                                <div>
                                    <p class="profile-pronoun">${profile.pronoun ? `Pronome: ${profile.pronoun}` : ''}</p>
                                    <h2 class="profile-name-display">${profile.name || ''}</h2>
                                    <div class="profile-rank-display">
                                        <img src="${getRankVisual(profile.rank || 'Bronze I').icon}" alt="${getRankVisual(profile.rank || 'Bronze I').label}" class="profile-rank-img">
                                        <span class="profile-rank-label">${getRankVisual(profile.rank || 'Bronze I').label}</span>
                                    </div>
                                </div>
                                <div class="profile-actions">
                                    <button class="profile-frame-toggle-btn" type="button" onclick="toggleProfileMenu()" aria-label="Abrir molduras">
                                        ${profile.frame ? `<img class="profile-frame-mini" src="${profile.frame}" alt="Moldura selecionada">` : '<span class="profile-frame-mini placeholder">◈</span>'}
                                    </button>
                                    <button class="profile-edit-btn" type="button" onclick="openProfileEditor()">Editar</button>
                                </div>
                            </div>

                            <p class="profile-bio">
                                ${profile.bio || ''}
                            </p>
                        </div>
                    </div>
                </div>

                <aside class="profile-sidebar">
                    <div class="profile-card">
                        <p class="profile-card-label">ID da conta</p>
                        <h3 class="profile-id">#${profile.id || 1}</h3>
                    </div>

                    <div class="profile-card">
                        <p class="profile-card-label">Amigos e vínculos</p>
                        <div class="side-links">
                            <div class="social-item">
                                <div class="social-main">
                                    <span class="social-name">Steam</span>
                                    ${profile.steam
                                        ? `<div class="social-linked-user">
                                            <img class="social-platform-avatar" src="https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg" alt="Steam" onerror="this.src='https://store.steampowered.com/favicon.ico'">
                                            <a class="social-value social-link" href="${normalizePlatformLink('steam', profile.steam)}" target="_blank" rel="noopener noreferrer">${profile.steamName || getPlatformLinkDisplay('steam', profile.steam)}</a>
                                           </div>`
                                        : `<span class="social-value">Não vinculado</span>`}
                                </div>
                                <button class="social-link-btn ${profile.steam ? 'social-unlink-btn' : ''}" type="button" onclick="linkPlatform('steam')">${profile.steam ? 'Desvincular' : 'Vincular'}</button>
                            </div>
                            <div class="social-item">
                                <div class="social-main">
                                    <span class="social-name">Discord</span>
                                    ${profile.discord
                                        ? `<a class="social-value social-link" href="${normalizePlatformLink('discord', profile.discord)}" target="_blank" rel="noopener noreferrer">${getPlatformLinkDisplay('discord', profile.discord)}</a>`
                                        : `<span class="social-value">Não vinculado</span>`}
                                </div>
                                <button class="social-link-btn" type="button" onclick="linkPlatform('discord')">${profile.discord ? 'Alterar' : 'Vincular'}</button>
                            </div>
                            <div class="social-item">
                                <div class="social-main">
                                    <span class="social-name">Spotify</span>
                                    ${profile.spotify
                                        ? `<a class="social-value social-link spotify-user-link" href="${normalizePlatformLink('spotify', profile.spotify)}" target="_blank" rel="noopener noreferrer"><img class="spotify-user-avatar" src="${profile.spotifyAvatar || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=200&q=80'}" alt="Spotify avatar"><span>${profile.spotifyName || getPlatformLinkDisplay('spotify', profile.spotify)}</span></a>`
                                        : `<span class="social-value">Não vinculado</span>`}
                                </div>
                                <button class="social-link-btn" type="button" onclick="linkPlatform('spotify')">${profile.spotify ? 'Desconectar' : 'Vincular'}</button>
                            </div>
                        </div>

                        <div class="profile-level-box">
                            <div class="profile-level-head">
                                <span>Nível</span>
                                <strong>${safeLevel}</strong>
                            </div>
                            <div class="profile-level-bar">
                                <span style="width: ${progressWidth}%"></span>
                            </div>
                            <small class="profile-xp-label">${levelInfo.xpInLevel}/${XP_PER_LEVEL} XP</small>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    `;
}

function normalizePlatformLink(platform, rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return '';

    const normalized = value.replace(/\s+/g, '');
    const hasHttp = /^https?:\/\//i.test(value);

    if (hasHttp) {
        return value;
    }

    if (platform === 'steam') {
        if (/^steamcommunity\.com\//i.test(normalized) || /^steamcommunity\.com/i.test(value)) {
            return `https://${value.replace(/^https?:\/\//i, '').replace(/^\/+/, '')}`;
        }
        if (/^(?:https?:\/\/)?steamcommunity\.com\//i.test(value)) {
            return `https://${value.replace(/^https?:\/\//i, '').replace(/^\/+/, '')}`;
        }
        if (value.startsWith('steam://')) {
            return value;
        }
        return `https://steamcommunity.com/search/?text=${encodeURIComponent(value)}`;
    }

    if (platform === 'discord') {
        if (/^discord\.(?:gg|com)\//i.test(value) || /^https?:\/\/discord\.(?:gg|com)\//i.test(value)) {
            return /^https?:\/\//i.test(value) ? value : `https://${value}`;
        }
        if (/^@?\w+$/i.test(value)) {
            return `https://discord.com/users/${encodeURIComponent(value)}`;
        }
        return value;
    }

    if (platform === 'spotify') {
        if (/^https?:\/\//i.test(value) || /^spotify:/i.test(value)) {
            return value.startsWith('spotify:') ? `https://open.spotify.com/${value.replace(/^spotify:/, '')}` : value;
        }
        if (value.includes('/')) {
            return `https://open.spotify.com/${value.replace(/^\/+/, '')}`;
        }
        return `https://open.spotify.com/search/${encodeURIComponent(value)}`;
    }

    return value;
}

function getPlatformLinkDisplay(platform, value) {
    const clean = String(value || '').trim();
    if (!clean) return 'Não vinculado';

    const url = normalizePlatformLink(platform, clean);
    if (/^https?:\/\//i.test(url)) {
        try {
            const parsed = new URL(url);
            return parsed.hostname.replace(/^www\./i, '') + parsed.pathname.replace(/\/$/, '') || parsed.hostname;
        } catch (error) {
            return clean;
        }
    }

    return clean;
}

function linkPlatform(platform) {
    const profile = getProfile();
    if (!profile) { alert('Faça login com Google primeiro!'); return; }

    if (platform === 'spotify') {
        if (profile.spotify) {
            saveProfile({ ...profile, spotify: '', spotifyName: '', spotifyAvatar: '' });
            showProfile();
            return;
        }
        connectSpotifyAccount();
        return;
    }

    // Steam e Discord: abre modal próprio
    openLinkModal(platform, profile);
}

function openLinkModal(platform, profile) {
    const names = { steam: 'Steam', discord: 'Discord' };
    const placeholders = {
        steam: 'https://steamcommunity.com/id/seuusuario',
        discord: 'seuusuario ou discord.gg/servidor'
    };
    const current = profile[platform] || '';
    const currentName = profile[platform + 'Name'] || '';

    let modal = document.getElementById('linkModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'linkModal';
        document.body.appendChild(modal);
    }

    const steamNameField = platform === 'steam' ? `
        <div>
            <label style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);display:block;margin-bottom:6px;">Nome de exibição</label>
            <input type="text" id="linkModalName" class="link-modal-input"
                placeholder="Seu nome na Steam"
                value="${currentName}"
            >
        </div>
    ` : '';

    modal.innerHTML = `
        <div class="link-modal-overlay" onclick="closeLinkModal()"></div>
        <div class="link-modal-card">
            <div class="link-modal-header">
                <span>Vincular ${names[platform]}</span>
                <button onclick="closeLinkModal()">&times;</button>
            </div>
            <div class="link-modal-body">
                <div>
                    <label style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);display:block;margin-bottom:6px;">URL do perfil</label>
                    <input type="text" id="linkModalInput" class="link-modal-input"
                        placeholder="${placeholders[platform]}"
                        value="${current}"
                        onkeydown="if(event.key==='Enter') confirmLinkModal('${platform}')"
                    >
                </div>
                ${steamNameField}
                <div class="link-modal-actions">
                    ${current ? `<button class="link-modal-btn link-modal-remove" onclick="removePlatformLink('${platform}')">Desvincular</button>` : ''}
                    <button class="link-modal-btn link-modal-save" onclick="confirmLinkModal('${platform}')">Salvar</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('linkModalInput')?.focus(), 50);
}

function closeLinkModal() {
    const modal = document.getElementById('linkModal');
    if (modal) modal.style.display = 'none';
}

function confirmLinkModal(platform) {
    const val = document.getElementById('linkModalInput')?.value.trim() || '';
    const nameVal = document.getElementById('linkModalName')?.value.trim() || '';
    const profile = getProfile();
    if (!profile) return;
    const cleaned = normalizePlatformLink(platform, val);
    const update = { ...profile, [platform]: cleaned };
    if (platform === 'steam' && nameVal) update.steamName = nameVal;
    saveProfile(update);
    closeLinkModal();
    showProfile();
}

function removePlatformLink(platform) {
    const profile = getProfile();
    if (!profile) return;
    const update = { ...profile, [platform]: '' };
    if (platform === 'steam') update.steamName = '';
    saveProfile(update);
    closeLinkModal();
    showProfile();
}

function attachProfileFileInputs() {
    const urlInputIds = ['profileAvatarUrl', 'profileBannerUrl'];

    urlInputIds.forEach((urlInputId) => {
        const urlInput = document.getElementById(urlInputId);
        if (!urlInput) return;

        const refreshPreview = () => {
            const value = urlInput.value.trim();
            if (!value) {
                delete urlInput.dataset.previewUrl;
                updateProfileEditorPreview();
                return;
            }

            urlInput.dataset.previewUrl = value;
            updateProfileEditorPreview();
        };

        urlInput.addEventListener('input', refreshPreview);
        urlInput.addEventListener('change', refreshPreview);
    });
}

function renderFrameInventory() {
    const inventory = document.getElementById('frameInventory');
    const select = document.getElementById('profileFrameSelect');
    if (!inventory || !select) {
        console.warn('❌ frameInventory ou profileFrameSelect não encontrado');
        return;
    }

    // Mostrar TODAS as molduras disponíveis
    const frameOptions = FRAME_OPTIONS;

    console.log('🖼️ [Editor] Renderizando molduras:', {
        total_molduras: frameOptions.length
    });

    inventory.innerHTML = frameOptions.map((frame) => `
        <button type="button" class="frame-option" data-frame="${frame}" aria-label="Selecionar moldura">
            <img src="${frame}" alt="Moldura" />
        </button>
    `).join('');

    inventory.querySelectorAll('.frame-option').forEach((button) => {
        button.addEventListener('click', () => {
            const selectedFrame = button.dataset.frame;
            select.value = selectedFrame;
            syncFrameInventorySelection();
            updateProfileEditorPreview();
            closeFramePicker();
        });
    });

    syncFrameInventorySelection();
}

function renderBackgroundInventory() {
    const inventory = document.getElementById('backgroundInventory');
    const select = document.getElementById('profileBackgroundSelect');
    if (!inventory || !select) return;

    inventory.innerHTML = BACKGROUND_OPTIONS
        .filter((background) => !background.toLowerCase().endsWith('.mp4'))
        .map((background) => `
            <button type="button" class="background-option" data-background="${background}" aria-label="Selecionar fundo" style="background-image: url('${background}'); background-size: cover; background-position: center;">
                <span>Fundo</span>
            </button>
        `)
        .join('');

    inventory.querySelectorAll('.background-option').forEach((button) => {
        button.addEventListener('click', () => {
            const selectedBackground = button.dataset.background;
            select.value = selectedBackground;
            syncBackgroundInventorySelection();
            updateProfileEditorPreview();
            closeBackgroundPicker();
        });
    });

    syncBackgroundInventorySelection();
}

function syncFrameInventorySelection() {
    const inventory = document.getElementById('frameInventory');
    const select = document.getElementById('profileFrameSelect');
    const trigger = document.getElementById('framePickerTrigger');
    const label = document.getElementById('framePickerLabel');
    const image = document.getElementById('framePickerImage');
    if (!inventory || !select) return;

    const selectedValue = select.value || '';
    inventory.querySelectorAll('.frame-option').forEach((button) => {
        const isActive = button.dataset.frame === selectedValue;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (image && label && trigger) {
        if (selectedValue) {
            image.src = selectedValue;
            image.classList.remove('hidden');
            label.textContent = 'Moldura';
        } else {
            image.src = '';
            image.classList.add('hidden');
            label.textContent = 'Sem moldura';
        }
    }
}

function syncBackgroundInventorySelection() {
    const inventory = document.getElementById('backgroundInventory');
    const select = document.getElementById('profileBackgroundSelect');
    const trigger = document.getElementById('backgroundPickerTrigger');
    const label = document.getElementById('backgroundPickerLabel');
    const preview = document.getElementById('backgroundPickerPreview');
    if (!inventory || !select) return;

    const selectedValue = select.value || '';
    inventory.querySelectorAll('.background-option').forEach((button) => {
        const isActive = button.dataset.background === selectedValue;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (preview && label && trigger) {
        if (selectedValue) {
            preview.style.backgroundImage = `url('${safeAssetUrl(selectedValue)}')`;
            preview.textContent = '';
            preview.classList.remove('hidden');
            label.textContent = 'Fundo';
        } else {
            preview.style.backgroundImage = 'none';
            preview.textContent = '';
            preview.classList.add('hidden');
            label.textContent = 'Sem fundo';
        }
    }
}

function toggleFramePicker() {
    const inventory = document.getElementById('frameInventory');
    if (!inventory) return;
    inventory.classList.toggle('hidden');
}

function toggleBackgroundPicker() {
    const inventory = document.getElementById('backgroundInventory');
    if (!inventory) return;
    inventory.classList.toggle('hidden');
}

function closeFramePicker() {
    const inventory = document.getElementById('frameInventory');
    if (inventory) {
        inventory.classList.add('hidden');
    }
}

function closeBackgroundPicker() {
    const inventory = document.getElementById('backgroundInventory');
    if (inventory) {
        inventory.classList.add('hidden');
    }
}

function attachProfileEditorPreviewListeners() {
    const ids = [
        'profileNameInput',
        'profilePronounInput',
        'profileBioInput',
        'profileFrameSelect',
        'profileBackgroundSelect'
    ];

    ids.forEach((id) => {
        const element = document.getElementById(id);
        if (element && !element.dataset.previewBound) {
            element.addEventListener('input', updateProfileEditorPreview);
            element.addEventListener('change', updateProfileEditorPreview);
            element.dataset.previewBound = 'true';
        }
    });

    renderFrameInventory();
    renderBackgroundInventory();

    const frameSelect = document.getElementById('profileFrameSelect');
    if (frameSelect) {
        frameSelect.addEventListener('change', syncFrameInventorySelection);
    }

    const backgroundSelect = document.getElementById('profileBackgroundSelect');
    if (backgroundSelect) {
        backgroundSelect.addEventListener('change', syncBackgroundInventorySelection);
    }
}

function updateProfileEditorPreview() {
    const preview = document.getElementById('profilePreviewCard');
    if (!preview) return;

    const profile = getProfile();
    if (!profile) {
        preview.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">Faça login com Google para editar</p>';
        return;
    }

    const avatarUrlInput = document.getElementById('profileAvatarUrl');
    const bannerUrlInput = document.getElementById('profileBannerUrl');
    const backgroundSelect = document.getElementById('profileBackgroundSelect');
    const avatar = avatarUrlInput && avatarUrlInput.value.trim()
        ? avatarUrlInput.value.trim()
        : (profile.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80');
    const banner = bannerUrlInput && bannerUrlInput.value.trim()
        ? bannerUrlInput.value.trim()
        : (profile.banner || '');
    const selectedBackground = backgroundSelect ? backgroundSelect.value : '';
    const background = selectedBackground || profile.background || '';
    const name = document.getElementById('profileNameInput').value.trim() || profile.name || '';
    const pronoun = document.getElementById('profilePronounInput').value.trim() || profile.pronoun || '';
    const bio = document.getElementById('profileBioInput').value.trim() || profile.bio || '';
    const selectedFrame = document.getElementById('profileFrameSelect').value;
    
    const frameImage = selectedFrame ? `<img class="profile-frame-overlay" src="${selectedFrame}" alt="Moldura">` : '';
    const bannerStyle = banner
        ? `background-image: linear-gradient(135deg, rgba(0,0,0,0.18), rgba(0,0,0,0.36)), url('${safeAssetUrl(banner).replace(/'/g, "%27")}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
        : (background
            ? `background-image: linear-gradient(135deg, rgba(0,0,0,0.18), rgba(0,0,0,0.36)), url('${safeAssetUrl(background).replace(/'/g, "%27")}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : 'background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03)), linear-gradient(120deg, #171717, #0a0a0a 60%, #2c2c2c);');

    const levelInfo = getLevelInfo(Number(profile.xp) || 0);
    const accountDays = Math.max(1, Math.ceil((Date.now() - (Number(profile.createdAt) || Date.now())) / 86400000));
    const currentGame = profile.currentGame || profile.discord || 'Nenhum jogo';
    const rank = profile.rank || 'Bronze I';
    const rankVisual = getRankVisual(rank);

    preview.innerHTML = `
        <div class="profile-preview-panel">
            <div class="profile-preview-banner" style="${bannerStyle}"></div>
            <div class="profile-preview-content">
                <div class="profile-preview-main">
                    <div class="profile-preview-avatar-wrap">
                        <img src="${avatar}" alt="Avatar" class="profile-preview-avatar">
                        ${frameImage}
                    </div>
                    <div class="profile-preview-header">
                        <div>
                            <p class="profile-preview-pronoun">${pronoun ? `Pronome: ${pronoun}` : ''}</p>
                            <h3>${name || 'Seu Nome'}</h3>
                        </div>
                        <span class="profile-preview-level-badge">Lv ${levelInfo.level}</span>
                    </div>
                </div>

                <div class="profile-preview-level">
                    <div class="profile-preview-level-bar">
                        <span style="width: ${Math.min(100, Math.max(0, levelInfo.progress))}%"></span>
                    </div>
                    <small>${levelInfo.xpInLevel}/${XP_PER_LEVEL} XP</small>
                </div>

                <p class="profile-preview-bio">${bio}</p>

                <div class="profile-preview-stats">
                    <div class="profile-preview-stat">
                        <span>Membro desde</span>
                        <strong>${new Date(Number(profile.createdAt) || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
                    </div>
                    <div class="profile-preview-stat">
                        <span>Jogo</span>
                        <strong>${currentGame}</strong>
                    </div>
                    <div class="profile-preview-stat profile-preview-rank-stat">
                        <span>Rank</span>
                        <img class="profile-rank-icon" src="${rankVisual.icon}" alt="${rankVisual.label}">
                        <strong>${rankVisual.label}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openProfileEditor() {
    const profile = getProfile();
    if (!profile) {
        alert('Faça login com Google primeiro!');
        return;
    }
    
    const modal = document.getElementById('editProfileModal');
    const nav = document.querySelector('.bottom-nav');
    if (!modal) return;

    if (nav) {
        nav.style.display = 'none';
    }

    const avatarUrlInput = document.getElementById('profileAvatarUrl');
    const bannerUrlInput = document.getElementById('profileBannerUrl');

    if (avatarUrlInput) {
        avatarUrlInput.value = profile.avatar && !profile.avatar.startsWith('data:') ? profile.avatar : '';
    }
    if (bannerUrlInput) {
        bannerUrlInput.value = profile.banner && !profile.banner.startsWith('data:') ? profile.banner : '';
    }

    document.getElementById('profileNameInput').value = profile?.name || '';
    document.getElementById('profilePronounInput').value = profile.pronoun || '';
    document.getElementById('profileBioInput').value = profile.bio || '';
    document.getElementById('profileFrameSelect').value = profile.frame || '';

    const createdAt = document.getElementById('profileCreatedAtDisplay');
    if (createdAt && profile.createdAt) {
        const date = new Date(Number(profile.createdAt));
        createdAt.textContent = `Conta criada em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    }
    syncFrameInventorySelection();
    updateProfileEditorPreview();

    modal.classList.add('show');
}

function closeProfileEditor() {
    const modal = document.getElementById('editProfileModal');
    const nav = document.querySelector('.bottom-nav');
    if (modal) {
        modal.classList.remove('show');
    }
    if (nav) {
        nav.style.display = '';
    }
}

function saveProfileFromForm(event) {
    event.preventDefault();

    const currentProfile = getProfile();
    if (!currentProfile) {
        alert('Faça login com Google primeiro!');
        return;
    }
    
    const selectedFrame = document.getElementById('profileFrameSelect').value;
    const backgroundSelect = document.getElementById('profileBackgroundSelect');
    const selectedBackground = backgroundSelect ? backgroundSelect.value : '';
    const chosenFrame = selectedFrame || '';
    const chosenBackground = selectedBackground || '';
    const avatarUrlInput = document.getElementById('profileAvatarUrl');
    const bannerUrlInput = document.getElementById('profileBannerUrl');
    const avatarUrlValue = avatarUrlInput ? avatarUrlInput.value.trim() : '';
    const bannerUrlValue = bannerUrlInput ? bannerUrlInput.value.trim() : '';

    const updatedProfile = {
        ...currentProfile,
        name: document.getElementById('profileNameInput').value.trim() || '',
        pronoun: document.getElementById('profilePronounInput').value.trim() || '',
        bio: document.getElementById('profileBioInput').value.trim() || '',
        avatar: avatarUrlValue || (currentProfile.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'),
        banner: bannerUrlValue || (currentProfile.banner || ''),
        background: chosenBackground,
        frame: chosenFrame,
        xp: Number(currentProfile.xp) || 0,
        level: Number(currentProfile.level) || 1
    };

    console.log('📝 Formulário de perfil salvo:', updatedProfile);
    saveProfile(updatedProfile);
    updateProfileNav();
    syncFrameInventorySelection();
    renderFrameMenuInventory();
    closeProfileEditor();
    showProfile();
}

function renderFavoriteGames(games, searchQuery = '') {
    const gamesGrid = document.getElementById('gamesGrid');
    window.currentFavoritesMode = true;

    gamesGrid.innerHTML = renderSearchBar(searchQuery) + (
        games.length === 0
            ? `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="color: var(--text-muted); font-size: 1.1rem;">
                        Nenhum jogo favoritado ainda
                    </p>
                    <p style="color: var(--text-muted); margin-top: 10px; font-size: 0.9rem;">
                        Clique na estrela de um jogo para favoritá-lo!
                    </p>
                </div>
            `
            : games.map((game, index) => {
                return `
                    <div class="game-card" style="animation-delay: ${index * 50}ms">
                        <img src="${game.image}" alt="${game.name}" class="game-image" 
                             onerror="this.src='https://via.placeholder.com/280x180?text=${encodeURIComponent(game.name)}'">
                        <div class="game-info">
                            <div class="game-header">
                                <h3 class="game-name">${game.name}</h3>
                                <button class="favorite-btn active" 
                                        onclick="toggleFavorite(${game.id})" 
                                        title="Remover dos favoritos">
                                    ★
                                </button>
                            </div>
                            <p class="game-description">${game.description}</p>
                            <div class="game-actions">
                                <button class="download-btn" onclick="downloadGame('${game.url}'); addToHistory('${game.name}')">
                                    Download
                                </button>
                                <button class="delete-btn" onclick="deleteGame(${game.id})">
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
    );
}

// Função para mostrar amigos
async function showFriends() {
    currentView = 'friends';
    saveCurrentViewState();
    updateVideoBackgroundVisibility();

    const myProfile = getProfile();
    const myFriends = myProfile?.friends || [];

    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 0;">
            <div class="friends-shell">
                <div class="friends-header">
                    <h2 class="friends-title">Amigos</h2>
                    <div class="friends-search-wrap">
                        <input type="number" id="friendSearchId" class="friends-search-input" placeholder="Buscar usuário por ID..." min="1">
                        <button class="friends-search-btn" onclick="searchFriendById()">Buscar</button>
                    </div>
                </div>
                <div id="friendSearchResult"></div>
                <div class="friends-list-label">Meus Amigos <span class="friends-count">${myFriends.length}</span></div>
                <div id="friendsList" class="friends-list">${myFriends.length === 0 ? '<div class="friends-empty-state"><p>Nenhum amigo adicionado ainda.</p><p style="font-size:0.8rem;margin-top:4px;">Busque pelo ID de um usuário acima.</p></div>' : '<p class="friends-loading">Carregando...</p>'}</div>
            </div>
        </div>
    `;

    if (myFriends.length > 0) {
        try {
            const snaps = await Promise.all(
                myFriends.map(id => firebase.firestore().collection('profiles').where('id', '==', id).limit(1).get())
            );
            const users = snaps.flatMap(s => s.docs.map(d => d.data()));
            const list = document.getElementById('friendsList');
            list.innerHTML = users.length === 0
                ? '<div class="friends-empty-state"><p>Nenhum amigo encontrado.</p></div>'
                : users.map(u => renderFriendCard(u, true)).join('');
        } catch (e) {
            document.getElementById('friendsList').innerHTML = '<p class="friends-empty">Erro ao carregar amigos.</p>';
        }
    }
}

async function searchFriendById() {
    const id = Number(document.getElementById('friendSearchId').value);
    const result = document.getElementById('friendSearchResult');
    if (!id || id < 1) { result.innerHTML = ''; return; }

    const myProfile = getProfile();
    if (myProfile && Number(myProfile.id) === id) {
        result.innerHTML = '<p class="friends-empty">Este é você!</p>';
        return;
    }

    result.innerHTML = '<p class="friends-loading">Buscando...</p>';
    try {
        const snapshot = await firebase.firestore().collection('profiles').where('id', '==', id).limit(1).get();
        if (snapshot.empty) {
            result.innerHTML = '<p class="friends-empty">Usuário não encontrado.</p>';
        } else {
            const user = snapshot.docs[0].data();
            const myFriends = myProfile?.friends || [];
            const isFriend = myFriends.includes(id);
            result.innerHTML = '<div class="friends-search-result-label">Resultado</div>' + renderFriendCard(user, isFriend);
        }
    } catch (e) {
        result.innerHTML = '<p class="friends-empty">Erro na busca.</p>';
    }
}

function renderFriendCard(user, isFriend = false) {
    const levelInfo = getLevelInfo(Number(user.xp) || 0);
    const rankVisual = getRankVisual(user.rank || 'Bronze I');
    const avatar = user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
    const frame = user.frame ? `<img class="friend-card-frame" src="${user.frame}" alt="">` : '';
    return `
        <div class="friend-card" onclick="openFriendPanel(${user.id})">
            <div class="friend-card-avatar-wrap">
                <img class="friend-card-avatar" src="${avatar}" alt="${user.name || ''}">
                ${frame}
            </div>
            <div class="friend-card-info">
                <span class="friend-card-name">${user.name || 'Sem nome'}</span>
                <span class="friend-card-sub">#${user.id || '?'} &middot; ${rankVisual.label}</span>
            </div>
            <div class="friend-card-right">
                <img src="${rankVisual.icon}" class="friend-card-rank-icon" alt="${rankVisual.label}">
                <span class="friend-card-level">Lv ${levelInfo.level}</span>
            </div>
        </div>
    `;
}

let _friendPanelData = null;

async function openFriendPanel(userId) {
    // Busca dados frescos
    const snap = await firebase.firestore().collection('profiles').where('id', '==', userId).limit(1).get();
    if (snap.empty) return;
    const user = snap.docs[0].data();
    _friendPanelData = user;

    const myProfile = getProfile();
    const myFriends = myProfile?.friends || [];
    const isFriend = myFriends.includes(userId);

    const levelInfo = getLevelInfo(Number(user.xp) || 0);
    const rankVisual = getRankVisual(user.rank || 'Bronze I');
    const avatar = user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
    const frame = user.frame ? `<img class="fp-frame" src="${user.frame}" alt="">` : '';

    let panel = document.getElementById('friendPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'friendPanel';
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="fp-overlay" onclick="closeFriendPanel()"></div>
        <div class="fp-card">
            <button class="fp-close" onclick="closeFriendPanel()">&times;</button>
            <div class="fp-avatar-wrap">
                <img class="fp-avatar" src="${avatar}" alt="${user.name}">
                ${frame}
            </div>
            <div class="fp-name">${user.name || 'Sem nome'}</div>
            <div class="fp-id">#${user.id}</div>
            <div class="fp-rank-row">
                <img src="${rankVisual.icon}" class="fp-rank-icon" alt="">
                <span class="fp-rank">${rankVisual.label} &middot; Lv ${levelInfo.level}</span>
            </div>
            ${user.bio ? `<div class="fp-bio">${user.bio}</div>` : ''}
            <div class="fp-actions">
                <button class="fp-btn fp-btn-add" onclick="toggleFriendship(${userId}, ${isFriend})">
                    ${isFriend ? '&#10005; Remover' : '+ Adicionar'}
                </button>
                <button class="fp-btn" onclick="viewFriendProfile(${userId})">Ver perfil</button>
                <button class="fp-btn" onclick="openMessage(${userId})">Mensagem</button>
            </div>
        </div>
    `;
    panel.style.display = 'flex';
}

function closeFriendPanel() {
    const panel = document.getElementById('friendPanel');
    if (panel) panel.style.display = 'none';
}

async function toggleFriendship(userId, isFriend) {
    const myProfile = getProfile();
    if (!myProfile) return;
    let friends = myProfile.friends || [];
    if (isFriend) {
        friends = friends.filter(id => id !== userId);
    } else {
        if (!friends.includes(userId)) friends.push(userId);
    }
    const updated = { ...myProfile, friends };
    saveProfile(updated);
    closeFriendPanel();
    showFriends();
}

async function viewFriendProfile(userId) {
    closeFriendPanel();
    const snap = await firebase.firestore().collection('profiles').where('id', '==', Number(userId)).limit(1).get();
    if (snap.empty) return;
    showPublicProfile(snap.docs[0].data());
}

function showPublicProfile(user) {
    currentView = 'profile';
    saveCurrentViewState();
    updateVideoBackgroundVisibility();

    const levelInfo = getLevelInfo(Number(user.xp) || 0);
    const progressWidth = Math.min(100, Math.max(0, levelInfo.progress));
    const rankVisual = getRankVisual(user.rank || 'Bronze I');
    const bannerStyle = user.banner
        ? `background-image: linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.32)),url('${user.banner}'); background-size:cover; background-position:center;`
        : 'background: linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.03)),linear-gradient(120deg,#191919,#090909 60%,#2a2a2a);';
    const frameImage = user.frame ? `<img class="profile-frame-overlay" src="${user.frame}" alt="">` : '';
    const accountDays = Math.max(1, Math.ceil((Date.now() - (Number(user.createdAt) || Date.now())) / 86400000));
    const currentGame = user.currentGame || 'Nenhum jogo';

    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.style.position = 'relative';
    gamesGrid.style.background = 'transparent';
    gamesGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:40px 0;">
            <button onclick="showFriends()" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:10px;padding:8px 16px;cursor:pointer;margin-bottom:20px;font-size:0.85rem;">← Voltar</button>
            <div class="profile-shell">
                <div class="profile-main">
                    <div class="profile-panel">
                        <div class="profile-banner" style="${bannerStyle}"></div>
                        <div class="profile-content">
                            <div class="profile-avatar-wrap"><div class="profile-avatar-frame">
                                <img class="profile-avatar-large" src="${user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'}" alt="">
                                ${frameImage}
                            </div></div>
                            <div class="profile-header-row">
                                <div>
                                    <p class="profile-pronoun">${user.pronoun ? 'Pronome: ' + user.pronoun : ''}</p>
                                    <h2 class="profile-name-display">${user.name || ''}</h2>
                                    <div class="profile-rank-display">
                                        <img src="${rankVisual.icon}" alt="${rankVisual.label}" class="profile-rank-img">
                                        <span class="profile-rank-label">${rankVisual.label}</span>
                                    </div>
                                </div>
                            </div>
                            <p class="profile-bio">${user.bio || ''}</p>
                        </div>
                    </div>
                </div>
                <aside class="profile-sidebar">
                    <div class="profile-card">
                        <p class="profile-card-label">ID da conta</p>
                        <h3 class="profile-id">#${user.id || '?'}</h3>
                    </div>
                    <div class="profile-card">
                        <div class="profile-preview-stats">
                            <div class="profile-preview-stat">
                                <span>Membro desde</span>
                                <strong>${new Date(Number(user.createdAt) || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
                            </div>
                            <div class="profile-preview-stat">
                                <span>Jogo</span>
                                <strong>${currentGame}</strong>
                            </div>
                        </div>
                        <div class="profile-level-box" style="margin-top:14px;">
                            <div class="profile-level-head"><span>Nível</span><strong>${levelInfo.level}</strong></div>
                            <div class="profile-level-bar"><span style="width:${progressWidth}%"></span></div>
                            <small class="profile-xp-label">${levelInfo.xpInLevel}/${XP_PER_LEVEL} XP</small>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    `;
}

function openMessage(userId) {
    closeFriendPanel();
    openChat(userId);
}

let chatUnsubscribe = null;
let activeChatUserId = null;

function getChatId(idA, idB) {
    return [idA, idB].sort((a, b) => a - b).join('_');
}

async function openChat(targetUserId) {
    const myProfile = getProfile();
    if (!myProfile) return;

    const screen = document.getElementById('chatScreen');
    screen.style.display = 'flex';
    document.querySelector('.bottom-nav').style.display = 'none';

    // Carrega lista de conversas (amigos)
    await loadChatConversationList(myProfile);
    if (targetUserId) await openChatWith(targetUserId);
}

function closeChat() {
    const screen = document.getElementById('chatScreen');
    screen.style.display = 'none';
    document.querySelector('.bottom-nav').style.display = '';
    if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
    activeChatUserId = null;
}

async function loadChatConversationList(myProfile) {
    const list = document.getElementById('chatConversationList');
    const friends = myProfile.friends || [];
    if (friends.length === 0) {
        list.innerHTML = '<p class="chat-empty-list">Nenhum amigo ainda.</p>';
        return;
    }
    list.innerHTML = '<p class="chat-empty-list">Carregando...</p>';
    try {
        const snaps = await Promise.all(
            friends.map(id => firebase.firestore().collection('profiles').where('id', '==', id).limit(1).get())
        );
        const users = snaps.flatMap(s => s.docs.map(d => d.data()));
        list.innerHTML = users.map(u => {
            const avatar = u.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
            const frame = u.frame ? `<img class="chat-conv-frame" src="${u.frame}" alt="">` : '';
            return `
                <div class="chat-conv-item" id="conv-${u.id}" onclick="openChatWith(${u.id})">
                    <div class="chat-conv-avatar-wrap">
                        <img class="chat-conv-avatar" src="${avatar}" alt="">
                        ${frame}
                    </div>
                    <div class="chat-conv-info">
                        <span class="chat-conv-name">${u.name || 'Sem nome'}</span>
                        <span class="chat-conv-last" id="last-${u.id}"></span>
                    </div>
                </div>
            `;
        }).join('');
    } catch(e) {
        list.innerHTML = '<p class="chat-empty-list">Erro ao carregar.</p>';
    }
}

async function openChatWith(targetUserId) {
    const myProfile = getProfile();
    if (!myProfile) return;

    // Destaca conversa ativa
    document.querySelectorAll('.chat-conv-item').forEach(el => el.classList.remove('active'));
    const convEl = document.getElementById(`conv-${targetUserId}`);
    if (convEl) convEl.classList.add('active');

    activeChatUserId = targetUserId;

    // Busca dados do outro usuário
    const snap = await firebase.firestore().collection('profiles').where('id', '==', targetUserId).limit(1).get();
    if (snap.empty) return;
    const targetUser = snap.docs[0].data();

    // Mostra área de chat
    document.getElementById('chatMainEmpty').style.display = 'none';
    document.getElementById('chatMainActive').style.display = 'flex';

    // Header
    const avatar = targetUser.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
    const frame = targetUser.frame ? `<img class="chat-header-frame" src="${targetUser.frame}" alt="">` : '';
    document.getElementById('chatHeader').innerHTML = `
        <div class="chat-header-avatar-wrap">
            <img class="chat-header-avatar" src="${avatar}" alt="">
            ${frame}
        </div>
        <div class="chat-header-info">
            <span class="chat-header-name">${targetUser.name || 'Sem nome'}</span>
            <span class="chat-header-id">#${targetUser.id}</span>
        </div>
    `;

    // Escuta mensagens em tempo real
    if (chatUnsubscribe) chatUnsubscribe();
    const chatId = getChatId(myProfile.id, targetUserId);
    chatUnsubscribe = firebase.firestore()
        .collection('chats').doc(chatId)
        .collection('messages')
        .orderBy('createdAt')
        .onSnapshot(snap => {
            renderChatMessages(snap.docs.map(d => d.data()), myProfile.id);
        });
}

function renderChatMessages(messages, myId) {
    const container = document.getElementById('chatMessages');
    if (messages.length === 0) {
        container.innerHTML = '<p class="chat-no-messages">Nenhuma mensagem ainda. Diga olá!</p>';
        return;
    }
    container.innerHTML = messages.map(msg => {
        const isMine = msg.senderId === myId;
        const time = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        if (msg.type === 'file') {
            return `
                <div class="chat-msg ${isMine ? 'mine' : 'theirs'}">
                    <a class="chat-file-msg" href="${msg.fileData}" download="${msg.fileName}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" stroke-width="1.2"/><path d="M10 2v4h4" stroke="currentColor" stroke-width="1.2"/></svg>
                        ${msg.fileName}
                    </a>
                    <span class="chat-msg-time">${time}</span>
                </div>`;
        }
        return `
            <div class="chat-msg ${isMine ? 'mine' : 'theirs'}">
                <span class="chat-msg-text">${msg.text}</span>
                <span class="chat-msg-time">${time}</span>
            </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const myProfile = getProfile();
    if (!myProfile || !activeChatUserId) return;
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = '';
    const chatId = getChatId(myProfile.id, activeChatUserId);
    await firebase.firestore().collection('chats').doc(chatId).collection('messages').add({
        text,
        senderId: myProfile.id,
        senderName: myProfile.name,
        type: 'text',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function chatInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

function autoResizeChatInput(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

async function handleChatFile(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
        alert('Arquivo muito grande! Máximo 1 MB.');
        return;
    }
    const myProfile = getProfile();
    if (!myProfile || !activeChatUserId) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const chatId = getChatId(myProfile.id, activeChatUserId);
        await firebase.firestore().collection('chats').doc(chatId).collection('messages').add({
            type: 'file',
            fileName: file.name,
            fileData: e.target.result,
            senderId: myProfile.id,
            senderName: myProfile.name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    };
    reader.readAsDataURL(file);
}

// Função para mostrar favoritos recentes
function showRecentFavorites() {
    currentView = 'favorites';
    saveCurrentViewState();
    updateVideoBackgroundVisibility();

    const favorites = getFavorites();

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        firebase.firestore().collection('globalGames').get().then(snap => {
            const globalGames = snap.docs.map(d => ({ ...d.data(), isGlobal: true }));
            const localGames = getGames();
            const allGames = [...globalGames, ...localGames];
            const favoriteGames = allGames.filter(g => favorites.includes(g.id));
            renderFavoriteGames(favoriteGames, '');
        }).catch(() => {
            const localGames = getGames();
            renderFavoriteGames(localGames.filter(g => favorites.includes(g.id)), '');
        });
    } else {
        const localGames = getGames();
        renderFavoriteGames(localGames.filter(g => favorites.includes(g.id)), '');
    }
}
