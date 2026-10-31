const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // 1. CLEAR OLD DATA
    console.log('Removing old collections data...');
    await db.collection('customers').deleteMany({});
    await db.collection('inventory').deleteMany({});
    await db.collection('invoices').deleteMany({});
    await db.collection('sales').deleteMany({});
    await db.collection('expenses').deleteMany({});
    console.log('Old collections cleared.');

    // 2. SRI LANKAN CUSTOMERS
    const customersData = [
      {
        name: "Kusal Perera",
        phone: "077 234 5678",
        vehicles: [
          { reg: "WP CAD-4821", make: "Toyota Prius 1.8 Hybrid (ZVW30)" },
          { reg: "WP CBA-9014", make: "Toyota Land Cruiser Prado (TRJ150)" }
        ]
      },
      {
        name: "Dinesh Fernando",
        phone: "071 890 1234",
        vehicles: [
          { reg: "WP CAB-1904", make: "Honda Vezel RU3 Hybrid" },
          { reg: "WP CAH-3380", make: "Suzuki Wagon R FX (MH55S)" }
        ]
      },
      {
        name: "Nimal Wickramasinghe",
        phone: "076 543 2198",
        vehicles: [
          { reg: "SP KQ-5421", make: "Suzuki Wagon R Stingray" }
        ]
      },
      {
        name: "Mohamed Rizwan",
        phone: "070 123 4567",
        vehicles: [
          { reg: "WP CAR-8832", make: "Toyota Aqua NHP10" }
        ]
      },
      {
        name: "Arumugam Tharmalingam",
        phone: "077 789 4321",
        vehicles: [
          { reg: "CP BCB-3310", make: "Toyota Corolla 121" },
          { reg: "CP DA-7745", make: "Nissan D22 Double Cab 4x4" }
        ]
      },
      {
        name: "Kasun Jayasuriya",
        phone: "078 456 7890",
        vehicles: [
          { reg: "WP KR-9022", make: "Suzuki Alto 800" }
        ]
      },
      {
        name: "Shenal De Silva",
        phone: "072 345 6789",
        vehicles: [
          { reg: "WP CAG-6215", make: "Mitsubishi Montero Sport 2.5D" },
          { reg: "WP KB-1240", make: "Toyota Corolla Axio WxB (NKE165)" }
        ]
      }
    ];
    const customerInsert = await db.collection('customers').insertMany(customersData);
    console.log(`Inserted ${customerInsert.insertedCount} Sri Lankan customers.`);

    // 3. REAL INVENTORY
    const inventoryData = [
      { name: "Mobil Super 3000 5W-30 Full Synthetic (4L)", qty: 14, threshold: 4, price: 18500 },
      { name: "Castrol GTX 20W-50 Engine Oil (4L)", qty: 9, threshold: 3, price: 12800 },
      { name: "Toyota Genuine Oil Filter (90915-10003)", qty: 28, threshold: 6, price: 2400 },
      { name: "Honda Genuine Oil Filter (15400-RTA-003)", qty: 16, threshold: 5, price: 2650 },
      { name: "Denso Iridium Spark Plugs SC20HR11 (Set of 4)", qty: 12, threshold: 3, price: 11500 },
      { name: "Brembo Front Brake Pad Set (Aqua/Prius/Axio)", qty: 6, threshold: 2, price: 14200 },
      { name: "FBK Rear Brake Shoe Set (Alto/Wagon R)", qty: 8, threshold: 3, price: 6800 },
      { name: "Bosch Dot 4 Brake Fluid (500ml)", qty: 18, threshold: 5, price: 2100 },
      { name: "AISIN Fully Synthetic CVT/Hybrid Fluid (4L)", qty: 8, threshold: 2, price: 16500 },
      { name: "Toyota Genuine Super Long Life Coolant (2L)", qty: 7, threshold: 2, price: 6500 },
      { name: "Denso Cabin AC Air Filter (Wagon R / Alto)", qty: 20, threshold: 4, price: 1850 },
      { name: "Osram H4 Night Breaker Laser Bulb (Pair)", qty: 5, threshold: 2, price: 5400 },
      // Low stock triggers (qty <= threshold) for AI Insights & Dashboard
      { name: "Amaron Pro 12V 45Ah Maintenance-Free Battery", qty: 2, threshold: 3, price: 28500 },
      { name: "Michelin Primacy 4 195/65R15 Tyre", qty: 3, threshold: 4, price: 34000 }
    ];
    const inventoryInsert = await db.collection('inventory').insertMany(inventoryData);
    console.log(`Inserted ${inventoryInsert.insertedCount} inventory items.`);

    // 4. REAL SALES
    const salesData = [
      {
        date: "2026-10-22",
        item: "Mobil Super 3000 (4L) + Toyota Oil Filter",
        desc: "Full synthetic oil & OEM filter pack",
        customer: "Kusal Perera",
        amount: 20900,
        cost: 16000,
        profit: 4900
      },
      {
        date: "2026-10-24",
        item: "Denso Iridium Spark Plugs (Set of 4)",
        desc: "Iridium plugs for Aqua / Prius",
        customer: "Mohamed Rizwan",
        amount: 11500,
        cost: 8600,
        profit: 2900
      },
      {
        date: "2026-10-25",
        item: "Amaron Pro 12V Battery 45Ah",
        desc: "Battery replacement with 36-month warranty",
        customer: "Arumugam Tharmalingam",
        amount: 28500,
        cost: 23000,
        profit: 5500
      },
      {
        date: "2026-10-26",
        item: "Bosch Dot 4 Brake Fluid (2 Cans)",
        desc: "Over-the-counter brake fluid sale",
        customer: "Shenal De Silva",
        amount: 4200,
        cost: 3100,
        profit: 1100
      },
      {
        date: "2026-10-27",
        item: "Castrol GTX 20W-50 Engine Oil (4L)",
        desc: "Engine oil for Alto 800",
        customer: "Kasun Jayasuriya",
        amount: 12800,
        cost: 10200,
        profit: 2600
      },
      {
        date: "2026-10-28",
        item: "Osram H4 Headlight Bulbs",
        desc: "Night breaker laser bulb pair",
        customer: "Dinesh Fernando",
        amount: 5400,
        cost: 3800,
        profit: 1600
      },
      {
        date: "2026-10-29",
        item: "Denso Cabin AC Filter",
        desc: "Direct cabin air filter purchase",
        customer: "Nimal Wickramasinghe",
        amount: 1850,
        cost: 1350,
        profit: 500
      }
    ];
    const salesInsert = await db.collection('sales').insertMany(salesData);
    console.log(`Inserted ${salesInsert.insertedCount} sales transactions.`);

    // 5. REAL INVOICES
    const invoicesData = [
      {
        invoiceNo: "#10491",
        docType: "Invoice",
        currency: "Rs. ",
        date: "2026-10-24",
        customerName: "Kusal Perera",
        customerPhone: "077 234 5678",
        vehicleReg: "WP CAD-4821",
        vehicleMake: "Toyota Prius 1.8 Hybrid (ZVW30)",
        mileage: "84500",
        tasks: [
          { id: 1793261001, type: "part", desc: "Mobil Super 3000 5W-30 Synthetic (4L)", qty: 1, unitPrice: 18500, actualUnitCost: 14500 },
          { id: 1793261002, type: "part", desc: "Toyota Genuine Oil Filter (90915-10003)", qty: 1, unitPrice: 2400, actualUnitCost: 1700 },
          { id: 1793261003, type: "service", desc: "Hybrid Cooling Fan Cleaning & Computer Diagnostics", qty: 1, unitPrice: 6500, actualUnitCost: 1500 },
          { id: 1793261004, type: "labor", desc: "Engine Oil Flush & Filter Replacement Labor", qty: 1, unitPrice: 3500, actualUnitCost: 1000 }
        ],
        total: 30900,
        actualCost: 18700,
        advance: 30900,
        paymentHistory: [
          { id: 1793261010, date: "2026-10-24", amount: 15000 },
          { id: 1793261011, date: "2026-10-24", amount: 15900 }
        ],
        recommendation: "Next periodic maintenance due at 89,500 km or April 2027. Hybrid traction battery state-of-health is optimal (94%)."
      },
      {
        invoiceNo: "#10495",
        docType: "Invoice",
        currency: "Rs. ",
        date: "2026-10-26",
        customerName: "Dinesh Fernando",
        customerPhone: "071 890 1234",
        vehicleReg: "WP CAB-1904",
        vehicleMake: "Honda Vezel RU3 Hybrid",
        mileage: "62100",
        tasks: [
          { id: 1793262001, type: "part", desc: "Brembo Front Brake Pad Set (Aqua/Prius/Axio)", qty: 1, unitPrice: 14200, actualUnitCost: 10800 },
          { id: 1793262002, type: "part", desc: "Bosch Dot 4 Brake Fluid (500ml)", qty: 2, unitPrice: 2100, actualUnitCost: 1550 },
          { id: 1793262003, type: "service", desc: "Front Brake Rotor Truing & Machine Skimming", qty: 1, unitPrice: 7000, actualUnitCost: 2000 },
          { id: 1793262004, type: "labor", desc: "Brake Caliper Servicing & Bleeding Labor", qty: 1, unitPrice: 4500, actualUnitCost: 1200 }
        ],
        total: 29900,
        actualCost: 17100,
        advance: 20000,
        paymentHistory: [
          { id: 1793262010, date: "2026-10-26", amount: 20000 }
        ],
        recommendation: "Rear brake linings inspected; approx 45% thickness remains. Balance Rs. 9,900 to be settled on pickup."
      },
      {
        invoiceNo: "#10499",
        docType: "Invoice",
        currency: "Rs. ",
        date: "2026-10-28",
        customerName: "Nimal Wickramasinghe",
        customerPhone: "076 543 2198",
        vehicleReg: "SP KQ-5421",
        vehicleMake: "Suzuki Wagon R Stingray",
        mileage: "45300",
        tasks: [
          { id: 1793263001, type: "part", desc: "Denso Cabin AC Air Filter (Wagon R / Alto)", qty: 1, unitPrice: 1850, actualUnitCost: 1350 },
          { id: 1793263002, type: "service", desc: "AC Evaporator Antibacterial Foam Cleaning & Gas Recharge", qty: 1, unitPrice: 8500, actualUnitCost: 2800 },
          { id: 1793263003, type: "labor", desc: "Blower Motor Cleaning & Dashboard AC Servicing", qty: 1, unitPrice: 3500, actualUnitCost: 900 }
        ],
        total: 13850,
        actualCost: 5050,
        advance: 13850,
        paymentHistory: [
          { id: 1793263010, date: "2026-10-28", amount: 13850 }
        ],
        recommendation: "AC cooling vent discharge temperature stabilized at 6.8°C. Replace cabin filter every 10,000 km."
      },
      {
        invoiceNo: "#10503",
        docType: "Invoice",
        currency: "Rs. ",
        date: "2026-10-29",
        customerName: "Mohamed Rizwan",
        customerPhone: "070 123 4567",
        vehicleReg: "WP CAR-8832",
        vehicleMake: "Toyota Aqua NHP10",
        mileage: "112000",
        tasks: [
          { id: 1793264001, type: "part", desc: "AISIN Fully Synthetic CVT/Hybrid Fluid (4L)", qty: 1, unitPrice: 16500, actualUnitCost: 12500 },
          { id: 1793264002, type: "part", desc: "Toyota Genuine Super Long Life Coolant (2L)", qty: 1, unitPrice: 6500, actualUnitCost: 4800 },
          { id: 1793264003, type: "service", desc: "Major 100k Diagnostic Inspection & Hybrid Inverter Coolant Bleed", qty: 1, unitPrice: 8000, actualUnitCost: 1500 },
          { id: 1793264004, type: "labor", desc: "Transaxle Drain & Fill + Cooling Circuit Purge", qty: 1, unitPrice: 4500, actualUnitCost: 1200 }
        ],
        total: 35500,
        actualCost: 20000,
        advance: 15000,
        paymentHistory: [
          { id: 1793264010, date: "2026-10-29", amount: 15000 }
        ],
        recommendation: "Inverter coolant pump is healthy. Balance Rs. 20,500 due upon vehicle delivery."
      }
    ];
    const invoicesInsert = await db.collection('invoices').insertMany(invoicesData);
    console.log(`Inserted ${invoicesInsert.insertedCount} invoices.`);

    // 6. REAL EXPENSES
    const expensesData = [
      {
        date: "2026-10-05",
        desc: "CEB Workshop Electricity Bill - Sep/Oct",
        amount: 24500
      },
      {
        date: "2026-10-10",
        desc: "Air Compressor Servicing & High-Pressure Hose Replacement",
        amount: 8200
      },
      {
        date: "2026-10-15",
        desc: "Oxygen & Acetylene Torch Gas Refills (Ceylon Oxygen)",
        amount: 7500
      },
      {
        date: "2026-10-20",
        desc: "Workshop Hydraulic Lift Lubrication & Safety Inspection",
        amount: 5000
      },
      {
        date: "2026-10-25",
        desc: "Workshop Bay Monthly Rental Advance",
        amount: 85000
      }
    ];
    const expensesInsert = await db.collection('expenses').insertMany(expensesData);
    console.log(`Inserted ${expensesInsert.insertedCount} operational expenses.`);

    console.log('\n--- FRESH DATABASE SUMMARY ---');
    console.log('Customers count:', await db.collection('customers').countDocuments());
    console.log('Inventory count:', await db.collection('inventory').countDocuments());
    console.log('Sales count:    ', await db.collection('sales').countDocuments());
    console.log('Invoices count: ', await db.collection('invoices').countDocuments());
    console.log('Expenses count: ', await db.collection('expenses').countDocuments());
    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
