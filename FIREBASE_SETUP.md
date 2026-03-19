# 🔥 Configuração do Firebase

## 1. Criar projeto no Firebase Console

1. Acesse https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `terminal-master`)
4. Desative o Google Analytics (opcional) → **Criar projeto**

## 2. Ativar Authentication

1. No menu lateral → **Authentication** → **Começar**
2. Aba **Sign-in method** → habilite:
   - **E-mail/senha**
   - **Google** (adicione seu email como suporte)

## 3. Criar banco Firestore

1. No menu lateral → **Firestore Database** → **Criar banco de dados**
2. Selecione **Modo de produção** → escolha a região → **Ativar**
3. Aba **Regras** → cole as regras abaixo e publique:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Registrar o app Web

1. Na página inicial do projeto → clique no ícone **</>** (Web)
2. Dê um apelido → **Registrar app**
3. Copie o objeto `firebaseConfig` exibido

## 5. Colar as credenciais no jogo

Abra o arquivo `js/firebase.js` e substitua o bloco `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "meu-projeto.firebaseapp.com",
  projectId:         "meu-projeto",
  storageBucket:     "meu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

## 6. Pronto!

Abra o `index.html` num servidor local (ex: Live Server no VS Code) ou faça
deploy no Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

> **Nota**: O jogo funciona com `localStorage` como fallback caso o Firebase
> não esteja configurado ou o usuário esteja offline.
