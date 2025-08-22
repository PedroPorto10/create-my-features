# C6 Finance - App Financeiro Android

App Android para organizar finanças do C6 Bank com dashboard, tabelas e gráficos de transferências.

## 🚀 Funcionalidades

- **Dashboard Principal**: Visualize as últimas 10 transferências e saldo atual
- **Tabelas Detalhadas**: Veja transferências recebidas e enviadas do mês atual
- **Gráficos Analíticos**: Análise histórica de 4 meses + previsão de 4 meses
- **Design Responsivo**: Interface moderna otimizada para mobile

## 📱 Como usar no Android

### Passo 1: Transferir para GitHub
1. Clique no botão "Export to Github" no Lovable
2. Clone o projeto do seu repositório GitHub

### Passo 2: Configurar ambiente local
```bash
# Instalar dependências
npm install

# Adicionar plataforma Android
npx cap add android

# Atualizar dependências nativas
npx cap update android

# Build do projeto
npm run build

# Sincronizar com Android
npx cap sync
```

### Passo 3: Executar no dispositivo
```bash
# Executar no emulador/dispositivo Android
npx cap run android
```

## 🛠 Tecnologias Utilizadas

- React + TypeScript
- Vite
- Tailwind CSS
- Capacitor (para Android)
- Recharts (gráficos)
- Shadcn/UI (componentes)

## 📊 Estrutura do App

1. **Dashboard** (`/`): Tela inicial com resumo
2. **Tabelas** (`/tables`): Transações do mês atual
3. **Gráficos** (`/charts/:type`): Análise histórica e previsões

## 🎨 Design System

O app utiliza um design system moderno com:
- Cores temáticas do C6 Bank (roxo/violeta)
- Gradientes suaves
- Sombras elegantes
- Animações fluidas
- Suporte a modo escuro

## 📝 Simulação de Dados

Como não temos acesso às notificações reais do C6 Bank, o app usa dados simulados que representam:
- Transferências recebidas e enviadas
- Valores aleatórios realistas
- Datas dos últimos 5 meses
- Previsões baseadas na média histórica

## 🔧 Desenvolvimento

Para executar em modo desenvolvimento:

```bash
npm run dev
```

Para fazer build de produção:

```bash
npm run build
```

## 📱 Requisitos para Android

- Android Studio instalado
- SDK Android configurado
- Dispositivo Android ou emulador

Para mais informações sobre desenvolvimento mobile, consulte: [Lovable Mobile Development Guide](https://lovable.dev/blogs/TODO)