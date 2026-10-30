import type { Memorial, Officer, WorldState } from '../engine/types'
import { OFFICE_BY_ID, rankCN } from '../engine/offices'
import { OfficerText } from './OfficerText'

/** 正文里提到的人，能对上名册的就列出来 */
function mentionedPeople(s: WorldState, body: string): Officer[] {
  return s.officers
    .filter((o) => o.officeId && o.name.length >= 2 && body.includes(o.name))
    .slice(0, 3)
}

export function MemorialView({
  s,
  m,
  energy,
  onRead,
  onDecree,
  onStay,
  onOfficer,
  onPick,
}: {
  s: WorldState
  m: Memorial
  energy: number
  onRead: () => void
  onDecree: (key: string) => void
  onStay: () => void
  onOfficer: (id: string) => void
  onPick: (id: string, kind: 'officer' | 'inner') => void
}) {
  const alts = m.options.filter((o) => o.key !== 'yi')
  const sender = m.senderId ? s.officers.find((o) => o.id === m.senderId) : undefined
  const slot = sender?.officeId ? OFFICE_BY_ID.get(sender.officeId) : undefined
  const people = m.read ? mentionedPeople(s, m.body) : []

  return (
    <div className="memorial">
      <div className="head">
        <div className="from">
          <OfficerText text={m.from} officers={s.officers} inner={s.inner} onPick={onPick} />
        </div>
        <h2>{m.title}</h2>
      </div>

      {/* 具奏人档案：这个人是谁、管什么、口碑如何 */}
      {sender && slot && (
        <div className="sender-card" onClick={() => onOfficer(sender.id)}>
          <div className="sc-row">
            <span className="sc-name">{sender.name}</span>
            <span className="sc-office">{slot.name}</span>
            <span className="sc-rank">{rankCN(slot.rank)}</span>
          </div>
          <div className="sc-duty">职掌：{slot.duty}</div>
          <div className="sc-praise">考语：{sender.appraisal}</div>
          <div className="sc-tip">点开看他的履历与考语</div>
        </div>
      )}

      {m.background && (
        <div className="bg">
          <span className="lbl">缘 起</span>
          <OfficerText text={m.background} officers={s.officers} inner={s.inner} onPick={onPick} />
        </div>
      )}

      {m.read ? (
        <>
          <div className="body">
            <OfficerText text={m.body} officers={s.officers} inner={s.inner} onPick={onPick} />
          </div>

          {people.length > 0 && (
            <div className="mentioned">
              <span className="lbl">这本里提到的人</span>
              {people.map((o) => (
                <div key={o.id} className="mp" onClick={() => onOfficer(o.id)}>
                  <b>{o.name}</b>
                  <span className="mp-office">{OFFICE_BY_ID.get(o.officeId!)?.name}</span>
                  <span className="mp-bio">
                    {OFFICE_BY_ID.get(o.officeId!)?.duty} · {o.bio.slice(0, 26)}…
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="body locked">
            <OfficerText text={m.summary} officers={s.officers} inner={s.inner} onPick={onPick} />
          </div>
          <div className="note" style={{ marginTop: 14 }}>
            此本未细览。你只知道大概，和内阁替你拟好的处置。
          </div>
        </>
      )}

      <div className="piaoni">
        <span className="lbl">内阁票拟</span>
        <OfficerText text={m.piaoni} officers={s.officers} inner={s.inner} onPick={onPick} />
      </div>

      {m.read && m.secret && (
        <div className="secret">
          <span className="lbl">细看之后，你看见一些没写在纸上的东西</span>
          <OfficerText text={m.secret} officers={s.officers} inner={s.inner} onPick={onPick} />
        </div>
      )}

      <div className="actions">
        <button className="primary" onClick={() => onDecree('yi')}>
          依拟
        </button>
        <button onClick={onStay}>留中</button>
        {!m.read && (
          <button onClick={onRead} disabled={energy < 1}>
            细看全文（-1 精力）
          </button>
        )}
        {!m.read && energy < 1 && (
          <div className="hint">精力已尽。此本只能依拟，或留中。</div>
        )}
      </div>

      {m.read && alts.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="pane-title" style={{ borderBottom: 'none', marginBottom: 6 }}>
            改 拟
          </div>
          {alts.map((o) => (
            <div key={o.key} style={{ marginBottom: 14 }}>
              <button onClick={() => onDecree(o.key)}>{o.label}</button>
              {o.note && (
                <div className="opt-note" style={{ margin: '6px 0 0' }}>
                  {o.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
