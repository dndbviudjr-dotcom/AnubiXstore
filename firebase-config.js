// ========================================
// FIREBASE CONFIGURATION
// ========================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing one)
// 3. Enable Google Authentication
// 4. Enable Firestore Database
// 5. Copy your Firebase config from Project Settings
// 6. Replace the config object below with your credentials

const firebaseConfig = {
    apiKey: "AIzaSyCJDMOnfy6xd9RL8zZUKbV32k3ivHbfnBs",
    authDomain: "anubixstore-120ea.firebaseapp.com",
    projectId: "anubixstore-120ea",
    storageBucket: "anubixstore-120ea.firebasestorage.app",
    messagingSenderId: "612420553864",
    appId: "1:612420553864:web:7406534a7c51fea8a5633d",
    measurementId: "G-K5V3B3LL21"
};

// Initialize Firebase
let db = null;
let auth = null;
let currentUser = null;
let previousAuthUser = null;

console.log("🔥 Firebase Config loaded");
console.log("Firebase object available:", typeof firebase !== 'undefined');

try {
    console.log("Initializing Firebase with config...");
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log("✅ Firebase initialized successfully!");
    console.log("Auth:", typeof auth);
    console.log("Firestore:", typeof db);
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        console.log("Auth state changed:", user ? user.email : "No user");

        const switchedAccount = previousAuthUser && user && previousAuthUser.uid !== user.uid;
        if (!user || switchedAccount) {
            clearLocalUserState();
        }

        currentUser = user;
        updateAuthUI(user);
        
        if (user) {
            // User is signed in, sync their profile
            await syncProfileFromCloud();
            previousAuthUser = user;
        } else {
            previousAuthUser = null;
        }
    });
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// ========================================
// SEQUENTIAL USER ID GENERATOR
// ========================================
async function getNextUserId() {
    try {
        const counterRef = db.collection('_metadata').doc('userCounter');

        const nextId = await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            let nextValue = 1;
            if (counterDoc.exists) {
                nextValue = (counterDoc.data().nextId || 0) + 1;
            }

            transaction.set(counterRef, { nextId: nextValue }, { merge: true });
            return nextValue;
        });

        console.log(`✅ Novo ID de usuário atribuído: ${nextId}`);
        return nextId;
    } catch (error) {
        console.error('❌ Erro ao gerar ID sequencial:', error);
        return Math.floor(Date.now() / 1000) % 100000;
    }
}

function updateAuthUI(user) {
    const authScreen = document.getElementById('authScreen');
    const appContent = document.getElementById('appContent');
    const loadingScreen = document.getElementById('loadingScreen');

    if (loadingScreen) loadingScreen.classList.add('hidden');
    
    if (user) {
        if (authScreen) authScreen.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
    } else {
        if (authScreen) authScreen.style.display = 'flex';
        if (appContent) appContent.style.display = 'none';
    }
}

function loginWithGoogle() {
    console.log("🔵 loginWithGoogle called");
    console.log("auth object:", auth);
    console.log("firebase object:", typeof firebase);
    console.log("Firebase initialized:", firebase && firebase.apps && firebase.apps.length > 0);
    
    if (!firebase || !firebase.apps || firebase.apps.length === 0) {
        console.error("❌ Firebase not initialized yet");
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = 'Firebase SDK ainda não foi inicializado. Aguarde alguns segundos e tente novamente.';
        }
        return;
    }
    
    if (!auth) {
        console.error("❌ auth is null - Firebase not initialized");
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = 'Firebase não foi inicializado. Verifique o console (F12) para mais detalhes.';
        }
        return;
    }
    
    try {
        console.log("Creating Google provider...");
        const provider = new firebase.auth.GoogleAuthProvider();
        console.log("Provider created:", provider);
        
        console.log("Attempting signInWithPopup...");
        auth.signInWithPopup(provider)
            .then(async result => {
                console.log("✅ Login successful:", result.user.email);
                console.log("User UID:", result.user.uid);
                
                // Check if user profile exists
                const userDocRef = db.collection('profiles').doc(result.user.uid);
                const userDoc = await userDocRef.get();
                
                if (!userDoc.exists) {
                    // First time login - clear old localStorage and show name setup modal
                    console.log("🆕 First login detected - clearing old data and showing name setup modal");
                    localStorage.clear();
                    sessionStorage.clear();
                    showNameSetupModal(result.user);
                } else {
                    console.log("↩️ Returning user - loading profile from Firestore");
                    // Returning user - profile will be loaded by onAuthStateChanged
                }
            })
            .catch(error => {
                console.error("❌ Login error:", error);
                console.error("Error code:", error.code);
                console.error("Error message:", error.message);
                console.error("Full error:", error);
                const errorDiv = document.getElementById('authError');
                if (errorDiv) {
                    errorDiv.textContent = 'Erro ao fazer login: ' + error.message;
                }
            });
    } catch (error) {
        console.error("❌ Exception in loginWithGoogle:", error);
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = 'Erro: ' + error.message;
        }
    }
}

function clearLocalUserState() {
    const keysToClear = ['profile', 'gameHub_profile', 'gameHub_games', 'gameHub_favorites', 'gameHub_history', 'gameHub_last_view'];
    keysToClear.forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem('spotify_auth_state');
    sessionStorage.removeItem('spotify_code_verifier');
}

function logoutUser() {
    if (!auth) return;
    
    auth.signOut().then(() => {
        console.log('Usuário desconectado');
        clearLocalUserState();
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

// ========================================
// FIRESTORE SYNC FUNCTIONS
// ========================================

async function syncProfileToCloud(profile) {
    if (!db || !currentUser) {
        console.log('⚠️ Cloud sync disabled: Firebase not ready or user not logged in');
        return;
    }
    
    try {
        const userId = currentUser.uid;
        console.log('💾 Salvando perfil no Firestore para:', userId);
        
        // Remover campos muito grandes (imagens base64)
        const profileToSave = { ...profile };
        
        // Se avatar for base64 (muito grande), não enviar
        if (profileToSave.avatar && profileToSave.avatar.startsWith('data:')) {
            console.log('⚠️ Avatar é base64 - não enviando (mantém local)');
            profileToSave.avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
        }
        
        // Se banner for base64 (muito grande), remover
        if (profileToSave.banner && profileToSave.banner.startsWith('data:')) {
            console.log('⚠️ Banner é base64 - não enviando (mantém local)');
            profileToSave.banner = '';
        }
        
        console.log('📦 Enviando para Firestore...');
        
        await db.collection('profiles').doc(userId).set({
            ...profileToSave,
            updatedAt: new Date(),
            email: currentUser.email
        }, { merge: true });
        
        console.log('✅ Perfil sincronizado com sucesso na nuvem!');
    } catch (error) {
        console.error('❌ Erro ao sincronizar perfil:', error);
        console.error('  - Código de erro:', error.code);
        console.error('  - Mensagem:', error.message);
    }
}

async function syncProfileFromCloud() {
    if (!db || !currentUser) {
        console.log('Cloud sync disabled: Firebase not ready or user not logged in');
        return null;
    }
    
    try {
        const userId = currentUser.uid;
        const docSnap = await db.collection('profiles').doc(userId).get();
        
        if (docSnap.exists) {
            const cloudProfile = docSnap.data();
            console.log('✅ Perfil carregado do Firestore');
            
            // Pegar perfil local (pode ter imagens base64)
            const storedProfile = localStorage.getItem('gameHub_profile');
            const localProfile = storedProfile ? JSON.parse(storedProfile) : null;
            
            // Fazer merge inteligente
            let mergedProfile = { ...cloudProfile };
            // Manter o ID sequencial que foi atribuído na criação
            // Não sobrescrever com Firebase UID
            
            if (localProfile) {
                // Manter imagens base64 locais (mais recentes)
                if (localProfile.avatar && localProfile.avatar.startsWith('data:')) {
                    console.log('🖼️ Usando avatar local (base64)');
                    mergedProfile.avatar = localProfile.avatar;
                }
                if (localProfile.banner && localProfile.banner.startsWith('data:')) {
                    console.log('🖼️ Usando banner local (base64)');
                    mergedProfile.banner = localProfile.banner;
                }
                // Manter moldura local se existir
                if (localProfile.frame) {
                    console.log('🖼️ Usando moldura local:', localProfile.frame);
                    mergedProfile.frame = localProfile.frame;
                }
                // Manter molduras desbloqueadas locais
                if (localProfile.unlockedFrames) {
                    console.log('🎁 Usando molduras desbloqueadas locais');
                    mergedProfile.unlockedFrames = localProfile.unlockedFrames;
                }
            }
            
            console.log('📦 Perfil mesclado:', {
                ...mergedProfile,
                avatar: mergedProfile.avatar ? mergedProfile.avatar.substring(0, 50) + '...' : 'vazio',
                banner: mergedProfile.banner ? mergedProfile.banner.substring(0, 50) + '...' : 'vazio',
                frame: mergedProfile.frame || 'nenhuma',
                unlockedFrames: mergedProfile.unlockedFrames ? mergedProfile.unlockedFrames.length : 0
            });
            
            // Salvar perfil mesclado localmente
            localStorage.setItem('gameHub_profile', JSON.stringify(mergedProfile));

            // Carregar favoritos salvos na nuvem
            if (mergedProfile.favorites && Array.isArray(mergedProfile.favorites)) {
                localStorage.setItem('gameHub_favorites', JSON.stringify(mergedProfile.favorites));
            }
            
            // Update UI
            if (window.updateProfileUI) {
                window.updateProfileUI(mergedProfile);
            }
            
            return mergedProfile;
        } else {
            console.log('⚠️ Profile not found in Firestore - should have been created by name setup modal');
            return null;
        }
    } catch (error) {
        console.error('Error syncing profile from cloud:', error);
        return null;
    }
}

// ========================================
// NAME SETUP MODAL
// ========================================

function showNameSetupModal(googleUser) {
    const modal = document.getElementById('setupNameModal');
    const input = document.getElementById('setupNameInput');
    const errorDiv = document.getElementById('setupError');
    
    if (modal) {
        modal.style.display = 'flex';
        input.value = googleUser.displayName || '';
        input.focus();
        errorDiv.textContent = '';
        
        // Store current Google user for later use
        window.pendingGoogleUser = googleUser;
    }
}

function hideNameSetupModal() {
    const modal = document.getElementById('setupNameModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.pendingGoogleUser = null;
}

async function confirmUserName() {
    const input = document.getElementById('setupNameInput');
    const errorDiv = document.getElementById('setupError');
    const userName = input.value.trim();
    
    if (!userName) {
        errorDiv.textContent = 'Por favor, digite seu nome';
        return;
    }
    
    if (!window.pendingGoogleUser) {
        errorDiv.textContent = 'Erro: dados do Google não encontrados';
        return;
    }
    
    try {
        const googleUser = window.pendingGoogleUser;
        const firebaseUid = googleUser.uid;
        
        // Gerar ID sequencial (1, 2, 3, 4...)
        const sequentialId = await getNextUserId();
        
        // Create initial profile in Firestore
        const initialProfile = {
            id: sequentialId,  // ID sequencial para exibição (1, 2, 3...)
            firebaseUid: firebaseUid,  // UID do Firebase para referência
            email: googleUser.email,
            name: userName,
            pronoun: '',
            bio: '',
            avatar: googleUser.photoURL || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
            banner: '',
            background: '',
            video: '',
            frame: '',
            xp: 0,
            lastXpAt: Date.now(),
            createdAt: Date.now(),
            currentGame: 'Nenhum jogo',
            rank: 'Bronze I',
            steam: '',
            discord: '',
            spotify: ''
        };
        
        // Save to Firestore with Firebase UID as document key (para segurança)
        // Mas o campo 'id' será o ID sequencial
        await db.collection('profiles').doc(firebaseUid).set(initialProfile);
        console.log(`✅ Perfil criado: ID sequencial=${sequentialId}, FirebaseUID=${firebaseUid}`);
        
        // Hide modal and load the app
        hideNameSetupModal();
        
        // Manually trigger profile UI update since we just created it
        localStorage.setItem('gameHub_profile', JSON.stringify(initialProfile));
        if (window.updateProfileUI) {
            window.updateProfileUI(initialProfile);
        }
    } catch (error) {
        console.error('❌ Error creating profile:', error);
        errorDiv.textContent = 'Erro ao criar conta: ' + error.message;
    }
}

// Allow Enter key to confirm
document.addEventListener('DOMContentLoaded', () => {
    const setupInput = document.getElementById('setupNameInput');
    if (setupInput) {
        setupInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmUserName();
            }
        });
    }
});

// ========================================
// GAMES/INVENTORY SYNC (Optional - implement if needed)
// ========================================

async function syncGamesToCloud(games) {
    if (!db || !currentUser) return;
    
    try {
        const userId = currentUser.uid;
        await db.collection('games').doc(userId).set({
            games: games,
            updatedAt: new Date()
        }, { merge: true });
    } catch (error) {
        console.error('Error syncing games:', error);
    }
}

// ========================================
// ADMIN FUNCTIONS
// ========================================

async function isUserAdmin() {
    if (!currentUser || !db) return false;
    
    try {
        const profileDoc = await db.collection('profiles').doc(currentUser.uid).get();
        if (profileDoc.exists) {
            return profileDoc.data().isAdmin === true;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
    return false;
}

async function openAdminModal() {
    const currentProfile = getProfile();

    if (!currentProfile || Number(currentProfile.id) !== 1 && String(currentProfile.id) !== '1') {
        alert('Acesso negado. Apenas o ID 1 pode acessar o painel de admin.');
        return;
    }

    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        adminLoadGlobalGames();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function initAdminDrag() {
    const modal = document.getElementById('adminModalContent');
    const handle = document.getElementById('adminDragHandle');

    if (!modal || !handle || modal.dataset.dragBound === 'true') {
        return;
    }

    modal.dataset.dragBound = 'true';
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const getPointerPosition = (event) => {
        if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
            return { x: event.clientX, y: event.clientY };
        }

        if (event.touches && event.touches[0]) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }

        return null;
    };

    handle.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.close')) {
            return;
        }

        const position = getPointerPosition(event);
        if (!position) return;

        const rect = modal.getBoundingClientRect();
        offsetX = position.x - rect.left;
        offsetY = position.y - rect.top;
        isDragging = true;
        modal.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    });

    window.addEventListener('pointermove', (event) => {
        if (!isDragging) return;

        const position = getPointerPosition(event);
        if (!position) return;

        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;

        let left = position.x - offsetX;
        let top = position.y - offsetY;

        left = Math.min(Math.max(0, left), Math.max(0, maxX));
        top = Math.min(Math.max(0, top), Math.max(0, maxY));

        modal.style.left = `${left}px`;
        modal.style.top = `${top}px`;
        modal.style.transform = 'none';
    });

    window.addEventListener('pointerup', () => {
        isDragging = false;
    });

    window.addEventListener('pointercancel', () => {
        isDragging = false;
    });
}

window.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        const profile = getProfile();
        if (!profile || (Number(profile.id) !== 1 && String(profile.id) !== '1')) return;
        const modal = document.getElementById('adminModal');
        if (modal) {
            if (modal.classList.contains('show')) {
                closeAdminModal();
            } else {
                openAdminModal();
            }
        }
    }

    if (event.key === 'Escape') {
        closeAdminModal();
    }
});

initAdminDrag();

async function adminSearchUser() {
    const userId = parseInt(document.getElementById('adminSearchUserId').value);
    
    if (!userId || userId < 1) {
        alert('Digite um ID de usuário válido');
        return;
    }
    
    try {
        // Buscar usuário por ID sequencial
        const querySnap = await db.collection('profiles')
            .where('id', '==', userId)
            .get();
        
        if (querySnap.empty) {
            alert('Usuário não encontrado');
            document.getElementById('adminUserInfo').style.display = 'none';
            return;
        }
        
        const userDoc = querySnap.docs[0];
        const userData = userDoc.data();
        
        // Preencher informações
        document.getElementById('adminUserId').textContent = userData.id;
        document.getElementById('adminUserName').textContent = userData.name || 'N/A';
        document.getElementById('adminUserEmail').textContent = userData.email || 'N/A';
        document.getElementById('adminUserLevel').textContent = userData.level || 1;
        document.getElementById('adminUserXp').textContent = userData.xp || 0;
        document.getElementById('adminUserRank').textContent = userData.rank || 'Bronze I';
        document.getElementById('adminUserStatus').textContent = userData.banned ? '🚫 BANIDO' : '✅ Ativo';
        
        // Guardar referência do usuário
        window.adminSelectedUser = { ...userData, firebaseUid: userDoc.id };
        
        document.getElementById('adminUserInfo').style.display = 'block';
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        alert('Erro ao buscar usuário');
    }
}

async function adminGiveXp() {
    if (!window.adminSelectedUser) {
        alert('Busque um usuário primeiro');
        return;
    }
    
    const xpAmount = parseInt(document.getElementById('adminXpAmount').value);
    if (!xpAmount || xpAmount < 0) {
        alert('Digite uma quantidade válida de XP');
        return;
    }
    
    try {
        const newXp = (window.adminSelectedUser.xp || 0) + xpAmount;
        
        await db.collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({
            xp: newXp,
            updatedAt: new Date()
        });

        if (currentUser && window.adminSelectedUser.firebaseUid === currentUser.uid) {
            const activeProfile = getProfile();
            if (activeProfile) {
                const refreshed = { ...activeProfile, xp: newXp, lastXpAt: Date.now() };
                saveProfile(refreshed);
                showProfile();
            }
        }
        
        console.log(`✅ ${xpAmount} XP adicionado ao usuário ${window.adminSelectedUser.id}`);
        document.getElementById('adminUserXp').textContent = newXp;
        window.adminSelectedUser.xp = newXp;
        document.getElementById('adminXpAmount').value = '';
        alert(`✅ ${xpAmount} XP adicionado com sucesso!`);
    } catch (error) {
        console.error('Erro ao dar XP:', error);
        alert('Erro ao dar XP');
    }
}

async function adminSetLevel() {
    if (!window.adminSelectedUser) {
        alert('Busque um usuário primeiro');
        return;
    }
    
    const newLevel = parseInt(document.getElementById('adminLevelAmount').value);
    if (!newLevel || newLevel < 1) {
        alert('Digite um level válido');
        return;
    }
    
    try {
        await db.collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({
            level: newLevel,
            updatedAt: new Date()
        });

        if (currentUser && window.adminSelectedUser.firebaseUid === currentUser.uid) {
            const activeProfile = getProfile();
            if (activeProfile) {
                const refreshed = { ...activeProfile, level: newLevel };
                saveProfile(refreshed);
                showProfile();
            }
        }
        
        console.log(`✅ Level alterado para ${newLevel} no usuário ${window.adminSelectedUser.id}`);
        document.getElementById('adminUserLevel').textContent = newLevel;
        window.adminSelectedUser.level = newLevel;
        document.getElementById('adminLevelAmount').value = '';
        alert(`✅ Level alterado para ${newLevel} com sucesso!`);
    } catch (error) {
        console.error('Erro ao alterar level:', error);
        alert('Erro ao alterar level');
    }
}

async function adminSetRank() {
    if (!window.adminSelectedUser) {
        alert('Busque um usuário primeiro');
        return;
    }
    
    const newRank = document.getElementById('adminRankSelect').value;
    if (!newRank) {
        alert('Selecione um rank');
        return;
    }
    
    try {
        await db.collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({
            rank: newRank,
            updatedAt: new Date()
        });

        if (currentUser && window.adminSelectedUser.firebaseUid === currentUser.uid) {
            const activeProfile = getProfile();
            if (activeProfile) {
                const refreshed = { ...activeProfile, rank: newRank };
                saveProfile(refreshed);
                showProfile();
            }
        }
        
        console.log(`✅ Rank alterado para ${newRank} no usuário ${window.adminSelectedUser.id}`);
        document.getElementById('adminUserRank').textContent = newRank;
        window.adminSelectedUser.rank = newRank;
        document.getElementById('adminRankSelect').value = '';
        alert(`✅ Rank alterado para ${newRank} com sucesso!`);
    } catch (error) {
        console.error('Erro ao alterar rank:', error);
        alert('Erro ao alterar rank');
    }
}

async function adminGiveAdminRole() {
    if (!window.adminSelectedUser) {
        alert('Busque um usuário primeiro');
        return;
    }
    
    if (confirm(`Dar admin para o usuário ${window.adminSelectedUser.name} (ID: ${window.adminSelectedUser.id})?`)) {
        try {
            await db.collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({
                isAdmin: true,
                updatedAt: new Date()
            });
            
            console.log(`✅ Admin concedido ao usuário ${window.adminSelectedUser.id}`);
            alert(`✅ Admin concedido ao usuário ${window.adminSelectedUser.name}!`);
        } catch (error) {
            console.error('Erro ao dar admin:', error);
            alert('Erro ao dar admin');
        }
    }
}

async function adminBanUser() {
    if (!window.adminSelectedUser) {
        alert('Busque um usuário primeiro');
        return;
    }
    
    if (confirm(`⚠️ BANIR o usuário ${window.adminSelectedUser.name} (ID: ${window.adminSelectedUser.id})? Esta ação é irreversível!`)) {
        try {
            await db.collection('profiles').doc(window.adminSelectedUser.firebaseUid).update({
                banned: true,
                bannedAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log(`🚫 Usuário ${window.adminSelectedUser.id} foi banido`);
            document.getElementById('adminUserStatus').textContent = '🚫 BANIDO';
            window.adminSelectedUser.banned = true;
            alert(`🚫 Usuário ${window.adminSelectedUser.name} foi banido!`);
        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            alert('Erro ao banir usuário');
        }
    }
}

async function adminAddGlobalGame() {
    const gameName = document.getElementById('adminGameName').value.trim();
    const gameUrl = document.getElementById('adminGameUrl').value.trim();
    const gameImage = document.getElementById('adminGameImage').value.trim();
    const gameDescription = document.getElementById('adminGameDescription').value.trim();
    
    if (!gameName || !gameUrl) {
        alert('Preenchha os campos obrigatórios (nome e link)');
        return;
    }
    
    try {
        const newGame = {
            id: Date.now(),
            name: gameName,
            url: gameUrl,
            image: gameImage || 'https://via.placeholder.com/200x280?text=Sem+Imagem',
            description: gameDescription,
            category: document.getElementById('adminGameCategory')?.value || '',
            isGlobal: true,
            createdBy: 1,
            createdAt: new Date()
        };
        
        await db.collection('globalGames').doc(newGame.id.toString()).set(newGame);
        
        console.log(`✅ Jogo global adicionado: ${gameName}`);
        
        // Limpar campos
        document.getElementById('adminGameName').value = '';
        document.getElementById('adminGameUrl').value = '';
        document.getElementById('adminGameImage').value = '';
        document.getElementById('adminGameDescription').value = '';
        
        // Recarregar lista
        adminLoadGlobalGames();
        alert(`✅ Jogo "${gameName}" adicionado globalmente!`);
    } catch (error) {
        console.error('Erro ao adicionar jogo:', error);
        alert('Erro ao adicionar jogo');
    }
}

async function adminDeleteGlobalGame(gameId) {
    if (confirm('Deletar este jogo? Todos os usuários perderão acesso!')) {
        try {
            await db.collection('globalGames').doc(gameId).delete();
            console.log(`🗑️ Jogo global deletado: ${gameId}`);
            adminLoadGlobalGames();
            alert('Jogo deletado com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar jogo:', error);
            alert('Erro ao deletar jogo');
        }
    }
}

async function adminLoadGlobalGames() {
    try {
        const querySnap = await db.collection('globalGames').get();
        const gamesList = document.getElementById('adminGlobalGamesList');
        gamesList.innerHTML = '';
        
        if (querySnap.empty) {
            gamesList.innerHTML = '<p style="color: rgba(255,255,255,0.5); grid-column: 1/-1; text-align: center;">Nenhum jogo global adicionado ainda</p>';
            return;
        }
        
        querySnap.forEach(doc => {
            const game = doc.data();
            const gameItem = document.createElement('div');
            gameItem.className = 'admin-game-item';
            gameItem.innerHTML = `
                <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/150x200'">
                <div class="admin-game-item-name">${game.name}</div>
                <button class="admin-game-item-delete" onclick="adminDeleteGlobalGame('${doc.id}')">🗑️ Deletar</button>
            `;
            gamesList.appendChild(gameItem);
        });
    } catch (error) {
        console.error('Erro ao carregar jogos globais:', error);
    }
}

async function syncGamesFromCloud() {
    if (!db || !currentUser) return [];
    
    try {
        const userId = currentUser.uid;
        const docSnap = await db.collection('games').doc(userId).get();
        
        if (docSnap.exists) {
            return docSnap.data().games || [];
        }
    } catch (error) {
        console.error('Error loading games from cloud:', error);
    }
    
    return [];
}

// Email functions removed - using Google-only authentication
