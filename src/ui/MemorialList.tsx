import type { Memorial, WorldState } from '../engine/types'
import { KIND_LABEL } from '../engine/types'
import { sortQueue } from '../engine/order'
import { OfficerText } from './OfficerText'

export function MemorialList({
  s,
  selectedId,
  onSelect,
  onPick,
}: {
  s: WorldState
  selectedId: string | null
  onSelect: (id: string) => void
  onOfficer: (id: string) => void
  onPick: (id: string, kind: 'officer' | 'inner') => void
}) {
  const list = sortQueue(s.queue)

  if (list.length === 0) {
    return <div className="empty" style={{ padding: '24px 0' }}>案头已清。</div>
  }

  return (
    <div>
      {list.map((m: Memorial) => (
        <div
          key={m.id}
          className={`queue-item${m.id === selectedId ? ' active' : ''}${
            m.stayMonths > 0 ? ' stayed' : ''
          }`}
          onClick={() => onSelect(m.id)}
        >
          <div className="from">
            <OfficerText text={m.from} officers={s.officers} inner={s.inner} onPick={onPick} />
          </div>
          <div className="title">
            <span className={`tag ${m.kind}`}>{KIND_LABEL[m.kind]}</span>
            {m.read && <span className="tag read">已览</span>}
            {m.stayMonths > 0 && <span className="tag">留中{m.stayMonths}</span>}
            {m.title.replace(/^为/, '').replace(/事$/, '')}
          </div>
        </div>
      ))}
    </div>
  )
}
