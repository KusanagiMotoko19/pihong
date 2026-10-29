import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { createInitialState, TOTAL_TURNS } from '../src/data/opening'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { decree } from '../src/engine/actions'
import { TEMPLATES } from '../src/data/memorials'

describe('五年跑一遍', () => {
  it('看内容够不够', () => {
    let s = initQueue(createInitialState())
    const count = new Map<string, number>()
    const walk = (st: typeof s) => {
      for (const m of st.queue) count.set(m.templateId, (count.get(m.templateId) ?? 0) + 1)
    }
    walk(s)
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = advanceTurn(s)
      walk(s)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    const total = [...count.values()].reduce((a, b) => a + b, 0)
    const top = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    writeFileSync(
      'tests/depth-out.txt',
      JSON.stringify(
        {
          模板库: Object.keys(TEMPLATES).length,
          五年出现过的种类: count.size,
          五年奏疏总数: total,
          最高频: top,
        },
        null,
        2,
      ),
    )
    expect(total).toBeGreaterThan(100)
  })
})
