# Universo Capoeira — Push & Background Sync

## Arquivos
- `sw.js` — Service Worker (Background Sync + Web Push)
- `manifest.json` — PWA
- `functions/` — Cloud Functions (notifica equipe em novo check-in)
- `index.html` — app (fila offline, IndexedDB, inscrição push)

## 1. Hospedar em HTTPS
Service Worker e Push **não** funcionam em `file://`.
Use Firebase Hosting, Netlify, etc.

## 2. Background Sync (já no app)
- Check-in offline → fila local + IndexedDB
- Ao voltar a rede (ou evento `sync`) → sobe para o Firestore
- Horário original do aparelho é preservado

## 3. Gerar chaves VAPID
```bash
npx web-push generate-vapid-keys
```
- **Pública** → cola em ADM → "Web Push — chave pública VAPID" → Salvar
- **Privada** → só no servidor (Functions)

## 4. Deploy das Functions
```bash
cd functions
npm install
# configurar VAPID
firebase functions:config:set vapid.public_key="SUA_PUBLICA" vapid.private_key="SUA_PRIVADA" vapid.subject="mailto:seu@email.com"
firebase deploy --only functions
```

Ou use variáveis de ambiente `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

## 5. Ativar no aparelho da equipe
1. Abrir o app (HTTPS)
2. Início → **Ativar Notificações**
3. Entrar como Professor/ADM
4. A inscrição vai para a coleção `pushSubscriptions`

## 6. Testar push
```bash
curl -X POST https://REGION-PROJECT.cloudfunctions.net/testarPush
```

## Limitações
- **iOS**: Background Sync limitado; push em PWA adicionada à tela inicial (iOS 16.4+)
- **Android Chrome**: melhor suporte a Sync + Push
