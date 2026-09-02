# 📋 Onde Pegar seu firebaseConfig

## Passo 1: Ir para Firebase Console

1. Abra: **https://console.firebase.google.com**
2. Clique no seu projeto

---

## Passo 2: Encontrar as Credenciais

### **Via Configurações do Projeto:**

1. Clique no ícone de **⚙️ (Engrenagem)** no topo à esquerda
2. Selecione **"Configurações do projeto"**
3. Você vai ver abas: Geral | Integrações | Segurança

### **Aba Geral → Seus apps**

Você vai ver uma seção assim:

```
┌─────────────────────────────────┐
│ Seus apps                       │
│                                 │
│ 🌐 AnubiXstore (Web)           │
│   [Clique aqui para ver config] │
│                                 │
└─────────────────────────────────┘
```

---

## Passo 3: Copiar o Código

Se não vir o app web listado:

1. Clique em **"</>"** (Web) para criar um novo app web
2. Digite um nome (ex: "AnubiXstore Web")
3. Clique em **"Registrar app"**
4. Na próxima tela, você verá o código:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// ... imports

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD...",              👈 COPIE ISSO
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

---

## Passo 4: Copiar Seu firebaseConfig

O objeto que você precisa é este (em formato JavaScript):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDaBcDeFgHiJkLmNoPqRsT...",
    authDomain: "meu-projeto.firebaseapp.com",
    projectId: "meu-projeto",
    storageBucket: "meu-projeto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi"
};
```

---

## Passo 5: Cole Aqui

Quando tiver copiado, **cole seu `firebaseConfig`** na resposta e vou colocar direto no arquivo!

**Formato esperado:**
```
Só copie o objeto, assim:
{
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    ...
}
```

---

## ✅ Checklist

Antes de colar, confirme:

- ✅ Você está no console.firebase.google.com
- ✅ Está no seu projeto
- ✅ Clicou em ⚙️ → Configurações do projeto
- ✅ Está na aba "Geral"
- ✅ Vê "Seus apps" com um app web
- ✅ Copiou o objeto `firebaseConfig` com os valores reais

---

**Cole o seu firebaseConfig aqui e vou configurar tudo!** 🚀
