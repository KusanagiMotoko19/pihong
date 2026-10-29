import { useState } from 'react'
import type { Officer, WorldState } from '../engine/types'
import { officeName } from '../engine/offices'
import { TOPICS, ask } from '../data/speech'
import type { Topic } from '../data/speech'

/**
 * 召对：一场对话，不是一次抽卡。
 *
 * 一次召对可以问两个话题。问政事看他办得怎样，问人事看他和谁走，
 * 问家事看他怕什么，问旧事看他是怎么上来的。
 * 问完了，你心里有个数——但那个数不一定准。
 */
export function AudienceModal({
  officer,
  s,
  onClose,
  onRecord,
}: {
  officer: Officer
  s: WorldState
  onClose: () => void
  onRecord: (topic: Topic) => void
}) {
  const [used, setUsed] = useState<Topic[]>([])
  const [shown, setShown] = useState<{ q: string; a: string; note: string } | null>(null)

  const seen = s.knowledge[officer.id] ?? []
  const left = 2 - used.length

  const handle = (t: Topic) => {
    if (used.includes(t) || left <= 0) return
    const ex = ask(officer, t, s)
    const label = TOPICS.find((x) => x.key === t)!.label
    setShown({ q: label, a: ex.say, note: ex.note })
    setUsed([...used, t])
    onRecord(t)
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal audience" onClick={(e) => e.stopPropagation()}>
        <h3>{officer.name}</h3>
        <div className="sub">
          {officeName(officer.officeId)} · 召对
        </div>

        {shown ? (
          <div className="exchange">
            <div className="ex-q">你问：{shown.q}</div>
            <div className="ex-a">{shown.a}</div>
            <div className="ex-note">{shown.note}</div>
          </div>
        ) : (
          <div className="exchange opening">
            <div className="ex-a">
              他在阶下跪了，等你开口。
            </div>
            <div className="ex-note">问什么，决定你能看出什么。</div>
          </div>
        )}

        {left > 0 ? (
          <>
            <h4 className="sub-title">问 什 么</h4>
            <div className="topics">
              {TOPICS.map((t) => {
                const done = used.includes(t.key)
                const known = seen.some((c) => c.facet === topicFacet(t.key))
                return (
                  <button
                    key={t.key}
                    className={`topic${done ? ' done' : ''}`}
                    disabled={done}
                    onClick={() => handle(t.key)}
                  >
                    <b>{t.label}</b>
                    <span>{done ? '问过了' : known ? '此前听过一些' : t.hint}</span>
                  </button>
                )
              })}
            </div>
            <div className="hint">还能问 {left} 次。问完就退，不必都问。</div>
          </>
        ) : (
          <div className="hint">问完了。他退出去的时候，你看着他的背影。</div>
        )}

        <div className="actions">
          <button className="primary" onClick={onClose}>
            退
          </button>
        </div>
      </div>
    </div>
  )
}

function topicFacet(t: Topic) {
  return t === 'politics' ? 'talent' : t === 'family' ? 'integrity' : t === 'past' ? 'temper' : 'faction'
}
