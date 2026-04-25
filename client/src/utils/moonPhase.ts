const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
const LUNAR_CYCLE = 29.530588853;

export function getMoonPhase(dateStr: string): number {
  const ms = new Date(dateStr + 'T12:00:00').getTime();
  const daysSince = (ms - REF_NEW_MOON) / 86_400_000;
  return ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE / LUNAR_CYCLE;
}
