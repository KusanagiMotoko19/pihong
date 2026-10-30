import { describe, expect, it } from 'vitest'
import { initQueue, advanceTurn } from '../src/engine/tick'
import { appointOfficer, projectAction } from '../src/engine/actions'
import { createInitialState } from '../src/data/opening'
import { instantiate } from '../src/engine/events'
import { clearanceGain, tickProject, tickTreasury } from '../src/engine/rules'
import { candidatesFor } from '../src/engine/roster'
import { evaluate } from '../src/engine/tick'
import type { WorldState } from '../src/engine/types'

/**
 * 玩家反馈回归。
 *
 * 一、清丈多出来的田亩不增加财政 —— 清丈成了纯数字游戏。
 * 二、丁忧的人又出现在候补名录 —— 丁忧被当成罢官处理。
 * 三、对藩王苛刻没有实质影响。
 * 四、三维干到 100、朝局只剩 5，却没有崩坏迹象；剧情重复且无后续。
 */

describe('清丈要能变成钱', () => {
  it('清丈告竣之后，同样一日解到的税银更多', () => {
    const a = initQueue(createInitialState())
    const b = initQueue(createInitialState())
    // 只差清丈的状态：a 在建，b 已告竣
    b.projects[0] = { ...b.projects[0], status: 'done', progress: 100, reported: 100 }
    tickTreasury(a)
    tickTreasury(b)
    expect(b.taicang).toBeGreaterThan(a.taicang)
  })

  it('清丈未告竣时，已丈的部分也带一点（按进度折半）', () => {
    const a = initQueue(createInitialState())
    const b = initQueue(createInitialState())
    b.projects[0] = { ...b.projects[0], progress: 100 }
    tickTreasury(a)
    tickTreasury(b)
    expect(b.date.xun).toBe(1)
    expect(b.taicang).toBeGreaterThan(a.taicang)
  })

  it('项目页要报得出「清出多少田、折多少岁入」', () => {
    const p = createInitialState().projects[0]
    // 未完成、进度一半：田按进度算，钱只算折半
    const half = clearanceGain({ ...p, progress: 50, status: 'running' })
    expect(half.qing).toBeCloseTo(41.4, 1)
    expect(half.silver).toBeGreaterThan(0)
    // 告竣：全额
    const done = clearanceGain({ ...p, progress: 100, status: 'done' })
    expect(done.qing).toBeCloseTo(82.8, 1)
    expect(done.silver).toBeGreaterThan(half.silver)
  })
})

describe('丁忧不是罢官', () => {
  const leave = (s: WorldState, id: string, xun: number): WorldState => ({
    ...s,
    officers: s.officers.map((o) =>
      o.id === id ? { ...o, officeId: null, leaveUntil: s.turn + xun } : o,
    ),
  })

  it('守制的人不在候补名录里', () => {
    const s = initQueue(createInitialState())
    const o = s.officers.find((x) => x.officeId)!
    const after = leave(s, o.id, 81)
    const cands = candidatesFor(after.officers, 'hubu-zuo', 3, after.turn)
    expect(cands.some((c) => c.id === o.id)).toBe(false)
    // 名录里其他人还是有的
    expect(cands.length).toBeGreaterThan(0)
  })

  it('守制未满不能起用；期满可以', () => {
    const s = initQueue(createInitialState())
    const o = s.officers.find((x) => x.officeId)!
    const after = leave(s, o.id, 81)
    const tried = appointOfficer(after, o.id, 'hubu-zuo')
    expect(tried.officers.find((x) => x.id === o.id)!.officeId).toBeNull()

    const later = { ...after, turn: after.turn + 82 }
    const ok = appointOfficer(later, o.id, 'hubu-zuo')
    expect(ok.officers.find((x) => x.id === o.id)!.officeId).toBe('hubu-zuo')
  })
})

describe('四维见底要真的坏事', () => {
  it('朝局极低：政令中格、库银损耗，并留一条实录', () => {
    const base = initQueue(createInitialState())
    const healthy = { ...base, truth: { ...base.truth, chaoshi: 70 } }
    const broken = { ...base, truth: { ...base.truth, chaoshi: 5 } }
    const a = advanceTurn(healthy)
    const b = advanceTurn(broken)

    expect(b.taicang).toBeLessThan(a.taicang)
    expect(b.flags.crisis_chaoshi).toBe(1)
    expect(b.log.some((l) => l.text.includes('政令中格'))).toBe(true)
  })

  it('三面见底：记一笔亡国之象', () => {
    const base = initQueue(createInitialState())
    const broken = {
      ...base,
      truth: { ...base.truth, chaoshi: 5, minxin: 5, guanfeng: 5 },
    }
    const s = advanceTurn(broken)
    expect(s.flags.crisis_total).toBe(1)
    expect(s.log.some((l) => l.text.includes('三面见底'))).toBe(true)
  })
})

describe('宗室会反制', () => {
  it('宗禄折色之后，藩府闭门不纳命官', () => {
    const s = initQueue(createInitialState())
    const t = {
      ...s,
      turn: 20,
      statutes: { ...s.statutes, zonglu: true },
      truth: { ...s.truth, chaoshi: 40 },
    }
    const m = instantiate(t, 'zl-refuse')
    expect(m).toBeTruthy()
    expect(m!.body).toContain('代府')
    expect(m!.options.length).toBeGreaterThanOrEqual(2)
  })

  it('宗室越关赴京：苛刻宗室才有的戏', () => {
    const s = initQueue(createInitialState())
    const t = {
      ...s,
      turn: 25,
      statutes: { ...s.statutes, zonglu: true },
      truth: { ...s.truth, chaoshi: 40 },
    }
    expect(instantiate(t, 'zl-petition')).toBeTruthy()
    // 没有这条法，就不该有这本
    expect(instantiate({ ...t, statutes: { ...t.statutes, zonglu: false } }, 'zl-petition')).toBeNull()
  })

  it('藩府会联名，也会养私兵', () => {
    const s = initQueue(createInitialState())
    const t = {
      ...s,
      turn: 26,
      statutes: { ...s.statutes, zonglu: true },
      truth: { ...s.truth, chaoshi: 40 },
    }
    const union = instantiate(t, 'zl-union')
    expect(union).toBeTruthy()
    expect(union!.summary).toContain('联名')

    const guards = instantiate({ ...t, turn: 30 }, 'zl-guards')
    expect(guards).toBeTruthy()
    expect(guards!.body).toContain('家丁')

    // 朝局不坏到那份上，就没有私兵这一出
    const calm = { ...t, turn: 30, truth: { ...t.truth, chaoshi: 80 } }
    expect(instantiate(calm, 'zl-guards')).toBeNull()
  })
})

describe('投献咬在三个系统上', () => {
  it('投献越多，税基越薄', () => {
    const clean = initQueue(createInitialState())
    const dirty = { ...initQueue(createInitialState()), flags: { touxian: 8 } }
    tickTreasury(clean)
    tickTreasury(dirty)
    expect(dirty.taicang).toBeLessThan(clean.taicang)
  })

  it('投献过六成，清丈被拖着走', () => {
    const s = initQueue(createInitialState())
    const calm = { ...s, flags: { ...s.flags } }
    const plagued = { ...s, flags: { ...s.flags, touxian: 10 } }
    const p1 = { ...calm.projects[0] }
    const p2 = { ...plagued.projects[0] }
    tickProject({ ...calm, projects: [p1] }, p1)
    tickProject({ ...plagued, projects: [p2] }, p2)
    expect(p2.progress).toBeLessThan(p1.progress)
  })

  it('亲阅册籍能压一压投献', () => {
    const s = { ...initQueue(createInitialState()), flags: { touxian: 5 }, energy: 10 }
    const after = projectAction(s, 'qingzhang', 'inspect')
    expect(after.flags.touxian).toBe(4)
  })

  it('没有清丈、没有一条鞭、没有宗室法，就没有投献这一出', () => {
    const bare = { ...createInitialState(), statutes: { kaocheng: true }, projects: [] }
    expect(instantiate(bare, 'touxian-open')).toBeNull()
  })

  it('投献成风之后，史评会点出来', () => {
    const s = { ...createInitialState(), flags: { touxian: 9 } }
    const v = evaluate(s)
    expect(v.lines.some((l) => l.includes('投献'))).toBe(true)
  })
})

describe('重复的奏疏要有交代', () => {
  it('同一本子第二次出现，正文里会写「前后几疏」', () => {
    // 用未铺开案的初始状态：initQueue 已经把首批本子记进 reps 了
    const s = createInitialState()
    const first = instantiate(s, 'caoliang')
    expect(first).toBeTruthy()
    expect(first!.body).not.toContain('前后')
    const again = { ...s, flags: { ...s.flags, reps_caoliang: 1 } }
    const second = instantiate(again, 'caoliang')
    expect(second!.body).toContain('前后')
  })
})
