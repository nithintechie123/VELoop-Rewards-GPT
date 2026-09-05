# 🎁 VELoop Rewards - Sweepstakes & Giveaway Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-Latest-F05032?style=for-the-badge)](https://lucide.dev/)
[![Provably Fair](https://img.shields.io/badge/SHA--256-Provably_Fair-10B981?style=for-the-badge)](https://en.wikipedia.org/wiki/SHA-2)

> A modern, high-performance, provably fair sweepstakes and giveaway reward experience built with **React**, **Vite**, **Framer Motion**, and **Vanilla CSS Modules**.

---

## 🌟 Key Highlights & Features

### 1. 🏆 Dynamic Hero & Flagship Giveaways
- **Grand Prize Showcase**: Interactive 3D perspective spotlight tilt with dynamic cursor glow.
- **Real-Time Countdown**: Microsecond-accurate flip-style countdown timer with seamless transition to Ended / Upcoming states.
- **Live Status Badges**: Dynamic status transitions (`LIVE NOW`, `ENDED`, `UPCOMING`, `DRAW VERIFYING`).

### 2. 🛡️ Provably Fair SHA-256 System
- **Cryptographic Transparency**: Public server seed hash, client seed generation, combined SHA-256 entropy derivation, and provable winning ticket verification formulas.
- **Audit Modal**: Full audit logs with one-click verification hash copying and explanation tooltips.

### 3. 🎯 7 Distinct User States (Simulation Sandbox)
1. **Visitor (Guest)**: Logged-out state with authentication calls to action.
2. **Logged-in Non-Participant**: 0 active tickets, highlighting free entry opportunities.
3. **Participant**: Dynamic entry breakdown, ticket receipt pill, and quest bonuses.
4. **Winner**: Winner celebration banner with confetti animations and recipient claim flow.
5. **Non-Winner**: Polite participation appreciation, winner links, and next giveaway explore actions.
6. **Giveaway Ended**: Archived countdown with official verified winner announcements.
7. **Upcoming State**: Pre-registration alerts and early-bird entry reminders.

### 4. 📦 Reusable Prize-Type Architecture
- Fully decoupled business logic configured via `prizeTypeUtils.js`:
  - `PHYSICAL`: Hardware & gadgets requiring courier delivery details & AWB tracking.
  - `GIFT_CARD`: Instant digital redemption voucher codes dispatched to email.
  - `DIGITAL_KEY`: Instant software / game license activation keys.
  - `EXPERIENCE`: VIP concierge booking and passes.

### 5. 🎬 Interactive Winner Reveal Experience
- Dramatic 3-second cryptographic draw sequence with shuffling ticket animation, drumroll audio FX, gold particle explosions, and winner declaration modal.

### 6. 📊 Complete Empty, Loading & Error States
- **Skeleton Loaders**: Comprehensive skeleton loading states for hero cards, prize grids, previous winners, and stat counters.
- **Empty States**: Customized empty illustrations for *No Previous Winners*, *No Current Giveaway*, and *No Active Participation*.
- **Resilient Error Recovery**: User-friendly retry screens with connection auto-recovery.

### 7. ♿ Accessibility (a11y) & ⚡ Performance
- **WCAG Compliant**: `:focus-visible` glow rings, full `Tab`/`Enter` keyboard navigation, `Escape` key dismiss on all modals, ARIA dialog roles, and descriptive `alt` tags.
- **Code Splitting**: Rollup chunk isolation and `React.lazy()` modal loading for fast First Contentful Paint (< 2.5s production build).

---

## 📁 Repository Structure

```
VELoop-Rewards/
├── .gitignore
├── package.json
├── README.md
└── frontend/
    ├── public/
    │   └── assets/images/          # Optimized WebP/JPG prize illustrations
    ├── src/
    │   ├── components/
    │   │   ├── Countdown/          # Flip-style real-time countdown timer
    │   │   ├── EmptyState/         # Empty state feedback illustrations
    │   │   ├── ErrorState/         # Graceful error boundary & retry UI
    │   │   ├── FeaturedGiveaways/  # Filterable prize pools grid
    │   │   ├── GiveawayHero/       # Flagship hero spotlight & quick actions
    │   │   ├── GiveawayRules/      # Terms, eligibility & FAQ modal
    │   │   ├── GiveawayStats/      # Real-time community draw metrics
    │   │   ├── Header/             # Responsive navigation & coin wallet
    │   │   ├── ParticipationModal/ # Multi-tier entry calculation modal
    │   │   ├── PreviousWinnerCard/ # Card grid & table view for past winners
    │   │   ├── PrizeCard/          # Interactive reward card with hover FX
    │   │   ├── PrizeClaimModal/    # Dynamic recipient claim submission modal
    │   │   ├── ProvablyFairModal/  # Cryptographic SHA-256 audit modal
    │   │   ├── SimulationToolbar/  # Live interactive testing sandbox
    │   │   ├── Skeletons/          # Shimmer skeleton loading components
    │   │   ├── UserEntryTracker/   # Ticket breakdown and odds calculator
    │   │   ├── WinnerClaimBanner/  # Winner celebration / claim status banner
    │   │   ├── WinnerReveal/       # Animated cryptographic winner reveal
    │   │   ├── WinnersTabs/        # Active pools, spotlight & archive tabs
    │   │   └── WinnerSlider/       # Ticker of community winner announcements
    │   ├── data/
    │   │   └── giveawayData.js     # Standardized mock data structures
    │   ├── pages/
    │   │   └── Giveaway/           # Main Giveaway page orchestrator
    │   ├── services/
    │   │   └── api.js              # Decoupled REST API client with mock fallback
    │   ├── styles/
    │   │   └── index.css           # Design tokens, variables & glassmorphism
    │   ├── utils/
    │   │   ├── confetti.js         # Canvas confetti particle burst
    │   │   ├── prizeTypeUtils.js   # Centralized prize schemas & business logic
    │   │   └── soundFx.js          # Web Audio API procedural sound synthesizer
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nithintechie123/VELoop-Rewards-GPT.git
   cd VELoop-Rewards
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🧪 Simulation & Testing Suite
The application includes a built-in **Simulation Toolbar** located at the top of the interface for local testing:
- **User State Cycle**: Switch between all 7 user personas (Visitor, 0 Tickets, Active Participant, Winner, Non-Winner, Ended, Upcoming).
- **5-Stage Lifecycle**: Simulate giveaway transitions from Active $\to$ Concluded $\to$ Winners Announced $\to$ Archive Move $\to$ Next Cycle.
- **Claim States**: Test claim statuses (`not_submitted`, `submitted`, `processing`, `completed`, `expired`).
- **Loading & Error Sandbox**: Toggle skeleton shimmer loaders and simulated network error screens.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
