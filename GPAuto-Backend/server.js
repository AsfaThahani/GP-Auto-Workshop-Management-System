const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- SCHEMAS ---
const saleSchema = new mongoose.Schema({
  date: String,
  desc: String,
  amount: Number,
  cost: Number,
  profit: Number,
  item: String,
  customer: String
});
const Sale = mongoose.model('Sale', saleSchema, 'sales');

const customerSchema = new mongoose.Schema({ name: String, phone: String, vehicles: Array });
const Customer = mongoose.model('Customer', customerSchema, 'customers');

const inventorySchema = new mongoose.Schema({ name: String, qty: Number, threshold: Number, price: Number });
const Inventory = mongoose.model('Inventory', inventorySchema, 'inventory');

const expenseSchema = new mongoose.Schema({ date: String, desc: String, amount: Number });
const Expense = mongoose.model('Expense', expenseSchema, 'expenses');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: String, docType: String, currency: String, date: String, customerName: String,
  customerPhone: String, vehicleReg: String, vehicleMake: String, mileage: String,
  tasks: Array, total: Number, actualCost: Number, advance: Number, paymentHistory: Array, recommendation: String
});
const Invoice = mongoose.model('Invoice', invoiceSchema, 'invoices');

const settingSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed });
const Setting = mongoose.model('Setting', settingSchema, 'settings');

// --- ROUTES ---

// SETTINGS (PROFILE PIC, PREFERENCES, ETC.)
app.get('/api/settings/:key', async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: req.params.key });
    res.json({ value: doc ? doc.value : null });
  } catch (e) {
    res.status(500).json({ message: 'Error retrieving setting' });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    const doc = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value: req.body.value },
      { upsert: true, new: true }
    );
    res.json({ value: doc.value });
  } catch (e) {
    res.status(500).json({ message: 'Error saving setting' });
  }
});

app.delete('/api/settings/:key', async (req, res) => {
  try {
    await Setting.findOneAndDelete({ key: req.params.key });
    res.json({ message: 'Setting deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting setting' });
  }
});

// SALES
app.get('/api/sales', async (req, res) => {
  try { res.json(await Sale.find().sort({ _id: -1 })); } catch (e) { res.status(500).json({ message: 'Error fetching sales' }); }
});
app.post('/api/sales', async (req, res) => {
  try {
    const newSale = new Sale(req.body);
    await newSale.save();
    res.json(newSale);
  } catch (e) {
    res.status(500).json({ message: 'Error saving sale' });
  }
});
app.put('/api/sales/:id', async (req, res) => {
  try {
    const updated = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error updating sale' });
  }
});
app.delete('/api/sales/:id', async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting sale' });
  }
});

// CUSTOMERS
app.get('/api/customers', async (req, res) => { 
  try { res.json(await Customer.find()); } catch (e) { res.status(500).json({ message: 'Error' }); }
});
app.post('/api/customers', async (req, res) => { 
  try {
    const newC = new Customer(req.body); 
    await newC.save(); 
    res.json(newC); 
  } catch (e) {
    res.status(500).json({ message: 'Error saving customer' });
  }
});
app.put('/api/customers/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error updating customer' });
  }
});
app.delete('/api/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

// INVENTORY
app.get('/api/inventory', async (req, res) => { 
  try { res.json(await Inventory.find()); } catch (e) { res.status(500).json({ message: 'Error' }); }
});
app.post('/api/inventory', async (req, res) => { 
  try {
    const newI = new Inventory(req.body); 
    await newI.save(); 
    res.json(newI); 
  } catch (e) {
    res.status(500).json({ message: 'Error saving inventory item' });
  }
});
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error updating inventory item' });
  }
});
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting inventory item' });
  }
});

// EXPENSES
app.get('/api/expenses', async (req, res) => {
  try { res.json(await Expense.find().sort({ _id: -1 })); } catch (e) { res.status(500).json({ message: 'Error fetching expenses' }); }
});
app.post('/api/expenses', async (req, res) => {
  try {
    const newE = new Expense(req.body);
    await newE.save();
    res.json(newE);
  } catch (e) {
    res.status(500).json({ message: 'Error saving expense' });
  }
});
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error updating expense' });
  }
});
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

// INVOICES
app.get('/api/invoices', async (req, res) => { 
  try { res.json(await Invoice.find().sort({ _id: -1 })); } catch (e) { res.status(500).json({ message: 'Error' }); }
});
app.post('/api/invoices', async (req, res) => { 
  try {
    const newI = new Invoice(req.body); 
    await newI.save(); 
    res.json(newI); 
  } catch (e) {
    res.status(500).json({ message: 'Error saving invoice' });
  }
});
app.put('/api/invoices/:id', async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error updating invoice' });
  }
});
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting invoice' });
  }
});

// --- AI ROUTE (WITH MULTI-MODEL FAILOVER & SMART FALLBACK) ---
app.post('/api/ai-insights', async (req, res) => {
  const { sales = [], expenses = [], inventory = [] } = req.body;

  // 1. Try Google Gemini with active model candidates
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const candidateModels = [
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash"
      ];

      const prompt = `
        You are an expert business consultant for an automotive workshop named GP Automotive. 
        Recent workshop data:
        - Sales: ${JSON.stringify(sales)}
        - Expenses: ${JSON.stringify(expenses)}
        - Inventory: ${JSON.stringify(inventory)}
        
        Write a concise 3-bullet-point executive summary for the owner. Focus on revenue, notable expenses, and low stock warnings or business opportunities.
        Format strictly as bullet points using the "•" character. Do not use markdown bolding or headers.
      `;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          if (text) {
            return res.json({ insight: text });
          }
        } catch (err) {
          console.warn(`Model ${modelName} returned error: ${err.message}. Trying next candidate...`);
        }
      }
    } catch (e) {
      console.warn("AI generation exception:", e.message);
    }
  }

  // 2. Fallback rule-based summary (guarantees the user always gets valuable insight)
  const totalSalesRev = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lowStock = inventory.filter(i => (Number(i.qty) || 0) <= (Number(i.threshold) || 0));

  const bullet1 = `• Total sales recorded stand at Rs. ${totalSalesRev.toLocaleString('en-US')}, anchored by active vehicle services and counter spare parts sales.`;
  const bullet2 = `• Operating expenses stand at Rs. ${totalExp.toLocaleString('en-US')}, covering facility overheads and essential workshop supplies.`;
  const bullet3 = lowStock.length > 0 
    ? `• Low stock alert: ${lowStock.map(i => `${i.name} (${i.qty} units left)`).slice(0, 3).join(', ')} require urgent reorder to prevent service downtime.`
    : `• Inventory levels remain healthy across all categories with zero stockout warnings currently flagged.`;

  res.json({ insight: `${bullet1}\n\n${bullet2}\n\n${bullet3}` });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
