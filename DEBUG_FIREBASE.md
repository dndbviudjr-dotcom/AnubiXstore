# 🔍 Debugando "Firebase não está configurado"

## Passo 1: Abrir Console do Navegador

1. Abra seu app: http://127.0.0.1:5500
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Clique na aba **"Console"**

Você verá mensagens coloridas. Procure por:

```
🔥 Firebase Config loaded
Firebase object available: true
Initializing Firebase with config...
```

---

## Passo 2: Analise as Mensagens

### **Cenário A: Vê "Firebase object available: true"**

Significa que o Firebase SDK foi carregado. Procure por:

```
✅ Firebase initialized successfully!
Auth: function
Firestore: object
```

**Ótimo!** Firebase está funcionando. Se ainda assim não consegue fazer login, vá para **Passo 3**.

### **Cenário B: Vê "Firebase object available: false"**

Significa que o Firebase SDK **não carregou**. 

Possíveis causas:
- ❌ Problema de internet
- ❌ CDN do Firebase está inativo
- ❌ Bloqueador de scripts

**Solução:**
1. Recarregue a página: **F5**
2. Aguarde carregar
3. Verifique novamente o console

### **Cenário C: Vê erro de inicialização**

Procure por:
```
❌ Firebase initialization error:
Error message: ...
Error code: ...
```

Procure o erro específico abaixo.

---

## Passo 3: Testar o Login

1. No console, procure por: `🔵 loginWithGoogle called`
2. Veja as linhas seguintes para descobrir onde falha

### **Se vê: "auth object: null"**

Significa Firebase **não inicializou**. Volte ao **Passo 2**.

### **Se vê: "firebase object: undefined"**

Significa Firebase SDK **não carregou**. Tente:
1. Recarregue a página (F5)
2. Aguarde ~5 segundos
3. Clique no botão Google novamente

### **Se vê: "Creating Google provider..." então erro**

O Firebase inicializou mas o Google Auth pode não estar configurado. Verifique:

1. Vá para: https://console.firebase.google.com/project/anubixstore-120ea/authentication
2. Clique em **"Sign-in method"**
3. Verifique se o **Google está ativado** (azul)
4. Se não estiver, clique e ative

---

## Erros Comuns

### **"auth/operation-not-supported-in-this-environment"**

Significa que o Firebase está tentando usar localStorage, mas está desabilitado.

**Solução:**
- O app precisa estar em HTTPS ou localhost para funcionar (já está ✅)

### **"auth/popup-blocked-by-browser"**

O navegador bloqueou o popup do Google.

**Solução:**
1. Desbloqueie popups para http://127.0.0.1:5500
2. Tente novamente

### **"auth/invalid-api-key"**

Significa que a chave API no `firebase-config.js` é inválida.

**Solução:**
1. Verifique se a chave começa com `AIzaSy...`
2. Copie novamente de: https://console.firebase.google.com/project/anubixstore-120ea/settings/general

---

## Checklist de Configuração Firebase

Verifique cada item em: https://console.firebase.google.com/project/anubixstore-120ea

| Item | Status | Link |
|------|--------|------|
| ✅ Firestore Database criado | ⬜ | [Firestore](https://console.firebase.google.com/project/anubixstore-120ea/firestore) |
| ✅ Google Auth ativado | ⬜ | [Auth](https://console.firebase.google.com/project/anubixstore-120ea/authentication) |
| ✅ Domínios autorizados | ⬜ | [Domains](https://console.firebase.google.com/project/anubixstore-120ea/authentication/settings) |

---

## 📝 Colar Logs do Console Aqui

Se nenhuma solução funcionar:

1. Abra o console (F12)
2. Copie TODA a mensagem de erro
3. Compartilhe comigo

Vou poder identificar o problema com precisão! 🎯

---

## 🚀 Se Tudo Funcionar

Você verá no console:
```
✅ Firebase initialized successfully!
🔵 loginWithGoogle called
Creating Google provider...
Attempting signInWithPopup...
✅ Login successful: seu@email.com
```

E depois entrará no app! 🎮
