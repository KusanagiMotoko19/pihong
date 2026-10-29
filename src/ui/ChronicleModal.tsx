import { useState } from 'react'
import type { WorldState } from '../engine/types'
import { dateCN, monthFromTurn } from '../engine/util'
import { OfficerText } from './OfficerText'

export function ChronicleModal({
  s,
  onClose,
  onRestart,
  onPick,
}: {
  s: WorldState
  onClose: () => void
  onRestart: () => void
  onPick: (id: string, kind: 'officer' | 'inner') => void
}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>起居注</h3>
        <div className="sub">万历十年六月起</div>
        <div className="chronicle">
          {[...s.log].reverse().map((e, i) => {
            const d = monthFromTurn(e.turn)
            return (
              <div key={i} className={e.tone}>
                {dateCN(d.year, d.month, d.xun)} ·{' '}
                <OfficerText text={e.text} officers={s.officers} inner={s.inner} onPick={onPick} />
              </div>
            )
          })}
        </div>
        <div className="actions">
          <button onClick={onClose}>合 上</button>
          <div style={{ flex: 1 }} />
          {confirming ? (
            <>
              <button className="primary" onClick={onRestart}>
                清档重开
              </button>
              <button onClick={() => setConfirming(false)}>算了</button>
            </>
          ) : (
            <button onClick={() => setConfirming(true)}>清档重开</button>
          )}
        </div>
      </div>
    </div>
  )
}
