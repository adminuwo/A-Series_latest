# AI Sales (AISALES) Intelligence Agent

The **AISALES** agent is a specialized, autonomous Sales Intelligence engine built within the UWO AI platform. It is designed to assist sales professionals, founders, and SDRs with the entire sales lifecycle—from lead generation driven by real-time web search, to structuring cold outreach, pitching, closing, and updating CRMs.

## 🚀 Core Features & Operational Modes

The agent operates across six distinct "Modes". Switching between modes dynamically alters both the UI input parameters and the underlying system prompts sent to the LLM (Google Gemini via Vertex AI).

### 1. Lead Gen
- **Goal:** Find real prospect companies matching a target audience.
- **Deep Search:** This mode triggers **Vertex AI Grounding (Google Search)** automatically on the backend to avoid hallucinations and pull real-time data on active businesses.

### 2. Outreach
- **Goal:** Generate highly effective, multi-channel outreach strategies.
- **Outputs:** Cold email templates, LinkedIn connection sequences, follow-up cadences, and objection handling scripts.

### 3. Pitching
- **Goal:** Create compelling presentation structures based on prospect pain points.
- **Outputs:** Elevator pitches, Pain-Agitation-Solution (PAS) frameworks, and competitive differentiators.

### 4. Closing
- **Goal:** Provide tactical advice and strategies to finalize a deal over the line.
- **Outputs:** Closing techniques, negotiation levers, ROI/value justification math, and discount structuring.

### 5. CRM
- **Goal:** Act as a clean translation layer between a sales call and a CRM entry.
- **Outputs:** Synthesizes raw conversational notes into structured CRM updates, deal prognoses, stakeholder maps, and immediate next steps.

### 6. Messaging
- **Goal:** Raw, highly specific output generation.
- **Outputs:** Instead of generating a full dashboard of sections, this mode outputs the exact text/script requested (e.g., "Write a breakup email sequence").

---

## 🛠 Technical Architecture

### Frontend (`AiSales.jsx`)
- Built with **React** and styled heavily with **Tailwind CSS**.
- **Dynamic Configuration:** The UI adapts intelligently. Form fields switch from standard text inputs to predefined `<select>` dropdowns based on the active mode (e.g., presenting a dropdown of CRM Tools like Salesforce/HubSpot only when in CRM mode).
- **Rich Rendering:** Uses `react-markdown` to format the AI's response text.
- **Data Visualization:** The LLM is instructed to return specific JSON blocks when statistical data is relevant. The frontend intercepts these blocks and renders them via **Recharts** as interactive Pie or Bar charts embedded directly within the UI response cards.
- **Local History:** Uses an IndexedDB-backed service (`chatStorageService`) to save conversation states locally, allowing users to jump back into past strategy sessions instantly via the History sidebar.

### Backend (`chatRoutes.js` + `aivaService.js`)
- Interfaces with **Google Cloud Vertex AI (Gemini 2.5 Flash)**.
- Integrates Google Search Grounding for real-time querying (`searchService.js`).
- Implements resilient retry logic: specifically catches and manages `429 Too Many Requests` (Quota limits) through exponential backoff mechanisms to ensure seamless generation even under heavy loads.

---

## 💻 Tech Stack
*   **React** (Component rendering)
*   **Framer Motion** (Micro-animations and layout transitions)
*   **Lucide React** (SVG Iconography)
*   **Recharts** (Inline data visualization)
*   **Tailwind CSS** (Glassmorphism, gradients, responsive layout)

## 🔧 Getting Started / Using the Module

1. Open the **Sales Intelligence** portal from the application.
2. Select the specific **Mode** you wish to run along the top navigation bar.
3. Fill in the **Campaign Configuration** details (Company, Target Audience, Product, Goal/Notes).
4. Click **Generate Strategy**.
5. Wait for the AIVA backend loop to process and structure the data.
6. The resulting insights, scripts, and visualizations will be rendered sequentially. 
7. You can access past sessions at any time via the **History** button.
