import type { InnerOfficer } from '../engine/types'

const DIMS: [keyof InnerOfficer, string, string][] = [
  ['loyalty', '忠', '对你一个人。低了会瞒事'],
  ['competence', '干', '会不会办事'],
  ['greed', '贪', '捞不捞。皇庄的进项、缉访的真假都看这个'],
  ['power', '势', '手里多少人。高了压得住外廷，也压得住你'],
]

export function InnerModal({
  o,
  energy,
  onClose,
  onMeet,
}: {
  o: InnerOfficer
  energy: number
  onClose: () => void
  onMeet: () => void
}) {
  const canMeet = o.revealed < o.impressions.length && energy >= 2

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{o.name}</h3>
        <div className="sub">
          {o.title} · {o.kind === 'guard' ? '锦衣卫' : '内官'}
        </div>

        <div className="prose">{o.bio}</div>

        <h4 className="sub-title">四 维</h4>
        {DIMS.map(([k, label, desc]) => {
          const v = o[k] as number
          return (
            <div className="dim" key={k}>
              <span className="dim-label">{label}</span>
              <span className="dim-bar">
                <i
                  style={{
                    width: `${v}%`,
                    background: k === 'greed' ? 'var(--cinnabar)' : 'var(--ink)',
                  }}
                />
              </span>
              <b>{v}</b>
              <span className="dim-desc">{desc}</span>
            </div>
          )
        })}

        <h4 className="sub-title">你 眼 里 的 他</h4>
        {o.revealed === 0 ? (
          <div className="impression locked">还没单独见过。召见一回，能看清他一点。</div>
        ) : (
          o.impressions.map((t, i) => (
            <div key={i} className={`impression${i >= o.revealed ? ' locked' : ''}`}>
              {i < o.revealed ? t : '——还没问到这个。'}
            </div>
          ))
        )}

        <div className="actions">
          <button className="primary" onClick={onMeet} disabled={!canMeet}>
            召 见（−2 精力）
          </button>
          <button onClick={onClose}>退</button>
          {o.revealed >= o.impressions.length && (
            <div className="hint">这个人，你已经看得差不多了。</div>
          )}
        </div>
      </div>
    </div>
  )
}
