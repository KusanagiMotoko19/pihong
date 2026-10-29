import { describe, expect, it } from 'vitest'
import { createInitialState } from '../src/data/opening'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { decree } from '../src/engine/actions'
import { resolveSender } from '../src/engine/sender'

describe('缘起覆盖', () => {
  it('统计哪些奏疏没有背景', () => {
    let s = initQueue(createInitialState())
    const miss = new Set<string>()
    const seen = new Set<string>()
    const scan = (st: typeof s) => {
      for (const m of st.queue) {
        seen.add(m.templateId)
        if (!m.background) miss.add(`${m.templateId} | ${m.title}`)
      }
    }
    scan(s)
    for (let i = 0; i < 36; i++) {
      s = advanceTurn(s)
      scan(s)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    expect(seen.size).toBeGreaterThan(20)
    expect([...miss]).toEqual([])
  })
})

describe('职名', () => {
  it('署名不能只写衙门简称（「工部 某人」要写成「工部尚书 某人」）', () => {
    let s = initQueue(createInitialState())
    const bad: string[] = []
    const check = (from: string) => {
      if (/^(工部|户部|兵部|刑部|礼部|吏部) /.test(from)) bad.push(from)
    }
    for (const m of s.queue) check(m.from)
    for (let i = 0; i < 36; i++) {
      s = advanceTurn(s)
      for (const m of s.queue) check(m.from)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    expect(bad).toEqual([])
  })
})

describe('署名换算', () => {
  it('衙门简称补成正式职名', () => {
    const s = createInitialState()
    expect(resolveSender(s, '工部').text).toMatch(/^工部尚书 \S+/)
    expect(resolveSender(s, '户部').text).toMatch(/^户部尚书 \S+/)
    expect(resolveSender(s, '兵部').text).toMatch(/^兵部尚书 \S+/)
    expect(resolveSender(s, '礼部').text).toMatch(/^礼部尚书 \S+/)
    // 已经是全称的不要重复堆叠
    expect(resolveSender(s, '户部尚书').text).toMatch(/^户部尚书 \S+$/)
  })
})
