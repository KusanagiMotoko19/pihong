import type { Clue, Officer, WorldState } from '../engine/types'
import { officeName, rankCN, OFFICE_BY_ID } from '../engine/offices'
import { readClue, confidence, blanks } from '../engine/knowledge'
import { FACET_LABEL } from '../engine/types'
import { dateCN, monthFromTurn } from '../engine/util'

const SOURCE_LABEL: Record<Clue['source'], string> = {
  audience: '召对',
  rumor: '人言',
  result: '成效',
  record: '在案',
}

export function OfficerModal({
  officer,
  s,
  energy,
  onClose,
  onAudience,
  onOrder,
  onDismiss,
}: {
  officer: Officer
  s: WorldState
  energy: number
  onClose: () => void
  onAudience: () => void
  onOrder: (k: 'audit' | 'watch' | 'push') => void
  onDismiss: (k: 'plain' | 'jail' | 'confiscate') => void
}) {
  const slot = officer.officeId ? OFFICE_BY_ID.get(officer.officeId) : undefined
  const age = 1582 - officer.birthYear
  const clues = s.knowledge[officer.id] ?? []
  const canAsk = energy >= 2
  const canOrder = energy >= 2

  const facets = ['talent', 'integrity', 'temper', 'faction'] as const
  const blankList = blanks(clues).filter((f) => f !== 'record')

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>
          {officer.name}
          <span style={{ fontSize: 13, color: 'var(--ink-faint)', marginLeft: 12 }}>
            字{officer.courtesy}
          </span>
        </h3>
        <div className="sub">
          {officer.origin}人 · {officer.jinshi} · 年{age} · {officeName(officer.officeId)}
          {slot ? `（${rankCN(slot.rank)}）` : ''}
        </div>

        <div className="prose">{officer.bio}</div>

        <div className="appraisal">
          <span className="lbl">吏部考语</span>
          {officer.appraisal}
        </div>

        <h4 className="sub-title">你 眼 里 的 他</h4>
        <div className="portrait">
          {facets.map((f) => {
            const n = clues.filter((c) => c.facet === f).length
            return (
              <div className="pt-row" key={f}>
                <span className="pt-facet">{FACET_LABEL[f]}</span>
                <span className={`pt-word${n === 0 ? ' none' : ''}`}>
                  {readClue(clues, f)}
                </span>
                <span className="pt-conf">{n === 0 ? '' : `把握${confidence(clues, f)}`}</span>
              </div>
            )
          })}
        </div>

        {blankList.length > 0 && (
          <div className="unverified">
            未验：{blankList.map((f) => FACET_LABEL[f]).join('、')}
          </div>
        )}

        <h4 className="sub-title">听 闻</h4>
        {clues.length === 0 ? (
          <div className="note">这个人，你还没听说过什么。</div>
        ) : (
          <div className="clue-list">
            {[...clues]
              .sort((a, b) => b.turn - a.turn)
              .map((c, i) => (
                <div className="clue" key={i}>
                  <span className={`clue-src src-${c.source}`}>{SOURCE_LABEL[c.source]}</span>
                  <span className="clue-when">{(() => { const d = monthFromTurn(c.turn); return dateCN(d.year, d.month, d.xun) })()}</span>
                  <span className="clue-text">{c.text}</span>
                  {c.from && <span className="clue-from">— {c.from}</span>}
                </div>
              ))}
          </div>
        )}

        <div className="actions">
          <button className="primary" onClick={onAudience} disabled={!canAsk}>
            召 对（−2 精力）
          </button>
          <button onClick={() => onOrder('audit')} disabled={!canOrder}>
            密 谕
          </button>
          <button onClick={() => onDismiss('plain')}>罢 职</button>
          <button onClick={() => onDismiss('jail')} disabled={!canOrder}>
            下 狱（−2 精力）
          </button>
          <button onClick={() => onDismiss('confiscate')} disabled={!canOrder}>
            籍 家
          </button>
          <button onClick={onClose}>退</button>
        </div>
      </div>
    </div>
  )
}
