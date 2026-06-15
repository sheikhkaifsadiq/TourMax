<div align="center">
  <img src="client/public/logo-icon.png" alt="TourMax Logo" width="120" />
  <h1>TourMax AI</h1>
  <p><strong>Next-Generation Travel Booking & Itinerary Generation Platform</strong></p>
  <p>Developed entirely from scratch by <strong>Sheikh Kaif Sadiq</strong></p>
  <br />
  <a href="https://tourmax-app.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-tourmax--app.vercel.app-blue?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
</div>

---

## 🌟 Overview

Welcome to **TourMax AI**, a full-stack, production-ready travel booking application. I built this platform to revolutionize how people plan and book their trips. Traditional travel sites are often static and overwhelming. My vision was to integrate **Artificial Intelligence** deeply into the discovery phase—allowing users to plan personalized trips, get AI-generated itineraries, perform visual searches, and manage their bookings seamlessly in one place.

### 🔗 [Live Application Link](https://tourmax-app.vercel.app)

---

## 🚀 How I Built This (The Development Journey)

### Phase 1: Architecture & Foundation
I started by laying down a robust, modern tech stack that could handle complex state and serverless APIs efficiently. I chose **React 19** and **Vite** for a blazing-fast frontend, paired with **Tailwind CSS 4** for custom, pixel-perfect styling. For the backend, I implemented **tRPC** over an Express adapter to guarantee end-to-end type safety between my database and the UI components. I set up **Drizzle ORM** with PostgreSQL to handle complex relational data (users, bookings, payments).

### Phase 2: Core Features & AI Integration
The heart of TourMax is its intelligence. I integrated the **Llama-3.3-70b-versatile** LLM to power three distinct features:
1. **AI Trip Planner:** Users input their preferences, and the app streams back a fully formatted, multi-day itinerary.
2. **Visual Search:** Users can upload an image, and the AI analyzes it to suggest visually similar or contextually relevant tours.
3. **Smart Chatbot Widget:** A floating assistant capable of understanding natural language queries to guide users through the site.

I engineered strict JSON parsing (`response_format: "json_object"`) to ensure the AI's output flawlessly maps to the React UI components.

### Phase 3: Stripe Payments & Webhooks
For the e-commerce layer, I integrated **Stripe Checkout**. To ensure reliability, I didn't just rely on client-side redirects. I built a comprehensive **Stripe Webhook** pipeline (listening for `checkout.session.completed`, `async_payment_failed`, `charge.refunded`, etc.). This guarantees that even if a user closes their browser during payment, the backend securely processes the transaction, updates the database, and dispatches automated email receipts via Resend.

### Phase 4: UI Polish & Production Deployment
In the final phase, I focused heavily on aesthetics and UX:
- Implemented custom glassmorphism effects and modern scrollbars.
- Designed an in-app "Cancellation Management" modal to replace native browser prompts.
- Created beautiful, responsive image grids for the community and tour pages.
Finally, I configured `vercel.json` to successfully map all `/api/*` endpoints to serverless functions, ensuring a flawless deployment on Vercel.

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion, Radix UI, Lucide Icons
- **Backend:** Node.js (Vercel Serverless), Express, tRPC
- **Database:** PostgreSQL, Drizzle ORM
- **AI / LLM:** Groq API (Llama 3.3 70B)
- **Payments:** Stripe Checkout & Webhooks
- **Authentication:** Custom OAuth (Google/GitHub) & Email/Password

---

## 💻 Local Development

Want to run TourMax locally? Follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sheikhkaifsadiq/TourMax.git
   cd TourMax
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   SESSION_SECRET="your_random_32_char_secret"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   LLM_API_KEY="your_groq_api_key"
   LLM_BASE_URL="https://api.groq.com/openai/v1"
   OAUTH_CLIENT_ID="your_google_oauth_id"
   OAUTH_CLIENT_SECRET="your_google_oauth_secret"
   OAUTH_REDIRECT_URL="http://localhost:3000/api/oauth/callback"
   ```

4. **Initialize Database:**
   ```bash
   npm run db:push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

---

## 👨‍💻 Author

**Sheikh Kaif Sadiq**
* Full-Stack Developer | AI Integration Specialist

If you enjoyed looking through this codebase or have any questions about the implementation, feel free to reach out!

---

> 🔒 **Security & Architecture Note**
> 
> This public repository serves as a demonstration of the platform's architecture, UI/UX, and core capabilities. For security and proprietary reasons, sensitive business logic, payment gateway webhooks, and proprietary AI algorithms are maintained in a separate private repository which is deployed to production.
