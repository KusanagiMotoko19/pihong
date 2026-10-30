import { useState } from 'react'
import type { WorldState } from '../engine/types'
import {
  GROUP_ORDER,
  STATUTES,
  effectLines,
  hiddenStatuteCount,
  immediateLines,
  statuteById,
  statuteLock,
  statuteRuns,
  statuteYield,
  visibleStatutes,
} from '../data/statutes'
import type { Statute } from '../data/statutes'

/**
 * 律令。
 *
 * 这一页是「制度」，不是「政务」——你在这里动的东西，比批一百本折子都深，
 * 但也比批一百本折子都慢。
 *
 * 三件事必须一眼看到：
 *   一、这条法【得】什么、【失】什么（数字与结算同源，按正负分两栏）；
 *   二、它和哪条法不能并存；
 *   三、还没人提到的法，这里不显示（只报一句数目）。
 */
export function StatutePanel({
  s,
  onToggle,
}: {
  s: WorldState
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const shown = visibleStatutes(s)
  const hidden = hiddenStatuteCount(s)

  // 反查：谁和我互斥
  const rivalsOf = (st: Statute): string[] => {
    const out = new Set(st.exclusive ?? [])
    for (const other of STATUTES) {
      if (other.exclusive?.includes(st.id)) out.add(other.id)
    }
    return [...out].map((id) => statuteById(id)?.name ?? id)
  }

  return (
    <div className="pane active">
      <h3 className="pane-title">律 令</h3>
      <div className="note" style={{ marginBottom: 14 }}>
        批红管一件事，用人管一个人，只有立条法能改国运。法一立，往后每一旬它都在暗处用力。
        <br />
        每条法都有得有失 —— 得的那一栏是你换来的，失的那一栏是你要付的。
      </div>

      {GROUP_ORDER.map((group) => {
        const list = shown.filter((x) => x.group === group)
        if (list.length === 0) return null
        return (
          <div key={group} className="st-group">
            <div className="st-group-name">{group}</div>
            {list.map((st) => {
              const on = !!s.statutes[st.id]
              const lock = statuteLock(s, st)
              const expanded = open === st.id
              const runs = statuteRuns(s, st.id)
              const got = statuteYield(s, st.id)
              const eff = effectLines(st)
              const once = immediateLines(st)
              const rivals = rivalsOf(st)

              return (
                <div className={`statute${on ? ' on' : ''}`} key={st.id}>
                  <div className="st-head" onClick={() => setOpen(expanded ? null : st.id)}>
                    <b>{st.name}</b>
                    <span className={`st-state${on ? ' live' : ''}`}>
                      {on ? (runs > 0 ? `施行中 · ${runs}旬` : '施行中') : '未行'}
                    </span>
                  </div>
                  <div className="st-brief">{st.brief}</div>

                  {/* 得失两栏：一直显示。不写清楚，玩家不知道立它换什么、付什么 */}
                  {eff.gains.length > 0 && (
                    <ul className="st-effect gain">
                      {eff.gains.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {eff.costs.length > 0 && (
                    <ul className="st-effect cost">
                      {eff.costs.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {on && got > 0 && <div className="st-yield">此项已解到 {got} 万两</div>}

                  {expanded && (
                    <>
                      <div className="st-text">{st.text}</div>
                      <div className="st-goods">
                        <div>
                          <span className="st-k">立此得</span>
                          {st.gains.join('；')}
                        </div>
                        <div>
                          <span className="st-k">立此失</span>
                          {st.costs.join('；')}
                        </div>
                        {once.gains.length + once.costs.length > 0 && (
                          <div>
                            <span className="st-k">颁行当旬</span>
                            {[...once.gains, ...once.costs].join('；')}
                          </div>
                        )}
                      </div>
                      <div className="st-against">阻力：{st.against}</div>
                      {rivals.length > 0 && (
                        <div className="st-rival">
                          与《{rivals.join('》《')}》不并行 —— 立此即罢彼
                        </div>
                      )}
                      <div className="st-after">立后之弊：{st.aftermath}</div>
                      {on && <div className="st-after">已行之效：见各衙门岁报奏疏。</div>}
                    </>
                  )}

                  {!on && lock && <div className="st-lock">{lock}</div>}

                  <div className="st-foot">
                    <button
                      className={on ? '' : 'primary'}
                      disabled={!!lock || s.energy < st.cost}
                      onClick={() => onToggle(st.id)}
                    >
                      {lock
                        ? '时机未到'
                        : on
                          ? `罢 之（−${st.cost} 精力）`
                          : `立 之（−${st.cost} 精力）`}
                    </button>
                    <span className="st-tap" onClick={() => setOpen(expanded ? null : st.id)}>
                      {expanded ? '收起' : '看条文与守则'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {hidden > 0 && (
        <div className="st-hidden">
          另有 {hidden} 件，尚无人提到你面前 —— 天下还有别的毛病，只是还没人敢说。
        </div>
      )}

      <div className="note" style={{ marginTop: 16 }}>
        律令的账不在当旬，在三年后。你立的那条法，可能替你收上百万两银子，也可能替你埋下一个十年后才炸的雷。
        立了之后，各衙门会按期把「办得怎么样」报上来 —— 报的数，未必是实。
      </div>
    </div>
  )
}
