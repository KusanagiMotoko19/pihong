import type { WorldState } from '../engine/types'
import { dateCN, monthFromTurn } from '../engine/util'

const STAGE: Record<string, string> = { prep: '筹备', promote: '推行', close: '收尾' }

export function ProjectModal({
  s,
  projectId,
  onClose,
  onAction,
  onOfficer,
}: {
  s: WorldState
  projectId: string
  onClose: () => void
  onAction: (a: 'fund' | 'inspect') => void
  onOfficer: (id: string) => void
}) {
  const p = s.projects.find((x) => x.id === projectId)
  if (!p) return null
  const steward = s.officers.find((o) => o.id === p.stewardId)
  const done = p.status === 'done'

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <h3>{p.name}</h3>
        <div className="sub">
          {STAGE[p.stage]} · 承办{' '}
          <span
            style={{ color: 'var(--indigo)', cursor: 'pointer' }}
            onClick={() => steward && onOfficer(steward.id)}
          >
            {steward?.name ?? '缺员'}
          </span>
          · 已办 {p.months} 旬
        </div>

        <div className="prose">{p.goal}</div>

        <div className="sec-row">
          <span>奏报</span>
          <div className="pbar" style={{ flex: 1 }}>
            <i style={{ width: `${Math.round(p.reported)}%` }} />
            {p.exposed && <span className="truth" style={{ left: `${Math.round(p.progress)}%` }} />}
          </div>
          <b>{Math.round(p.reported)}%</b>
        </div>
        <div className="sec-row">
          <span>实况</span>
          <div className="pbar" style={{ flex: 1 }}>
            <i
              style={{ width: `${Math.round(p.progress)}%`, background: 'var(--cinnabar)', opacity: 0.55 }}
            />
          </div>
          <b style={{ color: p.exposed ? 'var(--cinnabar)' : 'var(--ink-faint)' }}>
            {p.exposed ? `${Math.round(p.progress)}%` : '无凭'}
          </b>
        </div>
        <div className="sec-row">
          <span>阻力</span>
          <div className="pbar" style={{ flex: 1 }}>
            <i style={{ width: `${p.resistance}%`, background: 'var(--indigo)', opacity: 0.5 }} />
          </div>
          <b>{Math.round(p.resistance)}</b>
        </div>
        <div className="sec-row">
          <span>钱</span>
          <div style={{ flex: 1 }} />
          <b>
            已支 {Math.round(p.spent)} / 拨 {Math.round(p.budget)} 万两
          </b>
        </div>

        <h4 className="sub-title">谁在反对</h4>
        {p.opponents.map((o, i) => (
          <div key={i} className="opp">
            <b>{o.name}</b>
            <span>{o.reason}</span>
          </div>
        ))}

        <h4 className="sub-title">关 键 节 点</h4>
        {p.milestones.map((m, i) => (
          <div key={i} className={`ms${m.hit ? ' hit' : ''}`}>
            <span className="at">{m.at}%</span>
            {m.text}
          </div>
        ))}

        <h4 className="sub-title">大 事 记</h4>
        <div className="chronicle">
          {p.history.map((h, i) => {
            const d = monthFromTurn(h.turn)
            return (
              <div key={i}>
                {dateCN(d.year, d.month, d.xun)} · {h.text}
              </div>
            )
          })}
        </div>

        <div className="actions">
          <button className="primary" onClick={() => onAction('fund')} disabled={s.taicang < 20 || done}>
            发银二十万两（续办）
          </button>
          <button onClick={() => onAction('inspect')} disabled={s.energy < 2 || done}>
            亲阅册籍（−2 精力）
          </button>
          <button onClick={onClose}>合 上</button>
          {p.reported >= 99 && p.status === 'running' && (
            <div className="hint" style={{ color: 'var(--cinnabar)' }}>
              它报了完竣，但你知道那不是真的。要么亲阅，要么就这样报上去。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
