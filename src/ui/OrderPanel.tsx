import type { WorldState } from '../engine/types'
import { monthFromTurn, dateCN } from '../engine/util'

/**
 * 政令。
 *
 * 批红是说话，这里是说话之后的事：交谁办、办到哪儿、回的话实不实。
 */
export function OrderPanel({
  s,
  onVerify,
}: {
  s: WorldState
  onVerify: (id: string) => void
}) {
  const running = s.orders.filter((o) => o.status === 'running')
  const waiting = s.orders.filter((o) => o.answered && !o.verified)
  const settled = s.orders.filter((o) => o.verified)

  const when = (turn: number) => {
    const d = monthFromTurn(turn)
    return dateCN(d.year, d.month, d.xun)
  }

  return (
    <div className="pane active">
      <h3 className="pane-title">政 令</h3>
      <div className="note" style={{ marginBottom: 14 }}>
        批红只是把话说出去。话说出去之后，得有人接、有人办、有人回话——而回话里的数，未必是真的。
      </div>

      {waiting.length > 0 && (
        <>
          <h4 className="sub-title">待 核（他回话说办完了）</h4>
          {waiting.map((o) => (
            <div className="ord waiting" key={o.id}>
              <div className="ord-head">
                <b>{o.executorOffice} {o.executorName}</b>
                <span className="ord-tag">已回话</span>
              </div>
              <div className="ord-task">{o.task}</div>
              <div className="ord-say">「前奉诏旨，已办竣。」</div>
              <div className="ord-foot">
                <span className="ord-when">
                  {when(o.turnStart)} 交办 · {when(o.dueTurn)} 回话
                </span>
                <button className="primary" onClick={() => onVerify(o.id)}>
                  遣 人 核 实（−1 精力）
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <h4 className="sub-title">在 办</h4>
      {running.length === 0 ? (
        <div className="note">眼下没有交出去的差事。</div>
      ) : (
        running.map((o) => (
          <div className="ord" key={o.id}>
            <div className="ord-head">
              <b>{o.executorOffice} {o.executorName}</b>
              <span className="ord-tag dim">
                {s.turn >= o.dueTurn ? '逾期未复' : `限 ${when(o.dueTurn)}`}
              </span>
            </div>
            <div className="ord-task">{o.task}</div>
            <div className="ord-bar">
              <i style={{ width: `${Math.min(100, o.reported)}%` }} />
            </div>
            <div className="ord-foot">
              <span className="ord-when">报称已办 {Math.round(o.reported)} 分</span>
            </div>
          </div>
        ))
      )}

      {settled.length > 0 && (
        <>
          <h4 className="sub-title">已 核</h4>
          {settled.map((o) => {
            const gap = o.reported - o.progress
            return (
              <div className={`ord settled${o.status === 'exposed' ? ' bad' : ''}`} key={o.id}>
                <div className="ord-head">
                  <b>{o.executorOffice} {o.executorName}</b>
                  <span className="ord-tag">{o.status === 'exposed' ? '虚报' : '相符'}</span>
                </div>
                <div className="ord-task">{o.task}</div>
                <div className="ord-foot">
                  <span className="ord-when">
                    报 {Math.round(o.reported)} 分 · 实 {Math.round(o.progress)} 分
                    {gap > 8 ? `（差 ${Math.round(gap)}）` : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
