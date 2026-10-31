// Fills the store with 6 categories x 110 products = 660 sample products (prices in Indian rupees).
//
//   node seed.js            adds any missing products (safe to run again, no duplicates)
//   node seed.js --fresh    first deletes all products that were never ordered, then adds everything
//
// Names, prices, stock and ratings are generated from fixed rules, so every run gives the same result.
require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize, Category, Product, OrderItem } = require('./models');

// [product type, base price in rupees, short feature phrase]
const types = {
  'Electronics': {
    suffixes: ['Black', 'White', 'Blue', 'Grey', 'Red', 'Green'],
    items: [
      ['Wireless Earbuds', 1499, 'Bluetooth 5.3 with charging case and long playtime'],
      ['Smart Watch', 2999, 'tracks steps, heart rate and sleep'],
      ['Bluetooth Speaker', 1799, 'portable speaker with deep bass'],
      ['Power Bank 10000mAh', 899, 'compact power bank with fast charging'],
      ['Power Bank 20000mAh', 1499, 'high capacity power bank with two USB ports'],
      ['Wired Earphones', 399, 'tangle-free earphones with in-line mic'],
      ['USB-C Fast Charger', 699, 'compact wall charger for phones and tablets'],
      ['USB-C Cable', 249, 'braided charging and data cable'],
      ['Wireless Mouse', 599, 'silent-click mouse with long battery life'],
      ['Mechanical Keyboard', 2499, 'backlit keyboard with tactile switches'],
      ['Laptop Stand', 999, 'foldable stand with adjustable height'],
      ['Webcam 1080p', 1699, 'full HD webcam with built-in microphone'],
      ['Pen Drive 64GB', 599, 'USB 3.0 pen drive with fast transfer speed'],
      ['Portable SSD 1TB', 6999, 'pocket-sized external SSD'],
      ['Phone Tripod', 449, 'adjustable tripod with remote shutter'],
      ['LED Ring Light', 1099, 'ring light with phone holder and three modes'],
      ['Smart LED Bulb', 599, 'WiFi bulb with millions of colours'],
      ['Bluetooth Neckband', 1099, 'lightweight neckband with 30 hour battery'],
      ['Gaming Headset', 2199, 'surround sound with noise-cancelling mic'],
      ['Wireless Charger', 999, '15W fast wireless charging pad'],
      ['Memory Card 128GB', 799, 'high speed card for phones and cameras'],
      ['Bluetooth Soundbar', 3999, 'home soundbar with deep bass and remote'],
    ],
  },
  'Fashion': {
    suffixes: ['Black', 'Navy', 'Maroon', 'Olive', 'Grey', 'White'],
    items: [
      ['Cotton T-Shirt', 499, 'soft 100% cotton crew neck'],
      ['Polo T-Shirt', 699, 'breathable pique fabric with collar'],
      ['Formal Shirt', 999, 'wrinkle-resistant shirt for office wear'],
      ['Casual Shirt', 899, 'relaxed fit shirt for everyday wear'],
      ['Slim Fit Jeans', 1399, 'stretch denim with a slim fit'],
      ['Chino Trousers', 1199, 'smart casual trousers in soft cotton twill'],
      ['Track Pants', 799, 'breathable pants with zip pockets'],
      ['Denim Jacket', 2199, 'classic denim jacket with button front'],
      ['Hooded Sweatshirt', 1299, 'warm fleece hoodie with front pocket'],
      ['Cotton Kurta', 899, 'straight-cut kurta for daily and festive wear'],
      ['Anarkali Kurti', 1199, 'flared kurti with printed yoke'],
      ['Cotton Saree', 1599, 'lightweight saree with woven border'],
      ['Silk Blend Saree', 2499, 'rich silk blend saree with blouse piece'],
      ['Leather Belt', 499, 'genuine leather belt with matte buckle'],
      ['Leather Wallet', 649, 'slim bi-fold wallet with card slots'],
      ['UV400 Sunglasses', 699, 'polarised lenses with UV protection'],
      ['Analog Wrist Watch', 1599, 'classic watch with steel strap'],
      ['Canvas Sneakers', 1399, 'lightweight sneakers with cushioned insole'],
      ['Formal Shoes', 2199, 'lace-up shoes with durable sole'],
      ['Sandals', 799, 'comfortable sandals with cushioned footbed'],
      ['Women\'s Handbag', 1299, 'spacious handbag with zip closure'],
      ['Palazzo Pants', 649, 'flowy palazzo pants in soft viscose'],
    ],
  },
  'Home & Kitchen': {
    suffixes: ['Steel', 'White', 'Brown', 'Blue', 'Grey', 'Red'],
    items: [
      ['Ceramic Mug Set', 799, 'set of 4 glazed mugs, microwave safe'],
      ['Non-Stick Frying Pan', 999, '26 cm pan for gas and induction'],
      ['Non-Stick Tawa', 649, 'flat tawa for dosa and roti'],
      ['Pressure Cooker 3L', 1699, 'aluminium cooker with safety valve'],
      ['Pressure Cooker 5L', 2199, 'family size cooker with safety valve'],
      ['Electric Kettle', 899, 'auto shut-off kettle, 1.5 litre'],
      ['Mixer Grinder', 2999, '500W mixer grinder with three jars'],
      ['Induction Cooktop', 2199, 'touch control cooktop with preset menus'],
      ['Air Fryer 4L', 4999, 'digital air fryer with cooking presets'],
      ['Dinner Set 24 Pieces', 1999, 'microwave-safe dinner set for six'],
      ['Steel Lunch Box', 599, 'leak-proof stainless steel lunch box'],
      ['Glass Storage Jars Set', 749, 'airtight jars for spices and snacks'],
      ['Wall Clock', 649, 'silent sweep wall clock'],
      ['Towel Set', 549, 'quick-dry soft towels, pack of four'],
      ['Cushion Cover Set', 499, 'printed covers with hidden zip, pack of five'],
      ['Door Mat', 349, 'anti-slip mat with rubber backing'],
      ['Kitchen Knife Set', 699, 'stainless steel knives with block'],
      ['Bedsheet Set', 1399, 'double bedsheet with two pillow covers'],
      ['Curtains Set of 2', 999, 'room darkening curtains with eyelet rings'],
      ['Storage Organiser', 599, 'foldable fabric organiser for wardrobe'],
      ['LED Table Lamp', 749, 'dimmable lamp with USB charging port'],
      ['Steel Water Jug', 599, 'leak-proof jug with lid, 2 litre'],
    ],
  },
  'Books & Stationery': {
    suffixes: ['Blue', 'Red', 'Green', 'Black', 'Assorted', 'Pastel'],
    items: [
      ['Spiral Notebook Pack', 399, 'five ruled A5 notebooks, 120 pages each'],
      ['Gel Pen Set', 169, 'twelve smooth-writing gel pens'],
      ['Daily Planner', 549, 'hardcover planner with goal pages'],
      ['Sketchbook A4', 399, '100 sheets of thick acid-free paper'],
      ['Highlighter Set', 219, 'pastel highlighters with chisel tips'],
      ['Sticky Notes Pack', 119, 'pack of 8 sticky note pads'],
      ['Geometry Box', 279, 'metal box with compass and protractor'],
      ['A4 Paper Ream', 449, '500 sheets of bright white 75 GSM paper'],
      ['Desk Organiser', 499, 'wooden organiser with pen stand'],
      ['Colour Pencils 48 Shades', 399, 'smooth, vibrant colour pencils'],
      ['Watercolour Paint Set', 449, '24 colours with brush and palette'],
      ['Scientific Calculator', 849, '240 function calculator for school and college'],
      ['Whiteboard with Markers', 649, 'magnetic board with three markers'],
      ['File Folders Pack', 319, 'plastic folders with snap closure, pack of 10'],
      ['Hardcover Journal', 399, 'dotted journal with ribbon bookmark'],
      ['Mathematics Workbook', 269, 'graded practice problems with examples'],
      ['English Grammar Workbook', 249, 'exercises on tenses and vocabulary'],
      ['Science Practice Workbook', 269, 'practice questions with solutions'],
      ['Fountain Pen', 349, 'smooth nib pen with ink cartridges'],
      ['Marker Pen Set', 249, 'permanent markers in assorted colours'],
      ['Stapler with Pins', 249, 'sturdy stapler with 1000 pins'],
      ['Paper Clips and Pins Kit', 149, 'office essentials in one box'],
    ],
  },
  'Beauty & Care': {
    suffixes: ['100 ml', '200 ml', '250 ml', '400 ml', 'Pack of 2', 'Value Pack'],
    items: [
      ['Aloe Vera Face Gel', 229, 'light gel that soothes and hydrates'],
      ['Herbal Shampoo', 349, 'gentle daily shampoo with amla and hibiscus'],
      ['Hair Conditioner', 349, 'smoothing conditioner for soft hair'],
      ['Beard Trimmer', 999, 'rechargeable trimmer with length settings'],
      ['Scented Candle', 449, 'hand-poured soy wax candle'],
      ['Sunscreen SPF 50', 449, 'non-greasy sunscreen with PA+++'],
      ['Vitamin C Face Serum', 549, 'brightening serum for glowing skin'],
      ['Moisturising Cream', 299, 'daily face and body cream'],
      ['Coconut Hair Oil', 199, 'cold-pressed oil for hair and skin'],
      ['Hair Dryer', 799, 'foldable dryer with two heat settings'],
      ['Face Wash', 229, 'oil-control face wash with neem'],
      ['Lip Balm', 229, 'moisturising balm in three flavours'],
      ['Body Lotion', 399, 'deep moisture lotion with shea butter'],
      ['Bamboo Toothbrush Pack', 229, 'eco-friendly toothbrushes, pack of four'],
      ['Electric Toothbrush', 1399, 'rechargeable brush with three modes'],
      ['Perfume Spray', 799, 'long-lasting fresh woody fragrance'],
      ['Deodorant', 279, '48 hour freshness body spray'],
      ['Hair Straightener', 1599, 'ceramic plates with temperature control'],
      ['Face Mask Sheets', 349, 'hydrating sheet masks, pack of ten'],
      ['Kajal and Eyeliner Set', 249, 'smudge-proof kajal and liquid eyeliner'],
      ['Nail Polish Set', 349, 'six glossy shades, quick drying'],
      ['Shaving Kit', 599, 'razor, foam and aftershave in a pouch'],
    ],
  },
  'Sports & Fitness': {
    suffixes: ['Black', 'Blue', 'Red', 'Green', 'Orange', 'Grey'],
    items: [
      ['Yoga Mat', 699, '6 mm non-slip mat with carry strap'],
      ['Running Shoes', 2699, 'lightweight shoes with cushioned sole'],
      ['Adjustable Dumbbell Pair', 2199, 'adjustable from 2 kg to 10 kg each'],
      ['Steel Water Bottle', 499, 'keeps drinks cold for 24 hours'],
      ['Skipping Rope', 229, 'adjustable speed rope with foam handles'],
      ['Resistance Bands Set', 549, 'five bands with different resistance'],
      ['Cricket Bat', 1599, 'Kashmir willow bat with cane handle'],
      ['Cricket Ball Pack', 449, 'hard tennis cricket balls, pack of three'],
      ['Football Size 5', 799, 'machine-stitched ball for training and matches'],
      ['Badminton Racket Pair', 999, 'two graphite rackets with cover'],
      ['Shuttlecock Pack', 349, 'ten nylon shuttlecocks'],
      ['Gym Gloves', 399, 'padded gloves with wrist support'],
      ['Foam Roller', 799, 'high-density roller for muscle recovery'],
      ['Push-Up Bars', 449, 'non-slip stands with comfortable grips'],
      ['Fitness Tracker Band', 1399, 'tracks steps, calories and sleep'],
      ['Gym Duffel Bag', 899, 'spacious bag with shoe compartment'],
      ['Ab Roller', 399, 'dual-wheel roller with knee mat'],
      ['Sports Water Jug', 399, 'BPA-free 2 litre jug with time markings'],
      ['Basketball Size 7', 899, 'durable rubber ball for indoor and outdoor'],
      ['Swimming Goggles', 449, 'anti-fog goggles with UV protection'],
      ['Cycling Helmet', 1199, 'ventilated helmet with adjustable fit'],
      ['Table Tennis Racket Set', 799, 'two rackets, three balls and a case'],
    ],
  },
};

// Five versions of every product type
const tiers = [
  { name: 'Lite', mult: 0.8 },
  { name: 'Classic', mult: 1.0 },
  { name: 'Premium', mult: 1.2 },
  { name: 'Pro', mult: 1.4 },
  { name: 'Max', mult: 1.65 },
];

// Price endings like 499, 1,499, 2,999 (always at least Rs 99)
function nicePrice(p) {
  let r;
  if (p >= 1000) r = Math.round(p / 100) * 100 - 1;
  else if (p >= 200) r = Math.round(p / 50) * 50 - 1;
  else r = Math.round(p / 10) * 10 - 1;
  return Math.max(r, 99);
}

// Small repeatable random generator, so every run produces the same data
function makeRandom(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCatalog() {
  const rand = makeRandom(2027);
  const catalog = {};
  for (const [catName, { suffixes, items }] of Object.entries(types)) {
    const list = [];
    items.forEach(([type, base, phrase], ti) => {
      tiers.forEach((tier, i) => {
        const suffix = suffixes[(ti + i * 2) % suffixes.length];
        const roll = rand();
        let stock = Math.floor(rand() * 110) + 10;
        if (roll < 0.03) stock = 0;                    // a few sold out
        else if (roll < 0.09) stock = Math.floor(rand() * 5) + 1; // a few low stock
        const rating = Math.round((3.6 + rand() * 1.2) * 10) / 10;
        list.push({
          name: `${tier.name} ${type} - ${suffix}`,
          price: nicePrice(base * tier.mult),
          stock,
          rating,
          description: `${tier.name} edition ${type.toLowerCase()} in ${suffix}: ${phrase}.`,
        });
      });
    });
    catalog[catName] = list;
  }
  return catalog;
}

async function main() {
  const fresh = process.argv.includes('--fresh');
  await sequelize.sync();

  if (fresh) {
    const used = (await OrderItem.findAll({ attributes: ['product_id'], group: ['product_id'] })).map((r) => r.product_id);
    const removed = await Product.destroy({ where: used.length ? { id: { [Op.notIn]: used } } : {} });
    console.log(`Removed ${removed} old products (products that have orders are kept).`);
  }

  const existing = new Set((await Product.findAll({ attributes: ['name'] })).map((p) => p.name));
  const catalog = buildCatalog();
  let added = 0;

  for (const [catName, list] of Object.entries(catalog)) {
    const [cat] = await Category.findOrCreate({ where: { name: catName } });
    const fresh = list.filter((p) => !existing.has(p.name)).map((p) => ({ ...p, category_id: cat.id }));
    for (let i = 0; i < fresh.length; i += 200) {
      await Product.bulkCreate(fresh.slice(i, i + 200));
    }
    added += fresh.length;
    console.log(`${catName}: ${list.length} products (${fresh.length} new)`);
  }

  console.log(`Done. ${added} products added.`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = { buildCatalog };
