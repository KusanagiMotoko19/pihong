import type { WorldState } from '../engine/types'
import { dateCN } from '../engine/util'

export function TopBar({ s, onChronicle }: { s: WorldState; onChronicle: () => void }) {
  const pips = Array.from({ length: s.maxEnergy }, (_, i) => i < s.energy)

  return (
    <div className="topbar">
      <div className="date">{dateCN(s.date.year, s.date.month, s.date.xun)}</div>

      <div className="energy">
        <span>精力</span>
        <span className="pips">
          {pips.map((on, i) => (
            <i key={i} className={`pip${on ? ' on' : ''}`} />
          ))}
        </span>
      </div>

      {s.backlog > 0 && (
        <div className="energy backlog">
          <span>壅滞</span>
          <span style={{ color: s.backlog >= 12 ? 'var(--cinnabar)' : undefined }}>
            留中 <b>{s.backlog}</b>
          </span>
        </div>
      )}

      <div className="spacer" />

      <div className="ledger">
        <span className={s.taicang < 100 ? 'neg' : ''}>
          太仓 <b>{Math.round(s.taicang)}</b>
        </span>
        <span className={s.neitang < 50 ? 'neg' : ''}>
          内帑 <b>{Math.round(s.neitang)}</b>
        </span>
        <span className={s.taipu < 50 ? 'neg' : ''}>
          太仆 <b>{Math.round(s.taipu)}</b>
        </span>
      </div>

      <button onClick={onChronicle}>起居注</button>
    </div>
  )
}
