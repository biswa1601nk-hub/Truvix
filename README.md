# 🛡️ Truvix | Decentralized News Verification Portal

Truvix is a state-of-the-art cybersecurity and news verification platform designed to fight misinformation. By leveraging decentralized nodes and AI-driven analysis, Truvix provides high-fidelity verdicts on the authenticity of news headlines and digital content.

---

## 🚀 Key Features

- **Verification Engine**: Instantly scan news snippets or URLs to detect FAKE or TRUTH consensus using AI-driven logic.
- **Live Intelligence Map**: A global 3D globe visualization (Three.js/Leaflet) tracking trending disinformation in real-time.
- **Expert Directory**: Chat with specialized human-expert nodes for deeper forensic analysis.
- **Modern UI/UX**: Premium futuristic design featuring scanlines, glassmorphism, and smooth Framer Motion animations.
- **Decentralized Node Network**: Real-time stats showing active fact-checkers and claims verified across the globe.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Cyber Design), JavaScript (ES6+), Three.js, Leaflet.js, Framer Motion.
- **Backend**: Node.js, Express.js.
- **APIs**: Serper API (Internal news lookups), Vercel Serverless Functions.
- **Deployment**: Vercel.

---

## ⚙️ How to Setup Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/biswa1601nk-hub/Truvix.git
   cd Truvix
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root and add your API keys:
   ```env
   NEWS_API_KEY=your_key_here
   MAP_API_KEY=your_key_here
   CHAT_API_KEY=your_key_here
   ```

4. **Run the Server**:
   ```bash
   npm start
   ```
   *Your portal will be live at `http://localhost:3000`*

---

## 🌩️ Deployment

The project is pre-configured with `vercel.json` for seamless deployment. All API routes under `/api/*` are automatically routed to the Express backend.

**Live Demo**: [https://truvix-pi.vercel.app/](https://truvix-pi.vercel.app/)

---

## ⚖️ License

&copy; 2026 Truvix Portal. Cryptographically signed and verified. All Rights Reserved.
