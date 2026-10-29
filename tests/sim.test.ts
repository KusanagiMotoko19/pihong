import { describe, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { decree } from '../src/engine/actions'
import { createInitialState } from '../src/data/opening'
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
})
