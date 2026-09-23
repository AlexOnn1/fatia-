# 🍕 Guia Comercial & Técnico White-Label: Fatia$ B2B 🏢

Este guia foi elaborado para você transformar o projeto **Fatia$** em uma fonte de receita recorrente ou venda direta para **pizzarias, rodízios japoneses, churrascarias, hamburguerias e restaurantes**.

---

## 💡 1. Por Que Restaurantes Compram Essa Solução?

Quando você aborda o dono ou gerente de um restaurante, você **não está vendendo apenas um software**, você está vendendo **marketing viral, experiência do cliente e aumento de faturamento**:

1. **Zero Atrito (Sem Download de App)**:
   - O cliente não precisa baixar nada na Google Play ou App Store. Basta ler o QR Code no display de acrílico da mesa e jogar direto no navegador do celular.
2. **Experiência Social & Gamificação na Mesa**:
   - Amigos, famílias e confraternizações de empresas passam mais tempo se divertindo, disputando quem come mais, comemorando reviravoltas e rindo das premiações cômicas.
3. **Marketing Orgânico Gratuito (WhatsApp & Instagram)**:
   - Ao final do rodízio, os participantes clicam em **Compartilhar no WhatsApp**. As duas imagens geradas em alta resolução (pódio e ranking) levam a **marca, logotipo e link do restaurante**, viralizando nos grupos de amigos e redes sociais.
4. **Percepção de Valor**:
   - O cliente sente que o restaurante oferece um diferencial moderno e divertido que a concorrência não tem.

---

## ⚡ 2. Como Adaptar o Projeto para um Novo Cliente em 5 Minutos

Toda a personalização de marca, cores, produtos e regras de negócio está centralizada em um único arquivo:
👉 [`src/config/tenantConfig.ts`](file:///c:/Users/Usuario/Documents/Projetos/Fatia$/fatia-/src/config/tenantConfig.ts)

### Passo a Passo:

### 1️⃣ Crie ou Edite a Configuração do Cliente
Abra o arquivo [`src/config/tenantConfig.ts`](file:///c:/Users/Usuario/Documents/Projetos/Fatia$/fatia-/src/config/tenantConfig.ts) e adicione o objeto da empresa:

```typescript
export const minhaPizzaria: TenantConfig = {
  id: 'forno-nobre',
  appName: 'Pizzaria Forno Nobre',
  slug: 'forno_nobre',
  tagline: '★ Rodízio Artesanal & Competição ★',
  slogan: 'A melhor pizza no forno a lenha da cidade!',
  establishmentType: 'pizzaria',
  appUrl: 'https://rodizio.fornonobre.com.br/',
  logoEmoji: '🍕',
  logoImageUrl: 'https://fornonobre.com.br/logo.png', // opcional: URL do logo PNG/SVG

  // Cores da marca (o sistema injeta essas cores no CSS automaticamente!)
  theme: {
    primary: '#B71C1C',      // Cor primária do restaurante
    primaryDark: '#7F0000',  // Tom escuro da primária
    secondary: '#E65100',    // Cor de destaque/secundária
    accent: '#FFD54F',       // Dourado/amarelo de troféus
    bg: '#FAF3E0',           // Fundo da aplicação
    surface: '#FFFFFF',      // Fundo dos cards
    surfaceAlt: '#F5EBE1',   // Variação de card
    dark: '#212121',         // Cor de textos principais
    darkMid: '#616161',      // Cor de subtítulos
  },

  // Definição do item consumido no rodízio
  item: {
    singular: 'fatia',
    plural: 'fatias',
    unitGender: 'a', // 'a' para fatia devorada, 'o' para corte devorado
    emoji: '🍕',
    defaultReferencePrice: 9.50, // Preço médio da fatia avulsa no cardápio
    referenceNote: 'Ref.: fatia avulsa a R$ 9,50 no cardápio tradicional',
    defaultRodizioPrice: 79.90,  // Preço padrão do rodízio por pessoa
  },

  // Rodapé e Redes Sociais do Restaurante
  footer: {
    quote: '"Tradição e fartura na sua mesa."',
    establishmentName: 'Pizzaria Forno Nobre',
    showDevCredits: false, // true = exibe 'Alexsander Albino' / false = 100% marca própria do cliente
    socialLinks: [
      { type: 'instagram', url: 'https://instagram.com/fornonobre', label: 'Instagram' },
      { type: 'whatsapp', url: 'https://wa.me/5511999999999', label: 'Reservas WhatsApp' },
      { type: 'maps', url: 'https://maps.google.com/?q=fornonobre', label: 'Onde Estamos' },
    ],
  },
}
```

### 2️⃣ Cadastre no Registro de Marcas
No final de `src/config/tenantConfig.ts`, adicione seu novo cliente no `TENANT_REGISTRY`:

```typescript
export const TENANT_REGISTRY: Record<string, TenantConfig> = {
  fatia: fatiaDefault,
  'forno-nobre': minhaPizzaria,
  // ... outros clientes
}
```

### 3️⃣ Ative a Marca no Deploy
Você pode ativar a marca de 3 formas fáceis:
- **Opção A (Variável de Ambiente na Vercel - Recomendada para Produção)**:
  Configure na Vercel a variável de ambiente:
  ```env
  VITE_TENANT_ID=forno-nobre
  ```
- **Opção B (Via URL para Apresentações / Demonstrações Comerciais)**:
  Abra no celular do cliente adicionando `?tenant=forno-nobre`:
  `https://seu-app.vercel.app/?tenant=forno-nobre`
- **Opção C (Fixar como padrão no código)**:
  Basta definir `return minhaPizzaria` na função `getActiveTenant()`.

---

## 🎨 3. Presets Prontos Inclusos no Código

O projeto já vem com **5 modelos completos prontos para uso**:

| Preset | ID (`?tenant=...`) | Ramo | Item Contado | Emoji |
| :--- | :--- | :--- | :--- | :--- |
| **Fatia$ Original** | `fatia` | Pizzaria Tradicional | Fatias | 🍕 |
| **Bella Napoli** | `bella-napoli` | Pizzaria Artesanal / Italiana | Fatias | 🍕 |
| **Sushi Master** | `sushi` | Rodízio Japonês / Temakeria | Peças | 🍣 |
| **Fogo Campeiro** | `churrascaria` | Churrascaria de Espeto Corrido | Cortes | 🥩 |
| **Burger Fest** | `burger` | Rodízio de Mini-Burgers | Burgers | 🍔 |

> **Dica Pro**: Abra `https://fatias.vercel.app/?tenant=sushi` em uma reunião com um dono de restaurante japonês e veja os olhos dele brilharem ao ver o app todo preto/salmão contando "peças de sushi devoradas" e elegendo o "Deus do Salmão"!

---

## 💰 4. Estratégia Comercial & Modelo de Precificação

### Modelo 1: Setup + Mensalidade Recorrente (SaaS B2B) — **Recomendado**
- **Taxa de Implantação (Setup Único)**: **R$ 600 a R$ 1.500**
  - O que inclui: Personalização das cores da marca, inclusão de logo, cardápio, links sociais e entrega de 20 a 50 artes de QR Code para imprimir nas mesas.
- **Mensalidade de Manutenção & Hospedagem**: **R$ 120 a R$ 250 / mês**
  - O que inclui: Servidor Firebase em nuvem rodando 24/7 em tempo real, suporte técnico e ajustes de cardápio quando o restaurante mudar o preço.
- **Potencial de Lucro**: Com apenas **10 restaurantes clientes**, você garante uma renda passiva de **R$ 1.500 a R$ 2.500 todo mês**!

### Modelo 2: Venda de Licença Única (Whitelabel Definitivo)
- **Valor da Licença**: **R$ 2.500 a R$ 4.500**
  - O que inclui: Instalação no domínio próprio da pizzaria (`rodizio.pizzariacliente.com.br`) e entrega do sistema funcionando.

---

## 📲 5. Totem / Display de Acrílico para as Mesas

O segredo para os clientes usarem o app em massa no restaurante é colocar um **display de acrílico formato T ou L (tamanho A6 ou 10x15cm)** em cada mesa:

```text
┌──────────────────────────────────────────────┐
│                  [LOGO DA PIZZARIA]          │
│                                              │
│        🍕 DISPUTE QUEM COME MAIS! 🏆         │
│                                              │
│     1. Aponte a câmera do seu celular        │
│     2. Crie a sala da sua mesa               │
│     3. Compartilhe o link com a galera       │
│                                              │
│                 ┌──────────┐                 │
│                 │ [QR CODE]│                 │
│                 └──────────┘                 │
│                                              │
│      ★ No final, veja o pódio dos campeões   │
│         e compartilhe no WhatsApp!     ★     │
└──────────────────────────────────────────────┘
```

---

## 🚀 6. Deploy na Vercel com Subdomínio do Cliente

1. Crie um projeto na **Vercel** apontando para o seu repositório Git.
2. Na aba **Settings > Environment Variables**, adicione:
   ```env
   VITE_TENANT_ID=id_do_cliente
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_DATABASE_URL=...
   ```
3. Na aba **Settings > Domains**, adicione o domínio do cliente (ex: `rodizio.bellanapoli.com.br`).
4. Peça para o responsável técnico do cliente criar uma entrada DNS do tipo `CNAME`:
   - Host: `rodizio`
   - Destino: `cname.vercel-dns.com`
5. Pronto! O sistema fica no ar com certificado SSL automático (HTTPS), rápido e 100% responsivo para todos os celulares.
