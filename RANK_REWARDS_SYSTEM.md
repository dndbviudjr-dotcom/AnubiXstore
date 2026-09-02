# 🎁 Sistema de Recompensas por Rank

## Visão Geral
Sistema automático que desbloqueia molduras exclusivas quando o usuário atinge certos ranks.

## 📋 Molduras Desbloqueadas por Rank

| Rank | Moldura | Arquivo |
|------|---------|---------|
| Bronze III | 🥉 Bronze III | `moldura/moldura9.png` |
| Prata I | 💎 Prata I | `moldura/moldura28.png` |
| Prata III | 💎 Prata III | `moldura/moldura47.png` |
| Ouro II | 🏆 Ouro II | `moldura/moldura3.png` |
| Ouro III | 🏆 Ouro III | `moldura/moldura31.png` |
| Lenda II | ⭐ Lenda II | `moldura/moldura14.png` |
| Lenda III | ⭐ Lenda III | `moldura/moldura40.png` |
| Ultra I | 🔥 Ultra I | `moldura/moldura27.png` |
| Ultra II | 🔥 Ultra II | `moldura/moldura13.png` |
| Admin | 👑 Admin | `moldura/moldura24.png` |

## 🔧 Como Funciona

### Desbloqueio Automático
- Quando o usuário carrega seu perfil, o sistema verifica automaticamente seu rank
- Se o rank foi aumentado, as molduras associadas são desbloqueadas automaticamente
- As molduras desbloqueadas são armazenadas no campo `unlockedFrames` do perfil

### Exibição de Molduras
- O menu de seleção de molduras mostra **apenas as molduras desbloqueadas**
- Usuários antigos sem molduras desbloqueadas verão todas as molduras (compatibilidade)
- Quando um novo rank é atingido, as molduras aparecem automaticamente no menu

### Progressão de Ranks
As molduras são desbloqueadas progressivamente:
- **Bronze III** → 1ª moldura
- **Prata I** → 2ª moldura
- **Prata III** → 3ª moldura
- **Ouro II** → 4ª moldura
- **Ouro III** → 5ª moldura
- **Lenda II** → 6ª moldura
- **Lenda III** → 7ª moldura
- **Ultra I** → 8ª moldura
- **Ultra II** → 9ª moldura
- **Admin** → 10ª moldura (exclusiva)

## 📝 Adições Técnicas

### Constantes
```javascript
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
```

### Funções Principais

#### `getUnlockedFramesForRank(rankName)`
- **Entrada:** Nome do rank do usuário
- **Retorno:** Array com as molduras desbloqueadas para esse rank
- **Uso:** Determina quais molduras o usuário pode usar

#### `checkAndUnlockRankRewards(profile)`
- **Entrada:** Objeto do perfil do usuário
- **Retorno:** Perfil atualizado com `unlockedFrames` preenchido
- **Uso:** Chamada automaticamente ao salvar/carregar o perfil

### Integração com o Perfil
A função `checkAndUnlockRankRewards()` é chamada em:
1. `saveProfile()` - Ao salvar o perfil
2. `updateProfileUI()` - Ao carregar do Firebase
3. Garante que as molduras sejam desbloqueadas sempre que o rank muda

## 🧪 Testando o Sistema

### Para testar manualmente:
1. Abra o Developer Console (F12)
2. Execute:
```javascript
const profile = getProfile();
profile.rank = 'Ouro III';  // Altere para qualquer rank
saveProfile(profile);
showProfile();
```

3. As molduras desbloqueadas aparecerão no menu de molduras

### Verificar molduras desbloqueadas:
```javascript
const profile = getProfile();
console.log('Molduras desbloqueadas:', profile.unlockedFrames);
```

## 🔄 Compatibilidade
- ✅ Usuários novos: Molduras desbloqueadas automaticamente
- ✅ Usuários antigos: Veem todas as molduras até a primeira vez que o sistema é acionado
- ✅ Mudança de rank: Novas molduras aparecem automaticamente

## 🚀 Adições Futuras
- [ ] Mostrar um toast/notificação quando novo rank é atingido
- [ ] Exibir próximas molduras a desbloquear
- [ ] Badge visual indicando molduras bloqueadas vs desbloqueadas
- [ ] Sistema de códigos para desbloquear molduras adicionais
