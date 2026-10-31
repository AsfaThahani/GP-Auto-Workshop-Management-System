const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // 1. Kusal Perera: Prius + Prado
  await db.collection('customers').updateOne(
    { name: 'Kusal Perera' },
    { $set: {
      vehicles: [
        { reg: 'WP CAD-4821', make: 'Toyota Prius 1.8 Hybrid (ZVW30)' },
        { reg: 'WP CBA-9014', make: 'Toyota Land Cruiser Prado (TRJ150)' }
      ]
    }}
  );

  // 2. Dinesh Fernando: Vezel + Wagon R
  await db.collection('customers').updateOne(
    { name: 'Dinesh Fernando' },
    { $set: {
      vehicles: [
        { reg: 'WP CAB-1904', make: 'Honda Vezel RU3 Hybrid' },
        { reg: 'WP CAH-3380', make: 'Suzuki Wagon R FX (MH55S)' }
      ]
    }}
  );

  // 3. Shenal De Silva: Montero Sport + Axio
  await db.collection('customers').updateOne(
    { name: 'Shenal De Silva' },
    { $set: {
      vehicles: [
        { reg: 'WP CAG-6215', make: 'Mitsubishi Montero Sport 2.5D' },
        { reg: 'WP KB-1240', make: 'Toyota Corolla Axio WxB (NKE165)' }
      ]
    }}
  );

  // 4. Arumugam Tharmalingam: Corolla 121 + Nissan D22
  await db.collection('customers').updateOne(
    { name: 'Arumugam Tharmalingam' },
    { $set: {
      vehicles: [
        { reg: 'CP BCB-3310', make: 'Toyota Corolla 121' },
        { reg: 'CP DA-7745', make: 'Nissan D22 Double Cab 4x4' }
      ]
    }}
  );

  console.log('✅ Updated customers with 2 vehicles in MongoDB Atlas:');
  const updated = await db.collection('customers').find().toArray();
  for (const c of updated) {
    console.log(`- ${c.name} (${c.vehicles.length} vehicle${c.vehicles.length > 1 ? 's' : ''}): ${c.vehicles.map(v => `${v.reg} [${v.make}]`).join(' | ')}`);
  }
  process.exit(0);
}

run();
