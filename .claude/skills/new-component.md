# Skill: new-component

Use this skill before building any new UI component in Portfolio Vision. It defines the exact conventions so the result fits the existing design without deviation.

---

## Non-negotiables

1. **No Tailwind utility classes.** Do not write `className="flex items-center gap-4 text-sm text-gray-400"`. Tailwind v4 is configured via `@theme` directives in `index.css`; no utility classes are generated from JSX. All styling is via `style={{...}}` using CSS variables.

2. **Use CSS variables for all colors, spacing tokens, and surfaces.** Never hardcode a hex value in a component unless it belongs in `colors.js` alongside the other hardcoded constants.

3. **Use existing utility classes** (`pv-btn-primary`, `pv-btn-ghost`, `pv-link-btn`, `pv-input`, `pv-select`, `pv-modal`, `pv-menu-item`, `pv-screen`) instead of rewriting their styles inline.

4. **Do not create new CSS classes** unless the pattern is used in 3+ places and the rule needs to be overridden by the mobile media query. One-off styles stay inline.

---

## Template: standard card

```jsx
<div style={{
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  overflow: 'hidden',
}}>
  {/* Optional header */}
  <div style={{ padding: '18px 24px 14px' }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Title</h3>
  </div>

  {/* Body */}
  <div style={{ padding: '0 24px 20px' }}>
    {/* content */}
  </div>
</div>
```

For a card with a distinct footer background:
```jsx
<div style={{ background: 'var(--card2)', padding: '18px 24px 20px' }}>
  {/* footer */}
</div>
```

---

## Template: modal

Use the `Modal` shell from `components/Modal.jsx`. It handles:
- Backdrop click → close
- Escape key → close
- Consistent padding, border-radius, and backdrop blur

```jsx
import Modal from './Modal';

function MyModal({ onClose }) {
  return (
    <Modal title="Dialog title" onClose={onClose} width={440}>
      {/* content */}
    </Modal>
  );
}
```

Render it conditionally in the parent: `{open && <MyModal onClose={() => setOpen(false)} />}`

If you build a custom overlay (not using `Modal`), you must replicate:
```jsx
// Outer div: backdrop click + blur
<div
  onClick={onClose}
  style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)', padding: 24 }}
>
  {/* Inner div: stop propagation */}
  <div onClick={(e) => e.stopPropagation()} style={{ ... }}>
    {/* content */}
  </div>
</div>
```
And register a `keydown` listener for `Escape` via `useEffect`.

---

## Template: toggle / segmented control

Use `<Seg>` for binary or small-option-count toggles.

```jsx
import Seg from './Seg';

// Standard size (header-level)
<Seg
  value={selected}
  onChange={setSelected}
  options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]}
/>

// Small (row-level, inline with inputs)
<Seg small value={inputType} onChange={setInputType}
  options={[{ value: 'amount', label: '$' }, { value: 'shares', label: '#' }]} />
```

---

## Template: dropdown menu

```jsx
<div
  style={{
    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
    minWidth: 200, background: 'var(--card2)', border: '1px solid var(--border2)',
    borderRadius: 16, padding: 6, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  }}
>
  {/* section label */}
  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)',
    letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 12px 6px' }}>
    Section
  </div>

  {/* item */}
  <button
    type="button"
    className="pv-menu-item"
    style={{ display: 'block', width: '100%', background: 'none', border: 'none',
      borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600,
      color: 'var(--text2)', cursor: 'pointer', textAlign: 'left' }}
  >
    Item label
  </button>

  {/* divider */}
  <div style={{ height: 1, background: 'var(--border2)', margin: '6px' }} />
</div>
```

Close on outside click: use a `useRef` on the container and a `mousedown` listener on `document`.

---

## Template: status / feedback message

```jsx
{/* Success */}
<div style={{ fontSize: 12.5, color: 'var(--green)',
  background: 'rgba(47,208,140,0.08)', border: '1px solid rgba(47,208,140,0.25)',
  borderRadius: 12, padding: '8px 12px' }}>
  Message here.
</div>

{/* Error */}
<div style={{ fontSize: 12.5, color: 'var(--red)',
  background: 'rgba(240,90,126,0.08)', border: '1px solid rgba(240,90,126,0.25)',
  borderRadius: 12, padding: '8px 12px' }}>
  Error message here.
</div>

{/* Warning */}
<div style={{ fontSize: 12.5, color: 'var(--amber)',
  background: 'rgba(244,185,66,0.08)', border: '1px solid rgba(244,185,66,0.25)',
  borderRadius: 12, padding: '10px 14px' }}>
  Warning here.
</div>
```

---

## Typography scale in use

| Use | fontSize | fontWeight | color |
|---|---|---|---|
| Card / modal heading | 15–19px | 700 | `var(--text)` |
| Section label (caps) | 11px | 700 | `var(--text3)`, `letterSpacing: '0.06em'`, `textTransform: 'uppercase'` |
| Body / inputs | 14px | 400 | `var(--text)` |
| Secondary / metadata | 13px | 400–600 | `var(--text2)` |
| Muted / hint | 12–12.5px | 400–600 | `var(--text3)` |
| Large stat number | 34–46px | 700–800 | `var(--text)`, `fontVariantNumeric: 'tabular-nums'` |

Ticker symbols: `fontWeight: 700`, `letterSpacing: '0.03em'`.

---

## Borders and radii in use

| Surface | borderRadius |
|---|---|
| Page card | 20–24px |
| Button (primary/ghost) | 999px (pill) |
| Input | 12px |
| Dropdown menu | 16px |
| Menu item | 10px |
| Inline badge / avatar | 999px |
| Status message | 12px |

---

## Mobile

Before finishing, check the `@media (max-width: 767px)` block in `index.css`. If your component uses any of the classes that block overrides (`.pv-screen`, `.pv-card`, `.pv-card-head`, etc.), your inline styles will be overridden by `!important` rules there — that's intentional. Do not fight it with more specificity.

If the new component needs its own mobile behavior, add a named class to the element and add the rule to the existing mobile block in `index.css`. Do not use inline `@media` queries.

---

## Checklist before finishing

- [ ] No Tailwind utility classes in `className`
- [ ] All colors are CSS variables, not hex literals
- [ ] Existing utility classes used where they apply
- [ ] Modals close on Escape and backdrop click
- [ ] Outside-click closes any dropdown (mousedown listener on document, cleaned up in useEffect)
- [ ] Mobile breakpoint checked — `@media (max-width: 767px)` in `index.css`
- [ ] No new CSS classes created for one-off rules
