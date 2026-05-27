import type { Palette, Translation } from '../../types/content';

interface BookingStripProps {
  P: Palette;
  T: Translation;
}

export function BookingStrip({ P, T }: BookingStripProps) {
  return (
    <section
      id="booking"
      style={{
        background: P.paper,
        borderTop: `1px solid ${P.line}`,
        borderBottom: `1px solid ${P.line}`,
        padding: '32px 0',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Check-in */}
        <div style={{ flex: '1 1 150px', minWidth: 140 }}>
          <label
            className="mono-label"
            style={{ display: 'block', marginBottom: 8, color: P.inkMute }}
          >
            {T.bookCheckIn}
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${P.line}`,
              padding: '8px 0',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: P.ink,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Check-out */}
        <div style={{ flex: '1 1 150px', minWidth: 140 }}>
          <label
            className="mono-label"
            style={{ display: 'block', marginBottom: 8, color: P.inkMute }}
          >
            {T.bookCheckOut}
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${P.line}`,
              padding: '8px 0',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: P.ink,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Guests */}
        <div style={{ flex: '1 1 100px', minWidth: 90 }}>
          <label
            className="mono-label"
            style={{ display: 'block', marginBottom: 8, color: P.inkMute }}
          >
            {T.bookGuests}
          </label>
          <select
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${P.line}`,
              padding: '8px 0',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: P.ink,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Villa */}
        <div style={{ flex: '1 1 150px', minWidth: 140 }}>
          <label
            className="mono-label"
            style={{ display: 'block', marginBottom: 8, color: P.inkMute }}
          >
            {T.bookVilla}
          </label>
          <select
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${P.line}`,
              padding: '8px 0',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: P.ink,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="">— すべて —</option>
            {T.villas.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          className="btn accent"
          onClick={() => alert('予約システム連携は近日公開')}
          style={{ flexShrink: 0, cursor: 'pointer' }}
        >
          {T.bookCheck} <span className="arr">→</span>
        </button>
      </div>
    </section>
  );
}
