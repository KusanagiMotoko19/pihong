import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { initQueue, advanceTurn, evaluate } from '../src/engine/tick'
import { decree, readMemorial, recordTopic, setPolicy } from '../src/engine/actions'
import { createInitialState } from '../src/data/opening'
import { orderStats, verifyOrder } from '../src/engine/orders'
import { STATUTES, statuteById, statuteLock, toggleStatute } from '../src/data/statutes'
import type { WorldState } from '../src/engine/types'

function autoDecreeAll(s: WorldState): WorldState {
  let n = s
  for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
  return n
}

function row(s: WorldState): string {
  const p = s.projects[0]
  const weak = s.frontiers.filter((f) => f.readiness < 45).length
  const hot = s.powers.filter((x) => x.threat > 50).length
  return [
    s.turn,
    `${s.date.year}-${String(s.date.month).padStart(2, '0')}-${s.date.xun}`,
    Math.round(s.taicang),
    Math.round(s.taipu),
    `${Math.round(p.progress)}/${Math.round(p.reported)}`,
    s.queue.length,
    s.backlog,
    Math.round(s.truth.minxin),
    Math.round(s.truth.chaoshi),
    Math.round(s.truth.guanfeng),
    weak,
    hot,
  ].join('\t')
}

describe('平衡体检', () => {
  it('两条极端路径的三十六旬曲线', () => {
    const head = [
      'turn', 'date', '太仓', '太仆', '清丈真/报', '案头', '壅滞', '民心', '朝局', '官风', '弱镇', '威胁>50',
    ]

    let a = initQueue(createInitialState())
    const rowsA = [head.join('\t')]
    for (let i = 0; i <= 36; i++) {
      rowsA.push(row(a))
      if (i < 36) a = autoDecreeAll(advanceTurn(a))
    }

    let b = initQueue(createInitialState())
    const rowsB = [head.join('\t')]
    for (let i = 0; i <= 36; i++) {
      rowsB.push(row(b))
      if (i < 36) b = advanceTurn(b)
    }

    const out =
      '\n=== A · 全部依拟（放权）===\n' +
      rowsA.join('\n') +
      '\n\n=== B · 全部留中（怠政）===\n' +
      rowsB.join('\n')
    writeFileSync(new URL('./sim-out.txt', import.meta.url), out, 'utf8')
    console.log(out)
  })

  /* ---------------------------------------------------------------- *
   * 五年、四条路径。原来的体检只跑三十六旬两条路，看不见终局：
   * 太仓会涨到七百万，四条路史评却挤在同一档。这里把差距拉开。
   * ---------------------------------------------------------------- */

  const money = (e: any) =>
    (e?.taicang ?? 0) + (e?.ledger?.taicang ?? 0) + (e?.neitang ?? 0) + (e?.ledger?.neitang ?? 0)
  const virtue = (e: any) =>
    (e?.metrics?.minxin ?? 0) +
    (e?.metric?.minxin ?? 0) +
    (e?.metrics?.guanfeng ?? 0) +
    (e?.metric?.guanfeng ?? 0) +
    (e?.metrics?.chaoshi ?? 0) +
    (e?.metric?.chaoshi ?? 0)

  /** B · 细看每一本，哪个选项给钱多选哪个 */
  function greedyAll(s: WorldState): WorldState {
    let n = s
    for (const m of [...n.queue]) {
      if (!m.read && n.energy >= 1) n = readMemorial(n, m.id)
      const nm = n.queue.find((x) => x.id === m.id)
      if (!nm || nm.resolved) continue
      let best = { key: 'yi', score: money(nm.yiEffect) }
      for (const o of nm.options) {
        if (o.needsReading && !nm.read) continue
        const v = money(o.effect)
        if (v > best.score) best = { key: o.key, score: v }
      }
      n = decree(n, m.id, best.key)
    }
    return n
  }

  /** D · 宽政良治：宽考成、批本看民心官风，剩下的精力拿去认人 */
  function goodAll(s: WorldState): WorldState {
    let n = setPolicy(s, { severity: 1, quota: 85 })
    for (const m of [...n.queue]) {
      if (!m.read && n.energy >= 1) n = readMemorial(n, m.id)
      const nm = n.queue.find((x) => x.id === m.id)
      if (!nm || nm.resolved) continue
      const opts = nm.options.filter((o) => !o.needsReading || nm.read)
      const alive = opts.filter((o) => (o.effect.project?.status ?? '') !== 'failed')
      const pool = alive.length > 0 ? alive : opts
      let best = { key: 'yi', score: virtue(nm.yiEffect) + money(nm.yiEffect) * 0.3 }
      for (const o of pool) {
        const prog = (o.effect.project?.progress ?? 0) * 0.6
        // 会主动议法：凡是能解锁一条律令的选项，给它加分
        const opens = Object.keys(o.effect.flags ?? {}).some((k) => k.startsWith('open_')) ? 40 : 0
        const v = virtue(o.effect) + money(o.effect) * 0.3 + prog + opens
        if (v > best.score) best = { key: o.key, score: v }
      }
      n = decree(n, m.id, best.key)
    }
    for (const o of n.officers.filter((x) => x.officeId).slice(0, 3)) {
      if (n.energy < 2) break
      n = recordTopic(n, o.id, 'politics')
      n = { ...n, energy: n.energy - 2 }
    }
    return n
  }

  /** 立法：按一个「明君」的口味挑，不贪那几条要民命、要朝局的法 */
  const PREFER = [
    'juanmian',
    'mazheng',
    'yanfa',
    'qingjun',
    'shangtun',
    'kaihai',
    'yitiaobian',
    'rongyuan',
    'caiyi',
    'jingying',
    'zonglu',
    'jiangxue',
  ]

  function legislate(s: WorldState, pool: string[] | null): WorldState {
    let n = s
    const ids = pool ?? PREFER
    for (const id of ids) {
      const st = statuteById(id)
      if (!st || n.statutes[id]) continue
      if (statuteLock(n, st)) continue
      if (n.energy < st.cost) break
      n = toggleStatute(n, id)
    }
    return n
  }

  function finalRow(name: string, s: WorldState, extra = ''): string {
    const v = evaluate({ ...s, over: true })
    const os = orderStats(s)
    const p = s.projects[0]
    return (
      `${name}\t太仓${Math.round(s.taicang)} 内帑${Math.round(s.neitang)} 太仆${Math.round(s.taipu)}` +
      ` 清丈${Math.round(p.progress)}/${Math.round(p.reported)} ${p.status}` +
      ` 民心${Math.round(s.truth.minxin)} 边防${Math.round(s.truth.bianfang)}` +
      ` 官风${Math.round(s.truth.guanfeng)} 朝局${Math.round(s.truth.chaoshi)}` +
      ` 壅滞${Math.round(s.backlog)} 报废${s.shelved} 案头${s.queue.length}` +
      ` 政令${os.total}(${os.exposed}虚报) 史评「${v.title}」${v.score}分${extra}`
    )
  }

  it(
    '五年四条路径的终局',
    () => {
      const T = 180
      const out: string[] = []
      for (const [name, fn] of [
        ['A·全依拟', autoDecreeAll],
        ['B·细看贪钱', greedyAll],
        ['C·全留中', (s: WorldState) => s],
        ['D·宽政良治', goodAll],
        // 先立法、再批本：精力只有十点，顺序反了就立不上
        ['E·良治+择法', (s: WorldState) => goodAll(legislate(s, null))],
        [
          'F·全立法（乱来）',
          (s: WorldState) => {
            const opened = { ...s, flags: { ...s.flags } }
            for (const st of STATUTES) if (st.need) opened.flags[st.need.flag] = 1
            return autoDecreeAll(legislate(opened, STATUTES.map((x) => x.id)))
          },
        ],
      ] as [string, (s: WorldState) => WorldState][]) {
        let s = initQueue(createInitialState())
        let peakBacklog = 0
        let peakQueue = 0
        let minTaicang = 999
        let maxTaicang = 0
        for (let i = 0; i < T; i++) {
          s = fn(s)
          peakBacklog = Math.max(peakBacklog, s.backlog)
          peakQueue = Math.max(peakQueue, s.queue.length)
          minTaicang = Math.min(minTaicang, s.taicang)
          maxTaicang = Math.max(maxTaicang, s.taicang)
          s = advanceTurn(s)
        }
        out.push(
          finalRow(
            name,
            s,
            ` 峰值壅滞${Math.round(peakBacklog)} 峰值案头${peakQueue} 太仓区间${Math.round(minTaicang)}~${Math.round(maxTaicang)}`,
          ),
        )
      }
      console.log('\n' + out.join('\n'))
    },
    600000,
  )

  it('政令核实：虚报查得出来，也有人真把事办了', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 60; i++) {
      s = autoDecreeAll(s)
      s = advanceTurn(s)
    }
    const answered = s.orders.filter((o) => o.answered && !o.verified)
    let exposed = 0
    let ok = 0
    for (const o of answered) {
      s = { ...s, energy: 10 }
      const r = verifyOrder(s, o.id)
      if (/相符/.test(r.note)) ok++
      else exposed++
      s = r.s
    }
    console.log(`核实政令：${answered.length} 条已回话 → 虚报 ${exposed} 条、相符 ${ok} 条`)
    expect(answered.length).toBeGreaterThan(0)
    // 全虚报说明阈值太低，全相符说明这套机制没用
    expect(exposed).toBeGreaterThan(0)
    expect(ok).toBeGreaterThan(0)
  })
})
