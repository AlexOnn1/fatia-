# 🍕 Fatia$ — Rodízio de Prejuízo

Descubra se você saiu no lucro ou no prejuízo no rodízio de pizza.

## Como funciona

1. Informe o valor que você pagou no rodízio
2. Use **−** e **+** para contar as fatias que comeu
3. O app calcula em tempo real:
   - **Por fatia** — custo médio de cada fatia para você
   - **Consumido** — quanto essas fatias valem no mercado
   - **Lucro / Prejuízo** — diferença entre o consumido e o pago
   - **Barra de progresso** — quantas fatias faltam para empatar

## Base de comparação

**R$ 8,50 por fatia** — referência mercado BR 2026.  
Cálculo: pizza média ~R$ 68 / 8 fatias (fonte: CNN Brasil / VR, 2024–2025).

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** para build
- **CSS Modules** — zero dependência de UI externa
- Mobile-first, dark mode nativo

## Como rodar

```bash
npm install
npm run dev
```

## Build produção

```bash
npm run build
npm run preview
```
