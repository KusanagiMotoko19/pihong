import { useState } from 'react'
import type { WorldState } from '../engine/types'
import { STATUTES } from '../data/statutes'

/**
 * 律令。
 *
 * 这一页是「制度」，不是「政务」——你在这里动的东西，比批一百本折子都深，
 * 但也比批一百本折子都慢。
 */
export function StatutePanel({
  s,
  onToggle,
}: {
  s: WorldState
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="pane active">
      <h3 className="pane-title">律 令</h3>
      <div className="note" style={{ marginBottom: 14 }}>
        批红管一件事，用人管一个人，只有立条法能改国运。法一立，往后每一旬它都在暗处用力。
      </div>

      {STATUTES.map((st) => {
        const on = !!s.statutes[st.id]
        const locked = st.fromTurn !== undefined && s.turn < st.fromTurn
        const expanded = open === st.id

        return (
          <div className={`statute${on ? ' on' : ''}`} key={st.id}>
            <div className="st-head" onClick={() => setOpen(expanded ? null : st.id)}>
              <b>{st.name}</b>
              <span className={`st-state${on ? ' live' : ''}`}>{on ? '施行中' : '未行'}</span>
            </div>
            <div className="st-brief">{st.brief}</div>

            {expanded && (
              <>
                <div className="st-text">{st.text}</div>
                <div className="st-against">阻力：{st.against}</div>
              </>
            )}

            <div className="st-foot">
              <button
                className={on ? '' : 'primary'}
                disabled={locked || s.energy < st.cost}
                onClick={() => onToggle(st.id)}
              >
                {locked ? '时机未到' : on ? `罢 之（−${st.cost} 精力）` : `立 之（−${st.cost} 精力）`}
              </button>
              <span className="st-tap" onClick={() => setOpen(expanded ? null : st.id)}>
                {expanded ? '收起' : '看条文'}
              </span>
            </div>
          </div>
        )
      })}

      <div className="note" style={{ marginTop: 16 }}>
        律令的账不在当旬，在三年后。你立的那条法，可能替你收上百万两银子，也可能替你埋下一个十年后才炸的雷。
      </div>
    </div>
  )
}
