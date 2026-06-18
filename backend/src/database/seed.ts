/**
 * Seeds the initial System Administrator account so there's a way to log
 * in for the first time (the UI only exposes normal-user signup).
 *
 * Also seeds sample Store Owner, Store, Normal User, and Rating for
 * development / manual testing.
 *
 * Run with: npm run seed
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { Role } from '../common/enums/role.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'store_rating_db',
    entities: [User, Store, Rating],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to database for seeding...');

  const userRepo = dataSource.getRepository(User);
  const storeRepo = dataSource.getRepository(Store);
  const ratingRepo = dataSource.getRepository(Rating);

  // Counters for summary
  let adminsCreated = 0;
  let ownersCreated = 0;
  let usersCreated = 0;
  let storesCreated = 0;
  let ratingsCreated = 0;

  // ── 1. Admin ──────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@storerating.com';
  const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log(`Admin already exists (${adminEmail}). Nothing to do.`);
  } else {
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@1234', 10);
    const admin = userRepo.create({
      name: process.env.SEED_ADMIN_NAME || 'System Administrator Account',
      email: adminEmail,
      password: hashed,
      address: process.env.SEED_ADMIN_ADDRESS || 'Head Office, Baner, Pune, Maharashtra',
      role: Role.ADMIN,
    });
    await userRepo.save(admin);
    console.log(`Created admin user: ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);
    adminsCreated++;
  }

  // ── 2. Store Owners (5 users) ─────────────────────────────────────────
  const ownerDefs = [
    { name: 'Rajesh Kumar Electronics & Appliances', email: 'owner1@storerating.com', address: 'Shop 45, MG Road, Camp, Pune, Maharashtra 411001' },
    { name: 'Priya Sharma Fresh Grocery & Provisions', email: 'owner2@storerating.com', address: 'Flat 12, Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053' },
    { name: 'Amit Patel Bookstore & Stationery Hub', email: 'owner3@storerating.com', address: 'No 78, 15th Cross, Indiranagar, Bangalore, Karnataka 560038' },
    { name: 'Sneha Reddy Cafe & Bakery Delights', email: 'owner4@storerating.com', address: 'G-3, Saket District Centre, Saket, Delhi 110017' },
    { name: 'Vikram Singh Clothing & Textiles Emporium', email: 'owner5@storerating.com', address: 'Shop 22, Golghar Road, Gorakhpur, Uttar Pradesh 273001' },
  ];

  const owners: User[] = [];
  for (const def of ownerDefs) {
    const existing = await userRepo.findOne({ where: { email: def.email } });
    if (existing) {
      console.log(`Store Owner already exists (${def.email}). Nothing to do.`);
      owners.push(existing);
    } else {
      const hashed = await bcrypt.hash('Owner@1234', 10);
      const owner = userRepo.create({
        name: def.name,
        email: def.email,
        password: hashed,
        address: def.address,
        role: Role.STORE_OWNER,
      });
      await userRepo.save(owner);
      console.log(`Created store owner: ${def.email} / Owner@1234`);
      owners.push(owner);
      ownersCreated++;
    }
  }

  // ── 3. Normal Users (10 users) ────────────────────────────────────────
  const userDefs = [
    { name: 'Arjun Mehta Software Engineer & Tech Enthusiast', email: 'user1@storerating.com', address: 'Flat 301, Cyberabad Towers, HITEC City, Hyderabad, Telangana 500081' },
    { name: 'Kavita Joshi College Student & Part-time Tutor', email: 'user2@storerating.com', address: 'Room 14, Girls Hostel, Anna University, Chennai, Tamil Nadu 600025' },
    { name: 'Rahul Verma Business Analyst & Data Lover', email: 'user3@storerating.com', address: 'Tower B, Salt Lake Sector V, Kolkata, West Bengal 700091' },
    { name: 'Anita Desai Homemaker & Lifestyle Blogger', email: 'user4@storerating.com', address: 'C-204, Malviya Nagar, Jaipur, Rajasthan 302017' },
    { name: 'Suresh Iyer IT Professional & Cricket Fan', email: 'user5@storerating.com', address: 'Plot 56, Satellite Road, Ahmedabad, Gujarat 380015' },
    { name: 'Meena Kapoor School Teacher & Bookworm', email: 'user6@storerating.com', address: 'House 89, Gomti Nagar, Lucknow, Uttar Pradesh 226010' },
    { name: 'Deepak Chauhan Marketing Manager & Traveler', email: 'user7@storerating.com', address: 'SCO 45, Sector 17, Chandigarh 160017' },
    { name: 'Pooja Nair Healthcare Worker & Yoga Trainer', email: 'user8@storerating.com', address: 'Kochi Refinery Township, Kochi, Kerala 682004' },
    { name: 'Ravi Kumar Startup Entrepreneur & Investor', email: 'user9@storerating.com', address: 'Office 7, Vijay Nagar, Indore, Madhya Pradesh 452010' },
    { name: 'Sunita Rao Freelance Designer & Art Lover', email: 'user10@storerating.com', address: 'Residency Road, Sitabuldi, Nagpur, Maharashtra 440012' },
  ];

  const normalUsers: User[] = [];
  for (const def of userDefs) {
    const existing = await userRepo.findOne({ where: { email: def.email } });
    if (existing) {
      console.log(`Normal User already exists (${def.email}). Nothing to do.`);
      normalUsers.push(existing);
    } else {
      const hashed = await bcrypt.hash('User@1234', 10);
      const user = userRepo.create({
        name: def.name,
        email: def.email,
        password: hashed,
        address: def.address,
        role: Role.NORMAL_USER,
      });
      await userRepo.save(user);
      console.log(`Created normal user: ${def.email} / User@1234`);
      normalUsers.push(user);
      usersCreated++;
    }
  }

  // ── 4. Stores (8 stores) ──────────────────────────────────────────────
  // Owners: owner1-5. Some own multiple stores. Stores 7 and 8 are unassigned (ownerId null).
  const storeDefs = [
    { name: 'TechHub Electronics & Appliances', email: 'techhub@storerating.com', address: 'Shop 45, MG Road, Camp, Pune, Maharashtra 411001', ownerIdx: 0 },
    { name: 'FreshDaily Grocery Supermarket', email: 'freshdaily@storerating.com', address: 'Flat 12, Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053', ownerIdx: 1 },
    { name: 'BookWorm Reading Corner & Stationery', email: 'bookworm@storerating.com', address: 'No 78, 15th Cross, Indiranagar, Bangalore, Karnataka 560038', ownerIdx: 2 },
    { name: 'CoffeeBean Cafe & Lounge', email: 'coffeebean@storerating.com', address: 'G-3, Saket District Centre, Saket, Delhi 110017', ownerIdx: 3 },
    { name: 'Fashionista Clothing & Apparel Store', email: 'fashionista@storerating.com', address: 'Shop 22, Golghar Road, Gorakhpur, Uttar Pradesh 273001', ownerIdx: 4 },
    { name: 'QuickFix Pharmacy & Medical Store', email: 'quickfix@storerating.com', address: 'Near FC Road, Deccan Gymkhana, Pune, Maharashtra 411004', ownerIdx: 0 },
    { name: 'SweetDelights Bakery & Confectionery', email: 'sweetdelights@storerating.com', address: 'Lajpat Nagar, Central Market, Delhi 110024', ownerIdx: null },
    { name: 'BuildRight Hardware & Tools Depot', email: 'buildright@storerating.com', address: 'Jayanagar 4th Block, Bangalore, Karnataka 560041', ownerIdx: null },
  ];

  const stores: Store[] = [];
  for (const def of storeDefs) {
    const existing = await storeRepo.findOne({ where: { email: def.email } });
    if (existing) {
      console.log(`Store already exists (${def.email}). Nothing to do.`);
      stores.push(existing);
    } else {
      const ownerId = def.ownerIdx !== null ? owners[def.ownerIdx].id : null;
      const store = storeRepo.create({
        name: def.name,
        email: def.email,
        address: def.address,
        ownerId,
      });
      await storeRepo.save(store);
      console.log(`Created store: ${def.email}${ownerId ? ` (owned by ${owners[def.ownerIdx].email})` : ' (unassigned)'}`);
      stores.push(store);
      storesCreated++;
    }
  }

  // ── 5. Ratings (at least 30 ratings) ──────────────────────────────────
  // Deterministic ratings array: [storeIndex, userIdIndex, score]
  // Designed so different stores have different average ratings:
  //   Store 0 (TechHub)      → ~4.5  (high)
  //   Store 1 (FreshDaily)   → ~3.0  (middling)
  //   Store 2 (BookWorm)     → ~4.0  (good)
  //   Store 3 (CoffeeBean)   → ~2.0  (low)
  //   Store 4 (Fashionista)  → ~3.5  (decent)
  //   Store 5 (QuickFix)     → ~4.2  (good)
  //   Store 6 (SweetDelights)→ ~1.5  (very low)
  //   Store 7 (BuildRight)   → ~3.8  (good)
  const ratingEntries: [number, number, number][] = [
    // Store 0: TechHub (avg ~4.5)
    [0, 0, 5], [0, 1, 5], [0, 2, 4], [0, 3, 5], [0, 4, 5],
    [0, 5, 4], [0, 6, 5], [0, 7, 4],
    // Store 1: FreshDaily (avg ~3.0)
    [1, 0, 3], [1, 2, 3], [1, 4, 4], [1, 5, 2], [1, 6, 3],
    [1, 8, 3], [1, 9, 3],
    // Store 2: BookWorm (avg ~4.0)
    [2, 1, 4], [2, 3, 5], [2, 5, 4], [2, 6, 4], [2, 7, 3],
    [2, 8, 4], [2, 9, 4],
    // Store 3: CoffeeBean (avg ~2.0)
    [3, 0, 2], [3, 1, 2], [3, 6, 3], [3, 7, 1], [3, 9, 2],
    [3, 2, 2], [3, 4, 2],
    // Store 4: Fashionista (avg ~3.5)
    [4, 2, 4], [4, 3, 3], [4, 4, 4], [4, 5, 3], [4, 8, 4],
    [4, 1, 3], [4, 6, 4],
    // Store 5: QuickFix (avg ~4.2)
    [5, 0, 5], [5, 1, 4], [5, 4, 5], [5, 6, 4], [5, 9, 3],
    [5, 2, 5], [5, 3, 4],
    // Store 6: SweetDelights (avg ~1.5)
    [6, 2, 2], [6, 5, 1], [6, 7, 2], [6, 8, 1], [6, 9, 2],
    [6, 3, 2], [6, 4, 1],
    // Store 7: BuildRight (avg ~3.8)
    [7, 1, 4], [7, 3, 4], [7, 4, 3], [7, 6, 4], [7, 7, 4],
    [7, 0, 4], [7, 5, 4],
  ];

  for (const [storeIdx, userIdx, score] of ratingEntries) {
    const store = stores[storeIdx];
    const user = normalUsers[userIdx];
    const existing = await ratingRepo.findOne({ where: { userId: user.id, storeId: store.id } });
    if (existing) {
      console.log(`Rating already exists (${user.email} → ${store.email}). Nothing to do.`);
    } else {
      const rating = ratingRepo.create({
        rating: score,
        userId: user.id,
        storeId: store.id,
      });
      await ratingRepo.save(rating);
      ratingsCreated++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log('\nSeeding Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Admins created:        ${adminsCreated}`);
  console.log(`  Store Owners created:  ${ownersCreated}`);
  console.log(`  Normal Users created:  ${usersCreated}`);
  console.log(`  Stores created:        ${storesCreated}`);
  console.log(`  Ratings created:       ${ratingsCreated}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\nLogin Credentials (copy-paste friendly):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Admin       │ ${adminEmail} │ ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);
  for (const o of owners) {
    console.log(`  Store Owner │ ${o.email} │ Owner@1234`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  Sample Normal Users:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (let i = 0; i < 3; i++) {
    console.log(`  Normal User │ ${normalUsers[i].email} │ User@1234`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await dataSource.destroy();
  console.log('\nSeeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});