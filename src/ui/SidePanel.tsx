import { useState } from 'react'
import type { MetricKey, Power, WorldState } from '../engine/types'
import { METRIC_LABEL } from '../engine/types'
import { infoQuality, serving } from '../engine/rules'
import { OFFICE_BY_ID, rankCN, type OfficeKind } from '../engine/offices'
import { hasIntel, vacantOffices } from '../engine/actions'
import { ACTIVITIES } from '../engine/activities'
import { InnerPanel } from './InnerPanel'
import { StatutePanel } from './StatutePanel'
import { OrderPanel } from './OrderPanel'

const KEYS: MetricKey[] = ['minxin', 'bianfang', 'guanfeng', 'chaoshi']

type Tab = 'tianxia' | 'chaoting' | 'zhen' | 'neiting' | 'siyi' | 'jiubian' | 'lvling' | 'zhengl'

const TABS: { key: Tab; label: string }[] = [
  { key: 'tianxia', label: '天下' },
  { key: 'chaoting', label: '朝廷' },
  { key: 'zhen', label: '朕' },
  { key: 'lvling', label: '律令' },
  { key: 'zhengl', label: '政令' },
  { key: 'neiting', label: '内廷' },
  { key: 'siyi', label: '四夷' },
  { key: 'jiubian', label: '九边' },
]

const GROUP_ORDER = ['内阁', '部院', '督抚', '藩司', '镇守', '内廷']

function groupOf(name: string, kind: OfficeKind): string {
  if (kind === 'eunuch') return '内廷'
  if (kind === 'military') return '镇守'
  if (name.includes('内阁') || name.includes('大学士')) return '内阁'
  if (name.includes('总督') || name.includes('巡抚')) return '督抚'
  if (name.includes('布政使')) return '藩司'
  return '部院'
}

function attitudeWord(a: number): string {
  if (a >= 60) return '恭顺'
  if (a >= 20) return '和好'
  if (a >= -10) return '观望'
  if (a >= -40) return '不逊'
  if (a >= -70) return '构隙'
  return '仇雠'
}

function threatWord(t: number): string {
  if (t >= 70) return '迫在眉睫'
  if (t >= 50) return '可虑'
  if (t >= 30) return '须防'
  if (t >= 15) return '未靖'
  return '安靖'
}

function powerLabel(p: Power): string {
  return { tribe: '部', state: '国', tributary: '藩', rebel: '叛' }[p.kind]
}

export function SidePanel({
  s,
  onAudience,
  onActivity,
  onProject,
  onVacancy,
  onAutopilot,
  onSpy,
  onArrest,
  onBuild,
  onInner,
  onSpyOfficer,
  onStatute,
  onProbeOfficer,
  onVerify,
}: {
  s: WorldState
  onAudience: (id: string) => void
  onActivity: (id: string) => void
  onProject: (id: string) => void
  onVacancy: (officeId: string) => void
  onAutopilot: (n: number) => void
  onSpy: (kind: 'officer' | 'frontier', id: string) => void
  onArrest: (officerId: string) => void
  onBuild: (k: 'palace' | 'tomb' | 'temple') => void
  onInner: (id: string) => void
  onSpyOfficer: (id: string) => string
  onStatute: (id: string) => void
  onProbeOfficer: (id: string) => string
  onVerify: (orderId: string) => void
}) {
  const [tab, setTab] = useState<Tab>('tianxia')
  const [pool, setPool] = useState(false)
  const q = infoQuality(s)
  const poolCount = s.officers.filter((o) => o.officeId === null).length

  const courtList = pool
    ? s.officers
        .filter((o) => o.officeId === null)
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 40)
    : serving(s).sort((a, b) => {
        const ra = OFFICE_BY_ID.get(a.officeId!)?.rank ?? 9
        const rb = OFFICE_BY_ID.get(b.officeId!)?.rank ?? 9
        return ra - rb
      })

  const grouped: { group: string; list: typeof courtList }[] = []
  if (!pool) {
    for (const g of GROUP_ORDER) {
      const list = courtList.filter((o) => {
        const slot = OFFICE_BY_ID.get(o.officeId!)
        return slot && groupOf(slot.name, slot.kind) === g
      })
      if (list.length > 0) grouped.push({ group: g, list })
    }
  }

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tianxia' && (
        <>
          {KEYS.map((k) => {
            const v = Math.round(s.reported[k])
            const real = hasIntel(s, k)
            return (
              <div className="metric" key={k}>
                <span className="name">{METRIC_LABEL[k]}</span>
                <span className="bar">
                  <i style={{ width: `${real ? s.truth[k] : v}%` }} />
                </span>
                <span className={`val${v < 40 ? ' warn' : ''}${real ? ' real' : ''}`}>
                  {real ? Math.round(s.truth[k]) : v}
                </span>
              </div>
            )
          })}
          <div className="note">
            所报：<b style={{ fontWeight: 'normal', color: 'var(--indigo)' }}>{q.label}</b>
            <br />
            {q.detail}
            {KEYS.some((k) => hasIntel(s, k)) && (
              <>
                <br />
                朱色的是你亲眼查过的数。
              </>
            )}
          </div>

          <h3 className="pane-title">事 项</h3>
          {s.projects.map((p) => {
            const steward = s.officers.find((o) => o.id === p.stewardId)
            return (
              <div
                className="project"
                key={p.id}
                onClick={() => onProject(p.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pname">
                  {p.name}
                  <span style={{ float: 'right', fontSize: 11, color: 'var(--ink-faint)' }}>
                    {p.stage === 'prep' ? '筹备' : p.stage === 'promote' ? '推行' : '收尾'}
                  </span>
                </div>
                <div className="pmeta">
                  承办 {steward?.name ?? '缺员'} · 已支 {Math.round(p.spent)}/{Math.round(p.budget)}万
                </div>
                <div className="pbar">
                  <i style={{ width: `${Math.round(p.reported)}%` }} />
                  {p.exposed && <span className="truth" style={{ left: `${Math.round(p.progress)}%` }} />}
                </div>
                <div className="pvals">
                  <span>奏报 {Math.round(p.reported)}%</span>
                  <span style={{ color: p.exposed ? 'var(--cinnabar)' : 'var(--ink-faint)' }}>
                    实况 {p.exposed ? `${Math.round(p.progress)}%` : '无凭'}
                  </span>
                </div>
                {p.reported >= 99 && p.status === 'running' && (
                  <div className="pvals" style={{ marginTop: 4, color: 'var(--cinnabar)' }}>
                    <span>报完竣，尚未验收</span>
                  </div>
                )}
                <div className="pvals" style={{ marginTop: 4, color: 'var(--ink-faint)' }}>
                  <span>点开看详情</span>
                </div>
              </div>
            )
          })}
        </>
      )}

      {tab === 'chaoting' && (
        <>
          <div className="tabs" style={{ marginTop: 0 }}>
            <button className={`tab${pool ? '' : ' on'}`} onClick={() => setPool(false)}>
              在任
            </button>
            <button className={`tab${pool ? ' on' : ''}`} onClick={() => setPool(true)}>
              在籍候选 {poolCount}
            </button>
          </div>
          <div className="note" style={{ marginTop: 2 }}>
            {pool
              ? '在籍的这些人，是朝廷的存底。声望高的前四十，就在这里。'
              : '点一个人可以召对。召对三次，他的底细你大概就摸清了。'}
          </div>

          {!pool && vacantOffices(s).length > 0 && (
            <>
              <div className="group-title">缺 员（点开补人）</div>
              {vacantOffices(s)
                .slice(0, 8)
                .map((id) => {
                  const slot = OFFICE_BY_ID.get(id)
                  if (!slot) return null
                  return (
                    <div className="officer" key={id} onClick={() => onVacancy(id)}>
                      <div className="oname" style={{ color: 'var(--cinnabar)' }}>
                        {slot.name}
                        <span className="ooffice" style={{ marginLeft: 8 }}>
                          {rankCN(slot.rank)} · 缺
                        </span>
                      </div>
                    </div>
                  )
                })}
            </>
          )}

          {pool ? (
            courtList.map((o) => (
              <div className="officer" key={o.id} onClick={() => onAudience(o.id)}>
                <div className="oname">
                  {o.name}
                  <span className="ooffice" style={{ marginLeft: 8 }}>
                    {o.jinshi.replace('进士', '')} · 在籍
                  </span>
                </div>
                <div className="dots">
                  {'●'.repeat(o.revealed)}
                  {'○'.repeat(Math.max(0, o.impressions.length - o.revealed))}
                  <span style={{ marginLeft: 8, color: 'var(--ink-faint)' }}>{o.faction}</span>
                </div>
              </div>
            ))
          ) : (
            grouped.map((g) => (
              <div key={g.group}>
                <div className="group-title">{g.group}</div>
                {g.list.map((o) => {
                  const slot = OFFICE_BY_ID.get(o.officeId!)
                  return (
                    <div className="officer" key={o.id} onClick={() => onAudience(o.id)}>
                      <div className="oname">
                        {o.name}
                        <span className="ooffice" style={{ marginLeft: 8 }}>
                          {slot ? slot.name : ''}
                        </span>
                      </div>
                      <div className="dots">
                        {'●'.repeat(o.revealed)}
                        {'○'.repeat(Math.max(0, o.impressions.length - o.revealed))}
                        <span style={{ marginLeft: 8, color: 'var(--ink-faint)' }}>
                          {slot ? rankCN(slot.rank) : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </>
      )}

      {tab === 'zhen' && (
        <>
          <div className="note" style={{ marginTop: 2 }}>
            精力点 {s.energy} / {s.maxEnergy}。这些事都费力，但都有一样带得走的东西。
          </div>
          {ACTIVITIES.map((a) => (
            <div className="act" key={a.id}>
              <div className="info">
                <div className="aname">
                  {a.name}
                  <span className="acost">−{a.cost} 精力</span>
                </div>
                <div className="adesc">{a.desc}</div>
              </div>
              <button disabled={s.energy < a.cost} onClick={() => onActivity(a.id)}>
                做
              </button>
            </div>
          ))}
        </>
      )}

      {tab === 'lvling' && <StatutePanel s={s} onToggle={onStatute} />}

      {tab === 'zhengl' && <OrderPanel s={s} onVerify={onVerify} />}

      {tab === 'neiting' && (
        <InnerPanel
          s={s}
          onAutopilot={onAutopilot}
          onSpy={onSpy}
          onArrest={onArrest}
          onBuild={onBuild}
          onInner={onInner}
          onSpyOfficer={onSpyOfficer}
          onProbeOfficer={onProbeOfficer}
        />
      )}

      {tab === 'siyi' && (
        <>
          <div className="note" style={{ marginTop: 2 }}>
            态度是它对你的心，实力是它有多少人，威胁是它有多想打你。三样不是一回事。
          </div>
          {s.powers.map((p) => (
            <div className="power" key={p.id}>
              <div className="pname">
                <span className="tag">{powerLabel(p)}</span>
                {p.name}
              </div>
              <div className="pmeta">
                {p.leader} · {p.status}
              </div>
              <div className="prow">
                <span>态度</span>
                <b className={p.attitude < -20 ? 'bad' : ''}>{attitudeWord(p.attitude)}</b>
              </div>
              <div className="prow">
                <span>威胁</span>
                <b className={p.threat >= 50 ? 'bad' : ''}>{threatWord(p.threat)}</b>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'jiubian' && (
        <>
          <div className="note" style={{ marginTop: 2 }}>
            额兵是册子上的数。实额要有人去查，才能知道。
          </div>
          {s.frontiers.map((f) => (
            <div className="frontier" key={f.id}>
              <div className="pname">{f.name}</div>
              <div className="prow">
                <span>额兵</span>
                <b>{f.troops.toFixed(1)} 万</b>
              </div>
              <div className="prow">
                <span>实额</span>
                <b style={{ color: f.audited ? 'var(--cinnabar)' : 'var(--ink-faint)' }}>
                  {f.audited ? `${f.actual.toFixed(1)} 万` : '无凭'}
                </b>
              </div>
              <div className="prow">
                <span>战备</span>
                <span className="bar" style={{ flex: 1, margin: '0 8px' }}>
                  <i style={{ width: `${f.readiness}%` }} />
                </span>
                <b className={f.readiness < 45 ? 'bad' : ''}>{Math.round(f.readiness)}</b>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
