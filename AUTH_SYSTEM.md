# 🔐 Sistema de Autenticação - Google Only

## Como Funciona

Agora **somente Google Sign-In** para acessar o app:

✅ **Com Firebase Configurado:**
- Tela de login com fundo de vídeo + modal transparente
- Clique em "Entrar com Google"
- Perfil auto-criado na primeira vez
- Perfil sincronizado automaticamente com a nuvem
- Conteúdo do app (Loja, Perfil, etc) fica visível

---

## Design da Tela de Auth

- **Fundo**: Video.mp4 em loop
- **Overlay**: Levemente escuro + blur
- **Modal**: Card transparente no centro
- **Botão**: Grande, com ícone do Google

---

## Fluxo de Login

```
Usuário abre app
    ↓
[Tela de Auth] com vídeo de fundo
    ↓
Clica em "Entrar com Google"
    ↓
Google popup aparece
    ↓
Login → Perfil criado automaticamente
    ↓
[App Content] - Loja, Perfil, etc.
```

---

## Funcionalidades

### **Primeira Vez (Google)**
```
Login com Google
→ Perfil inicial criado automaticamente com:
  - Nome do Google
  - Avatar do Google
  - Rank Bronze I
  - XP 0
→ Tudo salvo no Firestore
```

### **Próximas Vezes**
```
Login com Google
→ Perfil carregado da nuvem
→ Estado 100% sincronizado
```

### **Logout**
```
Clique em "Sair" no topo direito
→ Volta para tela de login
→ Sessão encerrada
```

---

## Estrutura de Dados (Firestore)

Quando faz login com Google, é criado automaticamente:

```
firestore.database/
├── profiles/{userId}
│   ├── name: "Nome do Google"
│   ├── email: "usuario@gmail.com"
│   ├── avatar: "https://google-avatar.jpg"
│   ├── rank: "Bronze I"
│   ├── xp: 0
│   ├── createdAt: timestamp
│   └── ... (outros campos do perfil)
```

---

## Estilo da Tela

```
[Video Background - video.mp4]
[Dark Overlay]
    [
        AnubiXstore
        Sua coleção de jogos
        
        [Botão: 🔵 Entrar com Google]
    ]
```

---

## 🔒 Segurança

- Login via Google (OAuth2)
- Sem armazenar senhas
- Perfil sincronizado com Firestore
- localStorage como backup

---

## 🆘 Troubleshooting

**Problema**: Vídeo não aparece
- ✓ Verifique se `video.mp4` existe na raiz do projeto
- ✓ Recarregue a página (F5)

**Problema**: Botão Google não funciona
- ✓ Firebase não está configurado
- ✓ Verifique se Google Auth está habilitada
- ✓ Console (F12) mostra erro específico

**Problema**: Perfil não sincroniza
- ✓ Verifique se Firestore Database foi criado
- ✓ Console mostra erro de permissões

---

**Tela de auth simplificada e mais bonita!** ✨

