# ✅ Checklist de Configuração Firebase

## 🔐 Seu Projeto: **anubixstore-120ea**

Suas credenciais foram configuradas em `firebase-config.js`.

---

## ✅ Checklist - Verificar no Firebase Console

### **1. Firestore Database**

1. Vá para: https://console.firebase.google.com/project/anubixstore-120ea/firestore
2. Clique em **"Criar banco de dados"**
3. Escolha:
   - Localização: **us-central1** (padrão)
   - Modo: **Modo de produção** ✅ (você já escolheu)
4. Clique em **"Criar"**

Aguarde ~1 minuto para criar...

---

### **2. Regras de Segurança do Firestore**

Depois que Firestore for criado, vá para **Regras** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /games/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Clique em **"Publicar"**.

---

### **3. Google Authentication**

1. Vá para: https://console.firebase.google.com/project/anubixstore-120ea/authentication
2. Clique na aba **"Sign-in method"** / **"Método de login"**
3. Clique no ícone do **Google**
4. Ative o switch (se não estiver ativado)
5. Digite um email de suporte
6. Clique em **"Salvar"**

Se vir um aviso em amarelo sobre URL de redirecionamento, ignore por enquanto (funciona localmente).

---

### **4. Autorizar Domínios (Importante!)**

Na seção **"Authentication"** → **"Configurações"**:

1. Procure por **"Domínios autorizados"**
2. Clique em **"Adicionar domínio"**
3. Para desenvolvi**mento local, adicione:
   - `localhost`
   - `127.0.0.1`

Para produção, adicione seu domínio real depois.

---

## 🧪 Testar o App

1. **Recarregue** o navegador: `F5`
2. Você deve ver a **tela de login** com:
   - Fundo de vídeo
   - Modal transparente
   - Botão "Entrar com Google"
3. Clique em **"Entrar com Google"**
4. Faça login com sua conta Google
5. ✅ Você deve entrar no app!

---

## 🐛 Se Algo Não Funcionar

### **Erro: "Firebase not initialized"**
- ✓ Firestore Database não foi criado
- ✓ Vá para https://console.firebase.google.com/project/anubixstore-120ea/firestore
- ✓ Crie o banco de dados

### **Erro: "Sign-in method disabled"**
- ✓ Google Auth não foi habilitada
- ✓ Vá para Autenticação → Sign-in method
- ✓ Clique no Google e ative

### **Erro: "CORS" ou "domínio não autorizado"**
- ✓ Adicione `localhost` e `127.0.0.1` em Autorizar domínios
- ✓ Aguarde ~1 minuto para sincronizar

### **Console mostra erro específico**
- ✓ Abra F12 → Console
- ✓ Leia a mensagem de erro
- ✓ Procure a solução no [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

---

## 📊 Estrutura de Dados que Será Criada

Na primeira vez que você faz login com Google:

```
Firestore:
└── profiles/
    └── {seu-user-id}
        ├── name: "Seu Nome Google"
        ├── email: "seu@email.com"
        ├── avatar: "https://seu-avatar-google.jpg"
        ├── rank: "Bronze I"
        ├── xp: 0
        ├── createdAt: timestamp
        └── ... (outros campos)
```

---

## ✨ Status: PRONTO PARA TESTAR!

```
✅ firebase-config.js - Configurado
✅ Google OAuth - Pronto
⏳ Firestore - Aguardando sua criação
```

**Próximo passo**: Crie o Firestore Database e teste! 🚀

---

## 📞 Resumo do Que Fazer

| Item | Status | Link |
|------|--------|------|
| Firestore Database | ⏳ TODO | [Criar](https://console.firebase.google.com/project/anubixstore-120ea/firestore) |
| Regras Firestore | ⏳ TODO | [Editar](https://console.firebase.google.com/project/anubixstore-120ea/firestore/rules) |
| Google Auth | ⏳ TODO | [Habilitar](https://console.firebase.google.com/project/anubixstore-120ea/authentication/providers) |
| Domínios Autorizados | ⏳ TODO | [Adicionar](https://console.firebase.google.com/project/anubixstore-120ea/authentication/settings) |
| Teste no App | ⏳ TODO | http://127.0.0.1:5500 |

---

**Quando terminar, recarregue o app (F5) e clique em "Entrar com Google"!** 🎮
