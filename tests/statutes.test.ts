import { describe, expect, it } from 'vitest'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { createInitialState } from '../src/data/opening'
import { instantiate } from '../src/engine/events'
import {
  STATUTES,
  effectLines,
  hiddenStatuteCount,
  statuteLock,
  statuteRuns,
  statuteYield,
  toggleStatute,
  visibleStatutes,
} from '../src/data/statutes'

describe('律令的前置', () => {
  it('没人提过的法，界面上看不到，也立不了', () => {
    const s = initQueue(createInitialState())
    const vis = visibleStatutes(s).map((x) => x.id)
    expect(vis).toContain('kaocheng')
    expect(vis).not.toContain('yitiaobian')
    expect(vis).not.toContain('kuangshui')
    expect(hiddenStatuteCount(s)).toBe(20)

    const after = toggleStatute(s, 'yitiaobian')
    expect(after.statutes.yitiaobian).toBeFalsy()
    expect(after.energy).toBe(s.energy)
  })

  it('奏疏把事摆到桌上之后，这条法才出现、才能立', () => {
    const s = initQueue(createInitialState())
    const opened = { ...s, energy: 10, flags: { ...s.flags, open_yitiaobian: 1 } }
    expect(visibleStatutes(opened).map((x) => x.id)).toContain('yitiaobian')

    const after = toggleStatute(opened, 'yitiaobian')
    expect(after.statutes.yitiaobian).toBe(true)
    expect(after.energy).toBe(7)
    expect(after.flags['st_from_yitiaobian']).toBe(opened.turn)
  })

  it('解锁的奏疏按年岁才出，且出过一次就不再出', () => {
    const s = initQueue(createInitialState())
    // 开局还太早
    expect(instantiate(s, 'open-ytb')).toBeNull()

    const later = { ...s, turn: 10, flags: { ...s.flags } }
    const m = instantiate(later, 'open-ytb')
    expect(m).toBeTruthy()
    expect(m!.from).toContain(' ')

    // 出过一次（flag 置了），不再出
    const done = { ...later, flags: { ...later.flags, open_yitiaobian: 1 } }
    expect(instantiate(done, 'open-ytb')).toBeNull()
  })

  it('每条法都写清了每旬干什么，而且有得有失', () => {
    for (const st of STATUTES) {
      const eff = effectLines(st)
      expect(eff.gains.length + eff.costs.length).toBeGreaterThan(0)
      // 有得有失：两边都得写到，或者至少数值上一正一负
      expect(st.gains.length).toBeGreaterThan(0)
      expect(st.costs.length).toBeGreaterThan(0)
      expect(st.aftermath.length).toBeGreaterThan(8)
    }
  })

  it('互斥的两条法不能并存', () => {
    let s = initQueue(createInitialState())
    s = {
      ...s,
      turn: 12,
      energy: 10,
      flags: { ...s.flags, open_jiangxue: 1, open_jinjiangxue: 1 },
    }
    s = toggleStatute(s, 'jiangxue')
    expect(s.statutes.jiangxue).toBe(true)
    s = { ...s, energy: 10 }
    s = toggleStatute(s, 'jinjiangxue')
    expect(s.statutes.jinjiangxue).toBe(true)
    // 讲学被自动罢掉
    expect(s.statutes.jiangxue).toBeFalsy()
    expect(s.log.some((l) => l.text.includes('不并行'))).toBe(true)
  })

  it('立法的当旬有一次性代价', () => {
    const s = initQueue(createInitialState())
    const before = s.taicang
    const opened = { ...s, energy: 10, flags: { ...s.flags, open_juanmian: 1 } }
    const after = toggleStatute(opened, 'juanmian')
    expect(after.statutes.juanmian).toBe(true)
    // 蠲免要一次性勾销 12 万旧账
    expect(after.taicang).toBe(before - 12)
  })

  it('锁住时说得出理由', () => {
    const s = initQueue(createInitialState())
    const zl = STATUTES.find((x) => x.id === 'zonglu')!
    expect(statuteLock(s, zl)).toContain('宗禄')
    const opened = { ...s, turn: 0, flags: { ...s.flags, open_zonglu: 1 } }
    expect(statuteLock(opened, zl)).toBe('时机未到')
  })
})

describe('律令的账', () => {
  it('施行之后，旬数与解到的银子都记着', () => {
    let s = initQueue(createInitialState())
    s = { ...s, energy: 10, flags: { ...s.flags, open_yitiaobian: 1 } }
    s = toggleStatute(s, 'yitiaobian')
    for (let i = 0; i < 10; i++) s = advanceTurn(s)

    expect(statuteRuns(s, 'yitiaobian')).toBe(10)
    // 每旬 0.55 万，十旬约 5.5 万
    expect(statuteYield(s, 'yitiaobian')).toBeGreaterThan(4)
    expect(s.taicang).toBeGreaterThan(0)
  })

  it('执行汇报的奏疏带着真数进本', () => {
    let s = initQueue(createInitialState())
    s = { ...s, energy: 10, flags: { ...s.flags, open_yitiaobian: 1 } }
    s = toggleStatute(s, 'yitiaobian')
    for (let i = 0; i < 10; i++) s = advanceTurn(s)

    const m = instantiate(s, 'rep-ytb')
    expect(m).toBeTruthy()
    expect(m!.summary).toMatch(/万两/)
    expect(m!.body).toContain('计10旬')
    // 报的数和账上对得上（四舍五入后）
    expect(m!.summary).toContain(String(Math.round(statuteYield(s, 'yitiaobian'))))
  })

  it('没立这条法，就不会有它的执行汇报', () => {
    const s = initQueue(createInitialState())
    expect(instantiate(s, 'rep-ytb')).toBeNull()
  })
})
