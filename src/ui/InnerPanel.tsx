import { useState } from 'react'
import type { WorldState } from '../engine/types'
import { innerHead, royalManorIncome } from '../engine/inner'
import { serving } from '../engine/rules'
import { officeName } from '../engine/offices'

const AUTO_LABEL = ['不授权', '只代批例行', '除急件外全代批']

export function InnerPanel({
  s,
  onAutopilot,
  onSpy,
  onArrest,
  onBuild,
  onInner,
  onSpyOfficer,
  onProbeOfficer,
}: {
  s: WorldState
  onAutopilot: (n: number) => void
  onSpy: (kind: 'officer' | 'frontier', id: string) => void
  onArrest: (officerId: string) => void
  onBuild: (k: 'palace' | 'tomb' | 'temple') => void
  onInner: (id: string) => void
  onSpyOfficer: (id: string) => string
  onProbeOfficer: (id: string) => string
}) {
  const [spyOfficer, setSpyOfficer] = useState('')
  const [arrestTarget, setArrestTarget] = useState('')
  const [spyTarget, setSpyTarget] = useState('')
  const [report, setReport] = useState<string | null>(null)
  const siliji = innerHead(s, 'siliji')
  const dongchang = innerHead(s, 'dongchang')
  const jinyi = innerHead(s, 'jinyiwei')
  const neiguan = innerHead(s, 'neiguanjian')
  const yuma = innerHead(s, 'yumajian')

  const officials = serving(s).filter((o) => o.officeId)

  return (
    <div>
      <div className="note" style={{ marginTop: 2 }}>
        内廷不走吏部。这里的人是你自己的，用起来顺手，长起来也快。
      </div>
      <div className="inner-help">
        <div>
          <b>忠</b> 对你一个人有多忠。低于 50 又握着权力的，会瞒你事。
        </div>
        <div>
          <b>干</b> 会不会办事。决定代批的质量、缉访准不准、营造省不省。
        </div>
        <div>
          <b>贪</b> 捞不捞。决定皇庄截留多少、缉访会不会被买通。
        </div>
        <div>
          <b>势</b> 手里有多少人。越高代批越多，也越压得住外廷——压得过头就是擅权。
        </div>
      </div>

      {/* 司礼监 */}
      <h3 className="pane-title">司 礼 监 · 代 批</h3>
      <div className="inner-block">
        <div className="prow">
          <span>掌印</span>
          <b>{siliji?.name ?? '缺'}</b>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' }}>
            干 {siliji?.competence ?? 0} · 贪 {siliji?.greed ?? 0} · 势 {siliji?.power ?? 0}
          </span>
        </div>
        <div className="prow">
          <span>当前</span>
          <b style={{ color: s.autopilot > 0 ? 'var(--cinnabar)' : undefined }}>
            {AUTO_LABEL[s.autopilot]}
          </b>
        </div>
        <div className="order-row" style={{ marginTop: 6 }}>
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              className={s.autopilot === n ? 'primary' : ''}
              onClick={() => onAutopilot(n)}
            >
              {AUTO_LABEL[n]}
            </button>
          ))}
        </div>
        <div className="adesc" style={{ marginTop: 6 }}>
          授权之后，每旬它替你批一两本。你省精力，但这些本子等于没看——批得对不对，
          看掌印这个人。
        </div>
      </div>

      {/* 东厂 */}
      <h3 className="pane-title">东 厂 · 缉 访</h3>
      <div className="inner-block">
        <div className="prow">
          <span>提督</span>
          <b>{dongchang?.name ?? '缺'}</b>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' }}>
            −2 精力 −2 内帑
          </span>
        </div>
        <div className="order-row" style={{ marginTop: 6 }}>
          <select
            className="sel"
            value={spyOfficer}
            onChange={(e) => setSpyOfficer(e.target.value)}
          >
            <option value="">选一个官员…</option>
            {officials.slice(0, 22).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}（{officeName(o.officeId)}）
              </option>
            ))}
          </select>
          <button
            disabled={!spyOfficer || s.energy < 2 || s.neitang < 2}
            onClick={() => {
              if (spyOfficer) setReport(onProbeOfficer(spyOfficer))
              setSpyOfficer('')
            }}
          >
            访
          </button>
        </div>
        {report && <div className="spy-report">{report}</div>}
        <div className="order-row" style={{ marginTop: 6 }}>
          {s.frontiers.slice(0, 5).map((f) => (
            <button
              key={f.id}
              disabled={s.energy < 2 || s.neitang < 2}
              onClick={() => onSpy('frontier', f.id)}
            >
              勘{f.name}
            </button>
          ))}
        </div>
        <div className="adesc" style={{ marginTop: 6 }}>
          访官员：一次看透这个人。勘边镇：查出实额。厂卫贪的，报回来的话就要打折扣。
        </div>
      </div>

      {/* 锦衣卫 */}
      <h3 className="pane-title">锦 衣 卫 · 拿 人</h3>
      <div className="inner-block">
        <div className="prow">
          <span>指挥使</span>
          <b>{jinyi?.name ?? '缺'}</b>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' }}>
            −5 内帑
          </span>
        </div>
        <div className="order-row" style={{ marginTop: 6 }}>
          <select
            className="sel"
            value={arrestTarget}
            onChange={(e) => setArrestTarget(e.target.value)}
          >
            <option value="">选一个官…</option>
            {officials.slice(0, 22).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}（{officeName(o.officeId)}）
              </option>
            ))}
          </select>
          <button
            disabled={!arrestTarget || s.neitang < 5}
            onClick={() => {
              onArrest(arrestTarget)
              setArrestTarget('')
            }}
          >
            下 诏 狱
          </button>
        </div>
        <div className="adesc" style={{ marginTop: 6 }}>
          位子会空出来，朝局会掉。拿错了人——清白的那个——六科会上疏。
        </div>
      </div>

      {/* 锦衣卫 · 打探 */}
      <h3 className="pane-title">锦 衣 卫 · 打 探</h3>
      <div className="inner-block">
        <div className="order-row">
          <select value={spyTarget} onChange={(e) => setSpyTarget(e.target.value)}>
            <option value="">探谁…</option>
            {officials.slice(0, 22).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}（{officeName(o.officeId)}）
              </option>
            ))}
          </select>
          <button
            disabled={!spyTarget || s.neitang < 3}
            onClick={() => {
              if (!spyTarget) return
              setReport(onSpyOfficer(spyTarget))
              setSpyTarget('')
            }}
          >
            打 探 3万
          </button>
        </div>
        <div className="adesc" style={{ marginTop: 6 }}>
          比召对准，也比召对脏。头儿的「干」决定准不准，「贪」决定他会不会被人拿钱堵嘴。
        </div>
        {report && <div className="spy-report">{report}</div>}
      </div>

      {/* 内官监 + 御马监 */}
      <h3 className="pane-title">内 官 监 · 营 造</h3>
      <div className="inner-block">
        <div className="prow">
          <span>掌印</span>
          <b>{neiguan?.name ?? '缺'}</b>
        </div>
        <div className="order-row" style={{ marginTop: 6 }}>
          <button disabled={s.neitang < 18} onClick={() => onBuild('palace')}>
            修宫殿 18万
          </button>
          <button disabled={s.neitang < 25} onClick={() => onBuild('tomb')}>
            建寿宫 25万
          </button>
          <button disabled={s.neitang < 8} onClick={() => onBuild('temple')}>
            敕建寺观 8万
          </button>
        </div>
        <div className="prow" style={{ marginTop: 8 }}>
          <span>御马监</span>
          <b>{yuma?.name ?? '缺'}</b>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-forest)' }}>
            皇庄每旬进内帑 {royalManorIncome(s).toFixed(1)} 万
          </span>
        </div>
      </div>

      {/* 内廷人员 */}
      <h3 className="pane-title">内 臣</h3>
      {s.inner.map((o) => (
        <div className="officer" key={o.id} onClick={() => onInner(o.id)}>
          <div className="oname">
            {o.name}
            <span className="ooffice" style={{ marginLeft: 8 }}>
              {o.title}
            </span>
          </div>
          <div className="dots">
            忠 {o.loyalty} · 干 {o.competence} · 贪 {o.greed} · 势 {o.power}
          </div>
        </div>
      ))}
    </div>
  )
}
