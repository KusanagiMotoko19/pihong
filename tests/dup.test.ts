import { describe, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { decree } from '../src/engine/actions'
import { createInitialState } from '../src/data/opening'
import type { WorldState } from '../src/engine/types'

function auto(s: WorldState): WorldState {
  let n = s
  for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
  return n
}

describe('重复度体检', () => {
  it('一年里每个事件各出现几次', () => {
    let s = initQueue(createInitialState())
    const count: Record<string, number> = {}
    for (const m of s.queue) count[m.templateId] = (count[m.templateId] ?? 0) + 1
    for (let i = 0; i < 36; i++) {
      s = advanceTurn(s)
      for (const m of s.queue) count[m.templateId] = (count[m.templateId] ?? 0) + 1
      s = auto(s)
    }
    const rows = Object.entries(count).sort((a, b) => b[1] - a[1])
    const total = rows.reduce((a, [, n]) => a + n, 0)
    const out = [
      `总进本 ${total} 件，模板 ${rows.length} 种`,
      `出现 3 次以上的：${rows.filter(([, n]) => n >= 3).length} 种`,
      '',
      ...rows.map(([id, n]) => `${String(n).padStart(3)}  ${id}`),
    ].join('\n')
    writeFileSync(new URL('./dup-out.txt', import.meta.url), out, 'utf8')
  })
})
