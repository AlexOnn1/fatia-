# 🍕 Fatia$ — Rodízio de Prejuízo & Modo Competição 🏆

Descubra se você saiu no lucro ou no prejuízo no rodízio de pizza — e agora dispute ao vivo com seus amigos para ver quem come mais!

---

## 🚀 Modos de Jogo

### 1. 🍕 Modo Solo (Calculadora Rápida)
1. Informe o valor que você pagou no rodízio.
2. Use **−** e **+** (ou digite) para contar as fatias que comeu.
3. O app calcula em tempo real:
   - **Por fatia** — custo médio de cada fatia para você
   - **Consumido** — quanto essas fatias valem no mercado
   - **Lucro / Prejuízo** — diferença entre o consumido e o pago
   - **Barra de progresso** — quantas fatias faltam para empatar

### 2. 🏆 Modo Galera (Salas Online & Competição ao Vivo)
1. **Crie uma Sala** da sua mesa (ex: "Rodízio da Sexta", R$ 69,90) e escolha seu avatar.
2. **Convide seus amigos** compartilhando o código de 5 caracteres ou o link direto (`?sala=CODIGO`).
3. Conforme cada um come, aperta **+** no próprio celular.
4. **Placar da Mesa ao Vivo**:
   - Ranking atualizado em tempo real com medalhas (🥇, 🥈, 🥉).
   - Feed de atividades e marcos (ex: *"Alex bateu 10 fatias! O gerente tá suando frio!"*).
   - Estatísticas coletivas: fatias totais da mesa, média por pessoa e rombo coletivo na pizzaria.
5. **Finalizar Rodízio & Pódio**:
   - Pódio com chuva de confetes 🎉
   - Premiações cômicas: *Rei do Rodízio*, *Mão de Vaca de Ouro*, *Patrocinador da Pizzaria* e *Barriga de Concreto*.
   - Botão para **Compartilhar Resumo no WhatsApp**.

---

## 🍕 Base de Comparação

**R$ 8,50 por fatia** — referência de mercado BR 2026.  
Cálculo: pizza média ~R$ 68 / 8 fatias (fonte: CNN Brasil / VR, 2024–2025).

---

## ⚙️ Configuração do Tempo Real (Firebase)

O app conta com suporte nativo ao **Firebase Realtime Database** para sincronizar celulares na mesa de forma 100% serverless e gratuita.

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative o **Realtime Database**.
2. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
3. Preencha as chaves:
   ```env
   VITE_FIREBASE_API_KEY=sua-api-key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

> 💡 **Modo Local / Sem Firebase**: Se você não configurar o `.env`, o aplicativo funciona automaticamente no modo local com sincronização multi-aba via `BroadcastChannel` e `localStorage`, ideal para testar no mesmo computador.

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Firebase Realtime Database**
- **Canvas-Confetti**
- **CSS Modules** — mobile-first, dark/pizzaria theme
- **Zero frameworks pesados de UI**

---

## 🏃 Como Rodar

```bash
npm install
npm run dev
```

## 📦 Build para Produção

```bash
npm run build
npm run preview
```
