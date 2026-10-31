import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { catColor, money } from '../lib.js';

// The tile picture is chosen from words in the product name (first match wins)
const ICON_RULES = [
  ['earbud', '🎧'], ['earphone', '🎧'], ['neckband', '🎧'], ['gaming headset', '🎮'],
  ['watch', '⌚'], ['tracker', '⌚'], ['speaker', '🔊'], ['soundbar', '📻'], ['power bank', '🔋'],
  ['charger', '🔌'], ['cable', '🔌'], ['mouse', '🖱️'], ['keyboard', '⌨️'], ['laptop', '💻'],
  ['webcam', '📷'], ['pen drive', '💾'], ['memory card', '💾'], ['ssd', '💽'], ['tripod', '📱'],
  ['ring light', '💡'], ['bulb', '💡'], ['lamp', '💡'],
  ['sweatshirt', '🧥'], ['t-shirt', '👕'], ['shirt', '👔'], ['jeans', '👖'], ['trousers', '👖'],
  ['track pants', '👖'], ['palazzo', '👖'], ['jacket', '🧥'], ['kurta', '👘'], ['kurti', '👗'],
  ['saree', '🥻'], ['belt', '🧷'], ['wallet', '👛'], ['sunglasses', '🕶️'], ['sneakers', '👟'],
  ['running shoes', '👟'], ['formal shoes', '👞'], ['sandals', '🩴'], ['handbag', '👜'],
  ['mug', '☕'], ['frying pan', '🍳'], ['tawa', '🍳'], ['cooker', '🍲'], ['kettle', '🫖'],
  ['mixer', '🥤'], ['cooktop', '🔥'], ['air fryer', '🍟'], ['dinner set', '🍽️'], ['lunch box', '🍱'],
  ['jars', '🍯'], ['wall clock', '🕒'], ['towel', '🧺'], ['cushion', '🛋️'], ['door mat', '🚪'],
  ['knife', '🔪'], ['bedsheet', '🛏️'], ['curtains', '🪟'], ['desk organiser', '🗄️'], ['organiser', '📦'],
  ['sports water jug', '🥤'], ['water jug', '🥛'],
  ['notebook', '📓'], ['gel pen', '🖊️'], ['planner', '📅'], ['sketchbook', '🎨'], ['highlighter', '🖍️'],
  ['sticky notes', '🗒️'], ['geometry', '📐'], ['paper ream', '📄'], ['colour pencils', '✏️'],
  ['watercolour', '🎨'], ['calculator', '🧮'], ['whiteboard', '📋'], ['file folders', '📁'],
  ['journal', '📔'], ['mathematics', '📘'], ['grammar', '📗'], ['science', '📙'], ['fountain pen', '🖋️'],
  ['marker', '🖊️'], ['stapler', '📎'], ['paper clips', '📎'],
  ['aloe', '🌿'], ['shampoo', '🧴'], ['conditioner', '🧴'], ['beard', '🧔'], ['candle', '🕯️'],
  ['sunscreen', '☀️'], ['serum', '🍊'], ['cream', '🧴'], ['hair oil', '🥥'], ['hair dryer', '💇'],
  ['face wash', '🧼'], ['lip balm', '💄'], ['lotion', '🧴'], ['toothbrush', '🪥'], ['perfume', '🌸'],
  ['deodorant', '🧴'], ['straightener', '✨'], ['face mask', '🧖'], ['eyeliner', '👁️'],
  ['nail polish', '💅'], ['shaving', '🪒'],
  ['yoga', '🧘'], ['dumbbell', '🏋️'], ['water bottle', '🥤'], ['skipping', '💪'], ['resistance', '💪'],
  ['cricket bat', '🏏'], ['cricket ball', '🔴'], ['football', '⚽'], ['badminton', '🏸'],
  ['shuttlecock', '🏸'], ['gym gloves', '🧤'], ['foam roller', '💆'], ['push-up', '💪'],
  ['duffel', '🎒'], ['ab roller', '🏋️'], ['basketball', '🏀'], ['goggles', '🥽'], ['helmet', '🚴'],
  ['table tennis', '🏓'],
];

function iconFor(name = '') {
  const n = name.toLowerCase();
  const hit = ICON_RULES.find(([word]) => n.includes(word));
  return hit ? hit[1] : null;
}

export function ProductImage({ product, className = '' }) {
  const [failed, setFailed] = useState(false);
  const color = catColor(product.category_id);

  // 1) a real photo link, if the admin added one
  if (product.image_url && !failed) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ background: color }}
        className={`object-cover ${className}`}
      />
    );
  }

  // 2) otherwise a coloured tile with an icon picked from the product name
  const icon = iconFor(product.name);
  return (
    <div
      role="img"
      aria-label={product.name}
      className={`flex items-center justify-center ${className}`}
      style={{ background: color }}
    >
      {icon ? (
        <span className="flex aspect-square w-3/5 max-w-[9rem] items-center justify-center rounded-full bg-white/25 text-[3.5rem] leading-none sm:text-[4.5rem]">
          {icon}
        </span>
      ) : (
        <span className="font-display text-5xl font-bold text-white">{product.name?.[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { add } = useCart();
  const soldOut = product.stock < 1;
  const color = catColor(product.category_id);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/10">
      <Link to={`/product/${product.id}`} className="relative block">
        <ProductImage product={product} className="aspect-square w-full" />
        <span className="absolute bottom-2 left-2 -rotate-2 rounded-md bg-tag px-2.5 py-1 font-display text-lg font-bold shadow">
          {money(product.price)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.Category && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {product.Category.name}
          </span>
        )}
        <Link to={`/product/${product.id}`} className="font-bold leading-snug hover:underline">{product.name}</Link>
        <span className="text-sm text-ink/70">
          {Number(product.rating) > 0 ? `${Number(product.rating).toFixed(1)} out of 5` : 'No ratings yet'}
        </span>
        <button className="btn btn-primary mt-auto" disabled={soldOut} onClick={() => add(product)}>
          {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
