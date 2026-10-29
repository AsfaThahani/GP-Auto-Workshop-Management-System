# GP Automotive - Workshop Management & Accounting Suite

A full-stack automotive workshop management application designed for vehicle servicing, counter sales, invoice generation, real-time profit analytics, inventory tracking, and AI-driven business intelligence.

---

## Disclaimer & Project Purpose

This software was developed solely for educational, academic, and portfolio demonstration purposes. It is not licensed, certified, or intended for commercial business operations, legal accounting, tax compliance, or official record-keeping. Use in any live commercial business environment is strictly at the user's own risk, and the author assumes no liability for financial, operational, or legal decisions made using this application.

---

## Key Features

- **Comprehensive Financial Analytics**:
  - Live revenue, expenses, COGS, and net profit calculations.
  - Interactive date filtering (Weekly, Monthly, Yearly, and Custom date range picker).
  - Profit margin tracking for every job invoice and parts sale.

- **Invoice Generation**:
  - Auto-calculated job cards with parts, labor, taxes, advance payments, and balance tracking.
  - One-click Save & Print generating printable invoices.
  - Direct WhatsApp sharing and invoice history archive.

- **AI Business Analytics Assist**:
  - Powered by Google Gemini with resilient multi-model failover (gemini-3.5-flash, gemini-3.6-flash, etc.).
  - Instant executive summaries highlighting revenue trends, overhead expenses, and low-inventory reorder alerts.
  - Integrated rule-based offline fallback.

- **Inventory & Stock Management**:
  - Stock level tracking with automated minimum threshold warnings and reorder alerts.
  - Fast parts search and real-time inventory deduction on sales.

- **Multi-Vehicle Customer Directory**:
  - Customer directory supporting multiple registered vehicles per client with engine and chassis details.

- **Responsive UI**:
  - Dark Mode and Light Mode support with theme-aware branding.
  - Persistent user profile avatars and workshop partner management.

---

## Tech Stack

- **Frontend**: React.js, Lucide Icons, Modern CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas / Mongoose
- **AI Engine**: Google Generative AI (Gemini Flash)

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Google AI Studio API Key for Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/AsfaThahani/GP-Auto-Workshop-Management-System.git
cd GP-Auto-Workshop-Management-System
```

### 2. Backend Setup
```bash
cd GPAutoAccounts-Backend
npm install
```

Create a `.env` file in `GPAutoAccounts-Backend/` based on `.env.example`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/GPAutoPulseDB
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend server:
```bash
node server.js
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
In a separate terminal window:
```bash
cd frontend
npm install
npm start
```
The React frontend will launch on `http://localhost:3000`.

---

## Security Note

Never commit the `.env` file containing your MongoDB credentials or Gemini API key. Ensure `.env` is listed in `.gitignore` at all times.
