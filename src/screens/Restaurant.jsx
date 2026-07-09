import React, { useMemo, useState } from 'react';
import { ChevronLeft, Search, Lock, Sparkles, Check, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { RESTAURANT_MENUS, RESTAURANT_NAMES, searchRestaurants } from '../services/restaurantData';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };

const TINTS = ['#43C6AC', '#E7B67C', '#5FD4C4', '#E1A0AB', '#8CE0CE', '#AEA6EA'];

// Cuisine grouping for the chips (chains carry no cuisine field in the data).
const CUISINE = {
  chipotle: 'mexican', pandaexpress: 'asian', sweetgreen: 'salads', cava: 'mediterranean',
  panera: 'salads', chickfila: 'chicken', mcdonalds: 'burgers', shakeshack: 'burgers',
  subway: 'sandwiches', jerseymikes: 'sandwiches', starbucks: 'cafe', wholefoods: 'grocery',
  traderjoes: 'grocery', snacksbars: 'snacks',
};
const CUISINES = ['all', 'salads', 'mexican', 'mediterranean', 'chicken', 'burgers', 'sandwiches', 'asian', 'cafe', 'snacks', 'grocery'];

const FILTERS = [
  { key: 'protein', label: 'most protein' },
  { key: 'cal', label: 'lowest cal' },
  { key: 'best', label: 'best macros' },
  { key: 'bal', label: 'balanced' },
];

// Score used by "best macros": reward protein density, penalize calories.
function macroScore(it) {
  return (it.protein || 0) * 4 - (it.calories || 0) * 0.02;
}

function sortItems(items, filter) {
  const list = [...items];
  if (filter === 'protein') return list.sort((a, b) => (b.protein || 0) - (a.protein || 0));
  if (filter === 'cal') return list.sort((a, b) => (a.calories || 0) - (b.calories || 0));
  if (filter === 'best') return list.sort((a, b) => macroScore(b) - macroScore(a));
  // balanced: closest protein:carb:fat spread to a 30/40/30 cal split
  return list.sort((a, b) => balancedDist(a) - balancedDist(b));
}
function balancedDist(it) {
  const pc = (it.protein || 0) * 4, cc = (it.carbs || 0) * 4, fc = (it.fat || 0) * 9;
  const tot = pc + cc + fc || 1;
  return Math.abs(pc / tot - 0.3) + Math.abs(cc / tot - 0.4) + Math.abs(fc / tot - 0.3);
}

function chipStyle(active) {
  return {
    flex: 'none', padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
    font: '600 12px var(--font-ui)', whiteSpace: 'nowrap', transition: 'all .16s var(--ease-out)',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    background: active ? 'var(--primary)' : 'var(--surface-2)',
    border: active ? '1px solid transparent' : '1px solid var(--glass-border)',
  };
}

export function Restaurant({ onFab }) {
  const { isPremiumActive, openPremiumModal, logMeal, setActiveTab } = useApp();
  const { remaining } = useMacros();

  const [openChain, setOpenChain] = useState(null); // slug | null → browse vs menu
  const [cuisine, setCuisine] = useState('all');
  const [filter, setFilter] = useState('protein');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  const premium = isPremiumActive();

  const chains = useMemo(() => Object.keys(RESTAURANT_MENUS).map((slug, i) => ({
    slug,
    name: (RESTAURANT_NAMES[slug] || slug).toLowerCase(),
    cuisine: CUISINE[slug] || 'other',
    count: RESTAURANT_MENUS[slug].length,
    letter: (RESTAURANT_NAMES[slug] || slug).charAt(0).toUpperCase(),
    tint: `linear-gradient(140deg,${TINTS[i % TINTS.length]},var(--brand-mint,#8CE0CE))`,
  })), []);

  const q = query.trim();
  const searchResults = useMemo(() => (q.length >= 2 ? searchRestaurants(q) : []), [q]);

  const visibleChains = useMemo(
    () => chains.filter(c => cuisine === 'all' || c.cuisine === cuisine),
    [chains, cuisine]
  );

  const menuItems = useMemo(() => {
    if (!openChain) return [];
    return sortItems(RESTAURANT_MENUS[openChain] || [], filter);
  }, [openChain, filter]);

  // An item "fits your day" when every macro stays within what's remaining.
  const fitsRemaining = (it) =>
    (it.calories || 0) <= (remaining.calories || 0) &&
    (it.protein || 0) <= (remaining.protein || 0) + 6 && // small protein grace — over-hitting protein is fine
    (it.carbs || 0) <= (remaining.carbs || 0) &&
    (it.fat || 0) <= (remaining.fat || 0);

  const flashToast = (msg) => {
    setToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setToast(null), 1800);
  };

  const doLog = (it, chainName) => {
    logMeal({
      name: it.name,
      calories: Math.round(it.calories || 0),
      protein: Math.round(it.protein || 0),
      carbs: Math.round(it.carbs || 0),
      fat: Math.round(it.fat || 0),
      type: 'restaurant',
      slot: chainName || 'restaurant',
    });
    flashToast(`logged ${it.name.toLowerCase()}`);
  };

  // Back steps out of an open menu first, otherwise leaves the screen to the meals tab.
  const back = () => (openChain ? setOpenChain(null) : setActiveTab('meals'));

  // onFab is passed by the shell for the global add sheet. This screen logs inline,
  // so it exposes it as an optional shortcut from the empty search state rather than the FAB.
  const quickAdd = () => (onFab ? onFab() : setActiveTab('log'));

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 20px 12px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={back}
          aria-label="Back"
          style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>restaurant</div>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {!premium && <LockOverlay onUnlock={openPremiumModal} />}

        {premium && !openChain && (
          <BrowseView
            query={query}
            setQuery={setQuery}
            searchResults={searchResults}
            cuisine={cuisine}
            setCuisine={setCuisine}
            visibleChains={visibleChains}
            onOpenChain={setOpenChain}
            fitsRemaining={fitsRemaining}
            onLog={doLog}
            onQuickAdd={quickAdd}
          />
        )}

        {premium && openChain && (
          <MenuView
            slug={openChain}
            filter={filter}
            setFilter={setFilter}
            items={menuItems}
            fitsRemaining={fitsRemaining}
            onLog={doLog}
            onBack={() => setOpenChain(null)}
          />
        )}
      </div>

      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(var(--nav-safe-pad, 26px) + 10px)', zIndex: 9, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '12px 17px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ color: 'var(--brand-jade)', display: 'inline-flex' }}><Check size={15} strokeWidth={2.6} /></span>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Locked (free users) ---------- */

function LockOverlay({ onUnlock }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '46px 24px', gap: 6, minHeight: 480 }}>
      <div style={{ width: 82, height: 82, borderRadius: 24, background: 'linear-gradient(140deg, rgba(231,182,124,.2), rgba(231,182,124,.06))', border: '1px solid rgba(231,182,124,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
        <Lock size={34} strokeWidth={1.7} />
      </div>
      <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 999, background: 'rgba(231,182,124,.14)', color: 'var(--warning)', font: '700 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase' }}>plato plus</div>
      <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>restaurant mode</div>
      <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 270, lineHeight: 1.55 }}>
        log real menu macros from 14+ chains and find on-plan picks that fit your day.
      </div>
      <button
        onClick={onUnlock}
        style={{ marginTop: 20, height: 52, padding: '0 30px', border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <Sparkles size={17} />start free trial
      </button>
      <div style={{ marginTop: 12, font: '500 12px var(--font-ui)', color: 'var(--muted)' }}>48 hours free · cancel anytime</div>
    </div>
  );
}

/* ---------- Browse (chain grid + search) ---------- */

function BrowseView({ query, setQuery, searchResults, cuisine, setCuisine, visibleChains, onOpenChain, fitsRemaining, onLog, onQuickAdd }) {
  const searching = query.trim().length >= 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 14, ...cardStyle }}>
        <span style={{ color: 'var(--sage)', display: 'inline-flex', flex: 'none' }}><Search size={18} strokeWidth={1.75} /></span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search restaurants & items"
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: 'var(--ink)', font: '500 14px var(--font-ui)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search" style={{ flex: 'none', width: 24, height: 24, borderRadius: 999, border: 'none', background: 'var(--surface-3)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {searching ? (
        <SearchResults results={searchResults} fitsRemaining={fitsRemaining} onLog={onLog} onQuickAdd={onQuickAdd} />
      ) : (
        <>
          {/* Cuisine chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '1px 0' }} className="no-scrollbar">
            {CUISINES.map(c => (
              <button key={c} onClick={() => setCuisine(c)} style={chipStyle(cuisine === c)}>{c}</button>
            ))}
          </div>

          {/* Chain grid */}
          {visibleChains.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {visibleChains.map(ch => (
                <button
                  key={ch.slug}
                  onClick={() => onOpenChain(ch.slug)}
                  style={{ textAlign: 'left', ...cardStyle, borderRadius: 'var(--r-tile)', padding: 15, cursor: 'pointer' }}
                >
                  <span style={{ width: 44, height: 44, borderRadius: 13, background: ch.tint, color: '#04231C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{ch.letter}</span>
                  <div style={{ marginTop: 11, font: '700 15px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</div>
                  <div style={{ marginTop: 2, font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>{ch.cuisine} · {ch.count} items</div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '20px 16px', textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>
              no chains in this cuisine
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchResults({ results, fitsRemaining, onLog, onQuickAdd }) {
  if (!results.length) {
    return (
      <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '20px 16px', textAlign: 'center' }}>
        <div style={{ font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>no items match — try a dish or chain name</div>
        <button
          onClick={onQuickAdd}
          style={{ marginTop: 12, height: 40, padding: '0 18px', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-control)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 13px var(--font-ui)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} strokeWidth={2.4} />add it manually
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {results.map((it, i) => (
        <ItemRow
          key={`${it.restaurant}-${it.name}-${i}`}
          item={it}
          chainLabel={(it.restaurantName || '').toLowerCase()}
          fits={fitsRemaining(it)}
          onLog={() => onLog(it, it.restaurantName)}
        />
      ))}
    </div>
  );
}

/* ---------- Menu (single chain, sorted items) ---------- */

function MenuView({ slug, filter, setFilter, items, fitsRemaining, onLog, onBack }) {
  const name = (RESTAURANT_NAMES[slug] || slug).toLowerCase();
  const letter = (RESTAURANT_NAMES[slug] || slug).charAt(0).toUpperCase();
  const cuisine = CUISINE[slug] || 'menu';
  const fitCount = items.filter(fitsRemaining).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Chain header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          aria-label="Back to chains"
          style={{ width: 34, height: 34, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={17} />
        </button>
        <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 12, background: 'linear-gradient(140deg,#5FD4C4,#43C6AC)', color: '#04231C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{letter}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: '700 17px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>
            {cuisine}{fitCount > 0 ? ` · ${fitCount} fit your day` : ''}
          </div>
        </div>
      </div>

      {/* Sort filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '1px 0' }} className="no-scrollbar">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={chipStyle(filter === f.key)}>{f.label}</button>
        ))}
      </div>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it, i) => (
          <ItemRow
            key={`${it.name}-${i}`}
            item={it}
            fits={fitsRemaining(it)}
            onLog={() => onLog(it, name)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Shared item row ---------- */

function ItemRow({ item, chainLabel, fits, onLog }) {
  return (
    <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: '13px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {chainLabel && <div style={{ ...microLabel, marginBottom: 3 }}>{chainLabel}</div>}
          <div style={{ font: '600 15px var(--font-ui)', color: 'var(--ink)' }}>{item.name.toLowerCase()}</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--brand-jade)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(item.calories || 0)} kcal</span>
            <MacroChip label="p" value={item.protein} color="var(--macro-protein)" />
            <MacroChip label="c" value={item.carbs} color="var(--macro-carbs)" />
            <MacroChip label="f" value={item.fat} color="var(--macro-fat)" />
          </div>
        </div>
        <button
          onClick={onLog}
          style={{ flex: 'none', border: 'none', cursor: 'pointer', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 13px var(--font-ui)', padding: '8px 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Plus size={14} strokeWidth={2.4} />log
        </button>
      </div>
      {fits && (
        <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: 'rgba(67,198,172,.12)', color: 'var(--success)', font: '600 11px var(--font-ui)' }}>
          <Check size={12} strokeWidth={2.6} />fits your day
        </div>
      )}
    </div>
  );
}

function MacroChip({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--hairline)', font: '600 11px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flex: 'none' }} />
      {Math.round(value || 0)}{label}
    </span>
  );
}
