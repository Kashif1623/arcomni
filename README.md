# ArcOmni 🌌
### Autonomous On-Chain Intelligence Dashboard for the Arc Network

ArcOmni is a futuristic, fully functional Web3 dApp dashboard built on the Arc Network featuring a clean glassmorphism UI, dark mode styling, neon accents, and smooth real-time animations.

---

## 🚀 Live Demo
* **Live Application:** [https://arcomni-ecru.vercel.app](https://arcomni-ecru.vercel.app)

---

## ✨ Core Features

1. **Natural Language Intent Parser:**
   * An interactive text input box where users can type natural language on-chain commands (e.g., *"Monitor USDC transfers, check dual-send paths (ERC-20 vs Native), and execute safe routing based on gas and latency"*).
   * Parses commands instantly and displays a live execution log.

2. **Dual-Path Gas Tracker:**
   * Real-time monitoring of network gas fees, TPS, block height, and node uptime to optimize transaction paths.

3. **Security Shield (Threat Monitoring):**
   * Autonomous agent scanning the mempool for front-running patterns, execution risks, and malicious payloads.

4. **Web3 Wallet Integration:**
   * Seamless connect wallet functionality designed specifically for the Arc Network ecosystem.

---

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, PostCSS
* **Blockchain:** Arc Network Integration, Smart Contract support (`contracts/`, `lib/forge-std/`)
* **Styling:** Custom Glassmorphism UI & Neon Accents

---

## 📦 Project Structure
```text
├── .agents/skills/      # Autonomous agent skill configurations
├── contracts/           # Smart contract modules
├── src/                 # Frontend React components & application logic
├── index.html           # Main application entry point
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite bundler configuration
