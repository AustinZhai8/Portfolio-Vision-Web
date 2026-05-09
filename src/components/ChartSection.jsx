import HorizBar from './HorizBar';

export default function ChartSection({ title, data, animKey }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.w));

  return (
    <div
      style={{
        flex: 1,
        background: '#0f1825',
        border: '1px solid #182335',
        borderRadius: 4,
        padding: '14px 16px',
        overflow: 'auto',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--text2)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {data.map((d) => (
        <HorizBar
          key={d.name}
          name={d.name}
          w={d.w}
          color={d.color}
          max={max}
          animKey={animKey}
        />
      ))}
    </div>
  );
}
