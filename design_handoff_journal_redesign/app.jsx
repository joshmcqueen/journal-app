// Journal app — modern dark redesign
// Two screens (Calendar + Entry), two layout modes (Grid + Timeline), tweakable.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const ACCENTS = {
  peach:    { name: 'Peach',   hue: 'oklch(82% 0.12 60)',  hueDim: 'oklch(70% 0.10 60)',  hueSoft: 'oklch(82% 0.12 60 / 0.12)' },
  gold:     { name: 'Gold',    hue: 'oklch(82% 0.13 85)',  hueDim: 'oklch(70% 0.11 85)',  hueSoft: 'oklch(82% 0.13 85 / 0.12)' },
  sage:     { name: 'Sage',    hue: 'oklch(80% 0.09 150)', hueDim: 'oklch(68% 0.08 150)', hueSoft: 'oklch(80% 0.09 150 / 0.12)' },
  lavender: { name: 'Lavender',hue: 'oklch(80% 0.09 290)', hueDim: 'oklch(68% 0.08 290)', hueSoft: 'oklch(80% 0.09 290 / 0.12)' },
};

const FONTS = {
  inter:    { name: 'Inter',    stack: "'Inter', -apple-system, system-ui, sans-serif" },
  geist:    { name: 'Geist',    stack: "'Geist', -apple-system, system-ui, sans-serif" },
  ibm:      { name: 'IBM Plex', stack: "'IBM Plex Sans', -apple-system, system-ui, sans-serif" },
};

const BGS = {
  jet:    { name: 'Jet',    base: '#0A0A0B', elev: '#121214', elev2: '#1A1A1D', line: 'rgba(255,255,255,0.06)' },
  ink:    { name: 'Ink',    base: '#0E0F13', elev: '#171820', elev2: '#1F2029', line: 'rgba(255,255,255,0.07)' },
  obsidian:{name: 'Obsidian',base: '#060608', elev: '#0E0E11', elev2: '#16161A', line: 'rgba(255,255,255,0.05)' },
};

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const ENTRIES = {
  10: { words: 142, preview: "Long morning walk before work. The light on the water was…" },
  11: { words: 208, preview: "Brunch with Mom. She's finally coming around to the idea of…" },
  12: { words: 98, preview: "Big Monday. Couldn't get focused until after lunch. The sprint…" },
  13: { words: 176, preview: "Kids had a great day at school. Coco brought home a painting…" },
  14: { words: 260, preview: "Deep work day. Got through the deploy checklist and finally…" },
  15: { words: 187, preview: "Today was the big go-live for Mondelez. We rolled out to 35,000…", full: true },
  16: { words: 132, preview: "Quiet evening. Read on the porch until it got too cold. Rossi…" },
  17: { words: 77, preview: "Short one today. Long week. Grateful to be home." },
  18: { words: 219, preview: "Saturday. Coffee, then the farmer's market. Got peaches, which…", today: true },
};

const FULL_ENTRY = `Today was the big go-live for Mondelez. We rolled out to 35,000 users, and everything went well. Work is in a good place right now.

While waiting for Jenn to get home, I walked down to the beach for a few minutes. Once she was back, we picked her up and headed to the park, but it was a short visit. There was a dog there that Rossi doesn't like, so we cut it quick.

I got a strength training session in out in the garage. Deadlifts, bicep curls, abs. Coco and Natalie came out and played for a bit while I was working out, which made it more fun.

After dinner I played a little Hollow Knight Silksong, then we headed to bed.`;

// ─────────────────────────────────────────────────────────────
// Icons — stroke only, thin
// ─────────────────────────────────────────────────────────────
const Icon = {
  chev: (dir, c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: dir === 'right' ? 'rotate(180deg)' : 'none' }}>
      <path d="M10 3L5 8l5 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  search: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke={c} strokeWidth="1.5"/>
      <path d="M13 13l-2.5-2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  sparkle: (c = 'currentColor') => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5v4M7 8.5v4M1.5 7h4M8.5 7h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M11 2l.8 1.2L13 4l-1.2.8L11 6l-.8-1.2L9 4l1.2-.8L11 2z" fill={c}/>
    </svg>
  ),
  book: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3.5c0-.6-.4-1-1-1H3v10h4c.6 0 1 .4 1 1m0-10c0-.6.4-1 1-1h4v10H9c-.6 0-1 .4-1 1" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="10" rx="1.5" stroke={c} strokeWidth="1.3"/>
      <path d="M2 6.5h12M5 2v2M11 2v2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  timeline: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="1.5" stroke={c} strokeWidth="1.3"/>
      <circle cx="4" cy="12" r="1.5" stroke={c} strokeWidth="1.3"/>
      <path d="M4 6v4M7.5 4h5M7.5 12h5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  settings: (c = 'currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.3"/>
      <path d="M8 2v1.5M8 12.5V14M14 8h-1.5M3.5 8H2M12.2 3.8l-1 1M4.8 11.2l-1 1M12.2 12.2l-1-1M4.8 4.8l-1-1" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const DAYS = ['S','M','T','W','T','F','S'];
const DAYS_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// April 2026: 1st is Wednesday → offset 3, 30 days
const MONTH_OFFSET = 3;
const MONTH_DAYS = 30;

// ─────────────────────────────────────────────────────────────
// App header
// ─────────────────────────────────────────────────────────────
function AppHeader({ title, right, t }) {
  return (
    <div style={{
      padding: '68px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: t.accent.hueSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.accent.hue,
        }}>
          {Icon.book()}
        </div>
        <div style={{
          fontFamily: t.font.stack, fontSize: 16, fontWeight: 600, color: '#fff',
          letterSpacing: -0.3,
        }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
  );
}

function HeaderButton({ children, onClick, active, t }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 10,
      background: active ? t.accent.hueSoft : 'transparent',
      border: `1px solid ${t.bg.line}`,
      color: active ? t.accent.hue : 'rgba(255,255,255,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// Calendar — Grid
// ─────────────────────────────────────────────────────────────
function CalendarGrid({ t, onPick }) {
  const today = 18;
  return (
    <div style={{ padding: '0 20px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Month stepper */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 0 20px',
      }}>
        <div>
          <div style={{
            fontFamily: t.font.stack, fontSize: 28, fontWeight: 600, color: '#fff',
            letterSpacing: -0.8, lineHeight: 1,
          }}>April</div>
          <div style={{
            fontFamily: t.font.stack, fontSize: 13, color: 'rgba(255,255,255,0.45)',
            marginTop: 4, fontVariantNumeric: 'tabular-nums',
          }}>2026 · 9 entries</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={navBtn(t)}>{Icon.chev('left')}</button>
          <button style={navBtn(t)}>{Icon.chev('right')}</button>
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
        fontFamily: t.font.stack, fontSize: 10, fontWeight: 500,
        color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
        letterSpacing: 1, padding: '0 0 10px',
      }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: MONTH_OFFSET }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: MONTH_DAYS }).map((_, i) => {
          const day = i + 1;
          const entry = ENTRIES[day];
          const isToday = day === today;
          return (
            <button key={day} onClick={() => entry && onPick(day)} style={{
              aspectRatio: '1 / 1.05',
              border: 'none', cursor: entry ? 'pointer' : 'default',
              background: entry ? t.bg.elev : 'transparent',
              borderRadius: 12,
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4,
              outline: isToday ? `1.5px solid ${t.accent.hue}` : 'none',
              outlineOffset: isToday ? -1.5 : 0,
              transition: 'transform 0.1s',
            }}>
              <div style={{
                fontFamily: t.font.stack, fontSize: 15,
                fontWeight: isToday ? 600 : 500,
                color: entry ? '#fff' : 'rgba(255,255,255,0.3)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}>{day}</div>
              {entry && (
                <div style={{
                  width: 4, height: 4, borderRadius: 99,
                  background: isToday ? t.accent.hue : 'rgba(255,255,255,0.35)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / stats strip */}
      <div style={{
        marginTop: 'auto', padding: 16, borderRadius: 16,
        background: t.bg.elev, border: `1px solid ${t.bg.line}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: t.font.stack, fontSize: 11, color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>This month</div>
          <div style={{
            fontFamily: t.font.stack, fontSize: 11, color: t.accent.hue, fontWeight: 500,
          }}>9 day streak</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Stat label="Entries" value="9" t={t} />
          <Stat label="Words" value="1,499" t={t} />
          <Stat label="Longest" value="260" t={t} accent />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, t, accent }) {
  return (
    <div>
      <div style={{
        fontFamily: t.font.stack, fontSize: 20, fontWeight: 600,
        color: accent ? t.accent.hue : '#fff', letterSpacing: -0.5,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{
        fontFamily: t.font.stack, fontSize: 11, color: 'rgba(255,255,255,0.4)',
        marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8,
      }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Calendar — Timeline
// ─────────────────────────────────────────────────────────────
function CalendarTimeline({ t, onPick }) {
  const entries = Object.entries(ENTRIES).sort((a, b) => b[0] - a[0]);
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ padding: '4px 0 20px' }}>
        <div style={{
          fontFamily: t.font.stack, fontSize: 28, fontWeight: 600, color: '#fff',
          letterSpacing: -0.8, lineHeight: 1,
        }}>April</div>
        <div style={{
          fontFamily: t.font.stack, fontSize: 13, color: 'rgba(255,255,255,0.45)',
          marginTop: 4,
        }}>2026 · 9 entries</div>
      </div>

      <div style={{ position: 'relative' }}>
        {/* spine */}
        <div style={{
          position: 'absolute', left: 23, top: 8, bottom: 8,
          width: 1, background: t.bg.line,
        }} />
        {entries.map(([day, entry]) => (
          <button key={day} onClick={() => onPick(Number(day))} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '0 0 14px', width: '100%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            textAlign: 'left',
          }}>
            <div style={{
              width: 48, flexShrink: 0, position: 'relative', paddingTop: 4,
            }}>
              <div style={{
                fontFamily: t.font.stack, fontSize: 22, fontWeight: 600,
                color: entry.today ? t.accent.hue : '#fff', letterSpacing: -0.5,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>{day}</div>
              <div style={{
                fontFamily: t.font.stack, fontSize: 10,
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                letterSpacing: 1, marginTop: 3,
              }}>{DAYS_LONG[(MONTH_OFFSET + Number(day) - 1) % 7].slice(0, 3)}</div>
              <div style={{
                position: 'absolute', left: 48, top: 10,
                width: 7, height: 7, borderRadius: 99,
                background: entry.today ? t.accent.hue : 'rgba(255,255,255,0.4)',
                boxShadow: `0 0 0 3px ${t.bg.base}`,
              }} />
            </div>
            <div style={{
              flex: 1, padding: 14, borderRadius: 14,
              background: t.bg.elev, border: `1px solid ${t.bg.line}`,
              marginLeft: 8,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <div style={{
                  fontFamily: t.font.stack, fontSize: 10, fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>{DAYS_LONG[(MONTH_OFFSET + Number(day) - 1) % 7]}</div>
                <div style={{
                  fontFamily: t.font.stack, fontSize: 10,
                  color: 'rgba(255,255,255,0.35)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{entry.words} words</div>
              </div>
              <div style={{
                fontFamily: t.font.stack, fontSize: 13, color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.5, textWrap: 'pretty',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{entry.preview}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Entry screen
// ─────────────────────────────────────────────────────────────
function EntryScreen({ t, day, onBack, onPrev, onNext, hasPrev, hasNext }) {
  const dow = DAYS_LONG[(MONTH_OFFSET + day - 1) % 7];
  const [text, setText] = useState(FULL_ENTRY);
  const [polishing, setPolishing] = useState(false);
  const [polished, setPolished] = useState(false);

  const onPolish = () => {
    if (polishing) return;
    setPolishing(true);
    setTimeout(() => {
      setPolishing(false);
      setPolished(true);
      setTimeout(() => setPolished(false), 1800);
    }, 1600);
  };

  const words = text.trim().split(/\s+/).length;

  return (
    <>
      {/* Header strip */}
      <div style={{ padding: '68px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 10px 6px 6px', margin: '-6px 0 -6px -6px', borderRadius: 8,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: t.font.stack, fontSize: 14, fontWeight: 500,
          }}>
            {Icon.chev('left')}
            <span>April</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onPrev} disabled={!hasPrev} style={{...navBtn(t), opacity: hasPrev ? 1 : 0.3, cursor: hasPrev ? 'pointer' : 'default'}} title="Previous entry">{Icon.chev('left')}</button>
            <button onClick={onNext} disabled={!hasNext} style={{...navBtn(t), opacity: hasNext ? 1 : 0.3, cursor: hasNext ? 'pointer' : 'default'}} title="Next entry">{Icon.chev('right')}</button>
          </div>
        </div>
      </div>

      {/* Date chip */}
      <div style={{ padding: '24px 20px 18px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '6px 14px', borderRadius: 99,
          background: t.bg.elev, border: `1px solid ${t.bg.line}`,
        }}>
          <div style={{
            fontFamily: t.font.stack, fontSize: 12, color: 'rgba(255,255,255,0.7)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>{dow.slice(0,3)}, Apr {day}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 8px' }}>·</span>
            <span>Day {day - 9} of streak</span>
          </div>
        </div>
      </div>

      {/* Text body — fills space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1, width: '100%', resize: 'none', border: 'none',
            background: 'transparent', color: 'rgba(255,255,255,0.85)',
            fontFamily: t.font.stack, fontSize: 15.5, lineHeight: 1.65,
            outline: 'none', padding: 0,
            textWrap: 'pretty',
          }}
        />
      </div>

      {/* Bottom dock */}
      <div style={{
        flexShrink: 0,
        padding: '12px 20px 34px',
        background: t.bg.base,
      }}>
        {/* Meta foot */}
        <div style={{
          paddingBottom: 12, marginBottom: 12,
          borderBottom: `1px solid ${t.bg.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: t.font.stack, fontSize: 11,
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1,
        }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{words} words</span>
          <span>Saved 2m ago</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 48, borderRadius: 14,
            background: '#fff', color: '#0A0A0B',
            border: 'none', cursor: 'pointer',
            fontFamily: t.font.stack, fontSize: 14, fontWeight: 600,
            letterSpacing: -0.2,
          }}>Save</button>
          <button onClick={onPolish} style={{
            flex: 1.2, height: 48, borderRadius: 14,
            background: polished ? t.accent.hueSoft : 'transparent',
            color: t.accent.hue, border: `1px solid ${t.accent.hue}`,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            fontFamily: t.font.stack, fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: -0.2,
          }}>
            {polishing && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${t.accent.hueSoft}, transparent)`,
                animation: 'shimmer 1.4s linear infinite',
              }} />
            )}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icon.sparkle(t.accent.hue)}
              {polishing ? 'Polishing…' : polished ? 'Polished' : 'Polish with AI'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────
function navBtn(t) {
  return {
    width: 32, height: 32, borderRadius: 10,
    background: 'transparent', border: `1px solid ${t.bg.line}`,
    color: 'rgba(255,255,255,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  };
}

Object.assign(window, {
  ACCENTS, FONTS, BGS, ENTRIES, FULL_ENTRY,
  Icon, DAYS, DAYS_LONG, MONTHS, MONTH_OFFSET, MONTH_DAYS,
  AppHeader, HeaderButton, CalendarGrid, CalendarTimeline, EntryScreen, navBtn, Stat,
});
