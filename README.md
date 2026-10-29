# 🚗 GP Automotive — Workshop Management & Accounting Suite

A modern, full-stack automotive workshop management application designed for vehicle servicing, counter sales, invoice generation, real-time profit analytics, inventory tracking, and AI-driven business intelligence.

---

## 🌟 Key Features

- **📊 Comprehensive Financial Analytics**:
  - Live revenue, expenses, COGS, and net profit calculations.
  - Interactive date filtering (Weekly, Monthly, Yearly, and Custom iOS-style date range picker).
  - Profit margin tracking for every job invoice and parts sale.

- **🧾 Professional Invoice Generation**:
  - Auto-calculated job cards with parts, labor, VAT/taxes, advance payments, and balance tracking.
  - One-click **Save & Print** generating printable invoices.
  - Direct **WhatsApp sharing** and invoice history archive.

- **🤖 AI Business Analytics Assist**:
  - Powered by Google Gemini with resilient multi-model failover (`gemini-3.5-flash`, `gemini-3.6-flash`, etc.).
  - Instant executive summaries highlighting revenue trends, overhead expenses, and low-inventory reorder alerts.
  - Integrated smart offline rule-based fallback.

- **📦 Inventory & Stock Management**:
  - Stock level tracking with automated minimum threshold warnings and reorder alerts.
  - Fast parts search and real-time inventory deduction on sales.

- **👥 Multi-Vehicle Customer Directory**:
  - Full customer directory supporting multiple registered vehicles per client with engine & chassis details.

- **🎨 Modern Responsive UI**:
  - Full Dark Mode & Light Mode support with dynamic theme-aware branding.
  - Persistent user profile avatars and workshop partner management.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Lucide Icons, Modern CSS3 Design Tokens
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas / Mongoose
- **AI Engine**: Google Generative AI (Gemini Flash)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB instance)
- [Google AI Studio](https://aistudio.google.com/) API Key for Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
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
In a new terminal window:
```bash
cd frontend
npm install
npm start
```
The React frontend will launch on `http://localhost:3000`.

---

## 📁 Project Structure

```
├── GPAutoAccounts-Backend/
│   ├── server.js          # Express API server with MongoDB schemas & Gemini AI
│   ├── seedData.js        # Initial database seed script
│   ├── updateVehicles.js  # Vehicle schema migration utility
│   ├── .env.example       # Example environment variables template
│   └── package.json
├── frontend/
│   ├── public/            # HTML template, favicons, branding assets
│   ├── src/
│   │   ├── App.js         # Core application logic & components
│   │   ├── App.css        # Responsive styling & themes
│   │   └── index.js
│   └── package.json
├── .gitignore             # Git ignore configuration
└── README.md              # Project documentation
```

---

## 🔒 Security Note
Never commit the `.env` file containing your MongoDB credentials or Gemini API key. Ensure `.env` is listed in `.gitignore` at all times.
