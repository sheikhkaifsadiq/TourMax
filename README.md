# ✈️ TourMax AI: Next-Gen Travel Booking & AI Itinerary Platform

<div align="center">
  <a href="https://tourmax-app.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-tourmax--app.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind v4" />
  <br />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe_Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Llama_3.3-FF6C37?style=for-the-badge&logo=meta&logoColor=white" alt="Llama 3.3" />
</div>

<br />

TourMax AI is a full-stack booking application that solves the problem of travel planning fatigue. By integrating Llama-3.3-70b-versatile streaming directly into the user interface, it provides instant, multi-day personalized itineraries, visual AI search, and a secure booking checkout pipeline.

---

> ### 🔒 Security & Intellectual Property Note
> This repository is a public showcase of the platform's frontend, system architecture, database models, and API definitions. **To protect proprietary transaction reconciliation algorithms, stripe credentials, and custom AI prompt weights, the live backend API endpoints and webhooks operate on a secure, private repository.** The frontend components, type systems (tRPC models), and routing structures are open-sourced here for architectural review.

---

## ✨ Core Features

*   **📅 AI Trip Planner**
    *   Streams customized multi-day itineraries based on travel duration, budget, and styles.
    *   Uses strict JSON output validation to map AI streams directly to React UI cards.
*   **📷 Visual Search**
    *   Analyzes uploaded user images to recommend contextually relevant tours.
*   **💬 Smart Chatbot Widget**
    *   Natural language chatbot guiding users through bookings.
*   **💳 Stripe checkout Integration**
    *   Full Stripe Checkout flow integrated with robust backend webhook listeners.

---

## 🛠️ Key Architectural Decisions

| Layer | Technology | Key Implementation |
| :--- | :--- | :--- |
| **Type Safety** | tRPC + Express | End-to-end type safety between database queries and React component rendering. Prevents silent runtime API mismatches. |
| **AI Stream Engine** | Llama-3.3-70b-versatile | Enforces strict JSON schemas (`response_format: "json_object"`) to dynamically render structured cards during AI streaming. |
| **Reconciliation** | Stripe Webhook Pipeline | Audits checkout sessions asynchronously to confirm payments and update ledgers even if the user closes their browser. |
| **Database ORM** | Drizzle ORM + PostgreSQL | Relational modeling with automated cascades and typed queries. |

---

## 📐 Stripe Webhook Lifecycle

```mermaid
sequenceDiagram
    participant User as React Client
    participant Stripe as Stripe Gateway
    participant Webhook as Webhook Listener
    participant DB as PostgreSQL (Drizzle)

    User->>Stripe: Launch Checkout Session
    Note over Stripe: User completes payment
    Stripe-->>Webhook: checkout.session.completed (Event)
    Webhook->>DB: Audit Transaction & Update Ledger
    Note over DB: Set booking status to Paid
    Webhook-->>Stripe: Respond 200 OK
```

---

## ⚙️ How to View Locally (Frontend Only)

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
