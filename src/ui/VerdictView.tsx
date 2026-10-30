import type { WorldState } from '../engine/types'
import type { Verdict } from '../engine/tick'
import { dateCN, monthFromTurn } from '../engine/util'

export function VerdictView({
  verdict,
  state,
  onRestart,
}: {
  verdict: Verdict
  state: WorldState
  onRestart: () => void
}) {
  const shichen =
    verdict.score >= 65
      ? '史臣曰：帝初亲政，锐意有为，综核名实，不惑于众口。使天假之年，其功岂在李成梁、潘季驯之下哉。'
      : verdict.score >= 40
        ? '史臣曰：帝守成而已。无所大失，亦无所大立。天下之病，仍在腠理。'
        : verdict.score >= 15
          ? '史臣曰：帝在位初期，循常守故。然法久必弊，弊久必弛，帝未尝一振之。'
          : '史臣曰：帝自亲政之始，即倦于勤。章奏留中，政务壅滞。明之衰，自此始也。'

  return (
    <div className="verdict">
      <h1>{verdict.title}</h1>
      <div className="sub">
        万历十年六月 — {(() => { const d = monthFromTurn(state.turn); return dateCN(d.year, d.month, d.xun) })()}
      </div>

      <div className="lines">
        {verdict.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        <p style={{ color: 'var(--ink-faint)' }}>{shichen}</p>
      </div>

      <div
        className="note"
        style={{ display: 'flex', gap: 22, justifyContent: 'center', fontSize: 13 }}
      >
        <span>太仓 {Math.round(state.taicang)}万</span>
        <span>内帑 {Math.round(state.neitang)}万</span>
        <span>太仆 {Math.round(state.taipu)}万</span>
        <span>留中 {state.backlog} 件</span>
      </div>

      {verdict.people.length > 0 && (
        <div className="people-verdict">
          <h3 className="pv-title">你 用 过 的 人</h3>
          <div className="pv-sub">到了这一步，底牌才翻开。</div>
          {verdict.people.map((p, i) => (
            <div className="pv" key={i}>
              <div className="pv-head">
                <b>{p.name}</b>
                <span>{p.office}</span>
              </div>
              <div className="pv-row">
                <span className="pv-k">你当年</span>
                <span className="pv-v">{p.judged}</span>
              </div>
              <div className="pv-row">
                <span className="pv-k">实际</span>
                <span className="pv-v real">{p.actual}</span>
              </div>
              <div className="pv-comment">{p.comment}</div>
            </div>
          ))}
        </div>
      )}

      <button className="primary" onClick={onRestart}>
        再 来 一 局
      </button>

      <div className="note" style={{ marginTop: 26, fontSize: 12 }}>
        此为技术验证版。五年的剧本走完即止，真正的游戏会有四十八年。
      </div>
    </div>
  )
}
