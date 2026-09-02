# 🔐 Configurar Firebase para Login com Google

## Passo 1: Criar um Projeto Firebase

1. Vá para **https://console.firebase.google.com**
2. Clique em **"Criar projeto"**
3. Digite um nome (ex: "AnubiXStore")
4. Prossiga com os passos (você pode desabilitar Google Analytics)

## Passo 2: Habilitar Google Sign-In

1. No painel do Firebase, clique em **"Autenticação"** (esquerda)
2. Vá para a aba **"Sign-in method"** / **"Método de login"**
3. Clique em **Google** e ative-o
4. Digite um email de suporte
5. Clique em **Salvar**

## Passo 3: Criar Banco de Dados Firestore

1. Clique em **"Firestore Database"** (esquerda)
2. Clique em **"Criar banco de dados"**
3. Selecione a localização (deixe padrão: `us-central1`)
4. **IMPORTANTE**: Escolha **"Modo de teste"** por enquanto
   - Depois você configura regras de segurança

## Passo 4: Obter suas Credenciais

1. Clique no ícone de engrenagem (⚙️) no canto superior direito
2. Selecione **"Configurações do projeto"**
3. Clique na aba **"Geral"**
4. Role até achar a seção **"Seus aplicativos"**
5. Clique em **"</>" (Web)** se ainda não existe
6. **Copie o objeto `firebaseConfig`** que aparece:

```javascript
const firebaseConfig = {
    apiKey: "xxxxx...",
    authDomain: "xxxxx.firebaseapp.com",
    projectId: "xxxxx",
    storageBucket: "xxxxx.appspot.com",
    messagingSenderId: "xxxxx",
    appId: "xxxxx"
};
```

## Passo 5: Adicionar Credenciais ao App

1. Abra o arquivo **`firebase-config.js`** no seu projeto
2. **Substitua** a seção `firebaseConfig` com seus dados reais
3. Salve o arquivo

**Antes:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    // ...
};
```

**Depois:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyD...",
    authDomain: "anubiXstore.firebaseapp.com",
    // ... (seus dados reais)
};
```

## Passo 6: Testar Login

1. Atualize o navegador (F5)
2. Você verá um botão **"Login com Google"** no topo
3. Clique nele
4. Faça login com sua conta Google
5. Seu perfil agora será **sincronizado automaticamente** com a nuvem!

## ✅ Pronto!

Agora quando você:
- ✏️ **Editar seu perfil** → dados salvos no Firestore
- 🔄 **Fazer login em outro dispositivo** → perfil carregado automaticamente
- 👤 **Sair/Entrar** → sincronização funciona perfeitamente

## 🔒 Regras de Segurança do Firestore (Opcional - mas recomendado)

Depois de testar em "Modo de Teste", você deve configurar regras de segurança.

Vá para **Firestore Database → Regras** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada usuário só pode ler/escrever seu próprio perfil
    match /profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /games/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Clique em **"Publicar"** para aplicar.

## 🆘 Troubleshooting

**Problema**: Botão de login não aparece
- ✓ Verifique se `firebase-config.js` está com credenciais reais
- ✓ Verifique no console do navegador (F12) por erros

**Problema**: Login funciona mas perfil não sincroniza
- ✓ Verifique se Firestore Database foi criado
- ✓ Verifique se autenticação Google está ativada
- ✓ Abra F12 → Console para ver mensagens de erro

**Problema**: Mensagem "Firebase not configured"
- ✓ Você ainda não preencheu `firebaseConfig` com dados reais
- ✓ O app funcionará com localStorage, mas sem nuvem

---

**Precisa de ajuda?** Mensagens aparecem no console (F12 → Console)
