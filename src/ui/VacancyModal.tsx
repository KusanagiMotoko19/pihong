import { useState } from 'react'
import type { Officer, WorldState } from '../engine/types'
import { partyController } from '../data/memorials/line-faction'
import { OFFICE_BY_ID, rankCN } from '../engine/offices'

/**
 * 补一个缺。
 *
 * 皇帝不是吏部尚书，不能一个一个地挑人 —— 但可以在一张单子里挑。
 * 这张单子是吏部拟的，也可能是你自己从人才库里翻的。
 */
export function VacancyModal({
  s,
  officeId,
  onClose,
  onAppoint,
}: {
  s: WorldState
  officeId: string
  onClose: () => void
  onAppoint: (officerId: string) => void
}) {
  const slot = OFFICE_BY_ID.get(officeId)
  const [q, setQ] = useState('')
  const ctl = partyController(s)
  const raw = s.officers.filter((o) => o.officeId === null && (o.leaveUntil ?? 0) <= s.turn)
  // 党争坐大时，名单先列本党的人 —— 你能选，选谁都一样
  const pool = ctl
    ? [...raw.filter((o) => o.faction === ctl.faction), ...raw.filter((o) => o.faction !== ctl.faction)]
    : raw

  const ranked = [...pool].sort((a, b) => {
    // 声望与干才为主，但考语里的「才具平庸」也会压分 —— 你只能看考语
    const sa = a.reputation * 0.5 + a.neng * 0.3 + a.ji * 0.2
    const sb = b.reputation * 0.5 + b.neng * 0.3 + b.ji * 0.2
    return sb - sa
  })
  const list = q ? ranked.filter((o) => o.name.includes(q) || o.origin.includes(q)) : ranked
  const top = list.slice(0, 12)

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <h3>{slot?.name ?? '补缺'}</h3>
        <div className="sub">
          {slot ? `${rankCN(slot.rank)} · ${slot.dept} · ${slot.duty}` : ''}
        </div>

        {ctl && (
          <div className="party-warn">
            这份名单是{ctl.faction}拟的（在任 {ctl.count} 人，朝局 {Math.round(s.truth.chaoshi)}）。排在前面的，都是他们一路的人。
          </div>
        )}

        <div className="prose" style={{ marginBottom: 8 }}>
          在籍候选 {pool.length} 人。下面是声望最高的十二个。你可以只看考语，也可以召来见过再定。
        </div>

        <input
          className="search"
          placeholder="按姓名或籍贯找"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {top.length === 0 && <div className="empty">没有这个人。</div>}
        {top.map((o: Officer) => (
          <div key={o.id} className="cand">
            <div className="cand-main">
              <div className="oname">
                {o.name}
                <span className="ooffice" style={{ marginLeft: 8 }}>
                  {o.origin} · {o.jinshi} · {o.faction}
                </span>
              </div>
              <div className="cand-appraisal">{o.appraisal}</div>
            </div>
            <button onClick={() => onAppoint(o.id)}>用</button>
          </div>
        ))}

        <div className="actions">
          <button onClick={onClose}>合 上</button>
        </div>
      </div>
    </div>
  )
}
