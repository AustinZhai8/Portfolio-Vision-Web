import HorizBar from './HorizBar';

// v2 breakdown card — titled card mapping a {name, w, color}[] to bars.
export default function ChartSection({ title, data, animKey }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.w));

  return (
    <div style={{ flex: 1, minWidth: 300, background: 'var(--card)', borderRadius: 20, padding: '22px 24px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{title}</h3>
      {data.map((d) => (
        <HorizBar key={d.name} name={d.name} w={d.w} color={d.color} max={max} animKey={animKey} />
      ))}
    </div>
  );
}
