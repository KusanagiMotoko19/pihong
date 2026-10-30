import { describe, expect, it } from 'vitest'
import { createInitialState, TOTAL_TURNS } from '../src/data/opening'
import { advanceTurn, evaluate, initQueue, nextDate } from '../src/engine/tick'
import { generateIncoming } from '../src/engine/events'
import { audience, decree, dismissOfficer, readMemorial, recordTopic, stayMemorial } from '../src/engine/actions'
import { computeReported, distortion, serving, tickFrontiers, tickPowers, tickTreasury } from '../src/engine/rules'
import { arrest, dongchangProbe, spyOnOfficer } from '../src/engine/inner'
import { INNER_OFFICES } from '../src/data/inner'
import { OFFICES } from '../src/engine/offices'
import { toggleStatute } from '../src/data/statutes'
import { verifyOrder } from '../src/engine/orders'
import { ask } from '../src/data/speech'
import type { MetricKey, WorldState } from '../src/engine/types'

const KEYS: MetricKey[] = ['minxin', 'bianfang', 'guanfeng', 'chaoshi']

describe('旬制', () => {
  it('三旬为一月，十二为一岁', () => {
    expect(nextDate({ year: 1582, month: 6, xun: 1 })).toEqual({ year: 1582, month: 6, xun: 2 })
    expect(nextDate({ year: 1582, month: 6, xun: 3 })).toEqual({ year: 1582, month: 7, xun: 1 })
    expect(nextDate({ year: 1582, month: 12, xun: 3 })).toEqual({ year: 1583, month: 1, xun: 1 })
  })

  it('一年正好三十六旬', () => {
    expect(TOTAL_TURNS).toBe(180)
  })
})

describe('官员名册', () => {
  it('四百人：在任一百上下，其余在人才库', () => {
    const s = createInitialState()
    expect(s.officers.length).toBeGreaterThanOrEqual(400)
    const inOffice = serving(s)
    expect(inOffice.length).toBeGreaterThan(70)
    expect(inOffice.length).toBeLessThan(130)
  })

  it('一个位子只坐一个人', () => {
    const s = createInitialState()
    const ids = serving(s).map((o) => o.officeId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个位子都在官职表里', () => {
    const s = createInitialState()
    const valid = new Set(OFFICES.map((o) => o.id))
    for (const o of serving(s)) {
      expect(valid.has(o.officeId!)).toBe(true)
    }
  })

  it('历史名臣在朝，且数值高于常人', () => {
    const s = createInitialState()
    const qi = s.officers.find((o) => o.id === 'qijiguang')!
    expect(qi).toBeDefined()
    expect(qi.neng).toBeGreaterThan(90)
    expect(qi.officeId).toBe('zz-jizhou')
  })

  it('每人都有考语与三条召对印象', () => {
    const s = createInitialState()
    for (const o of s.officers.slice(0, 50)) {
      expect(o.appraisal.length).toBeGreaterThan(6)
      expect(o.impressions.length).toBeGreaterThan(0)
    }
  })
})

describe('失真', () => {
  it('四维奏报值一律不低于真值', () => {
    const s = createInitialState()
    const r = computeReported(s)
    for (const k of KEYS) expect(r[k]).toBeGreaterThanOrEqual(s.truth[k])
  })

  it('考成放松之后，偏差变小', () => {
    const s = createInitialState()
    const strict = distortion(s)
    s.policy.severity = 1
    expect(distortion(s)).toBeLessThan(strict)
  })

  it('在任官员更清廉，偏差也变小', () => {
    const s = createInitialState()
    const before = distortion(s)
    for (const o of serving(s)) o.lian = 92
    expect(distortion(s)).toBeLessThan(before)
  })
})

describe('事项', () => {
  it('跑一年之后，奏报进度明显跑在真实进度前面', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 36; i++) s = advanceTurn(s)
    const p = s.projects[0]
    expect(p.progress).toBeGreaterThan(0)
    expect(p.reported).toBeGreaterThan(p.progress + 10)
  })
})

describe('批红', () => {
  it('细看一本耗一点精力，且只耗一次', () => {
    const s = initQueue(createInitialState())
    const id = s.queue[0].id
    const s1 = readMemorial(s, id)
    expect(s1.energy).toBe(s.energy - 1)
    expect(readMemorial(s1, id).energy).toBe(s1.energy)
  })

  it('没细看不能改拟', () => {
    const s = initQueue(createInitialState())
    const target = s.queue.find((m) => m.options.some((o) => o.needsReading))
    if (!target) return
    const alt = target.options.find((o) => o.needsReading)!
    expect(decree(s, target.id, alt.key).queue.length).toBe(s.queue.length)
  })

  it('依拟照票拟走', () => {
    const s = initQueue(createInitialState())
    const m = s.queue.find((x) => x.templateId === 'qz-open')!
    const before = s.projects[0].reported
    const after = decree(s, m.id, 'yi')
    expect(after.projects[0].reported).toBeGreaterThan(before)
  })
})

describe('留中', () => {
  it('留中的本子计入壅滞', () => {
    let s = initQueue(createInitialState())
    for (const m of [...s.queue]) s = stayMemorial(s, m.id)
    s = advanceTurn(s)
    expect(s.backlog).toBeGreaterThan(0)
  })

  it('逾期不批，本子进 shelved，永不消失', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 12; i++) s = advanceTurn(s)
    expect(s.shelved).toBeGreaterThan(0)
    expect(s.backlog).toBeGreaterThanOrEqual(s.shelved)
  })
})

describe('叙事链', () => {
  it('清丈题本出过之后，会开出一条线来', () => {
    let s = initQueue(createInitialState())
    expect(s.queue.some((m) => m.templateId === 'qz-open')).toBe(true)
    s = advanceTurn(s)
    expect(s.flags.qz_open).toBe(1)
  })

  it('密奏要等线开了才出', () => {
    const s = createInitialState() // 干净开局，qz_open 还没置位
    const early = generateIncoming(s, 0).filter((m) => m.templateId === 'qz-secret')
    expect(early.length).toBe(0)
  })

  it('线开了之后，十几旬之内密奏一定会来', () => {
    let s = initQueue(createInitialState())
    let seen = false
    for (let i = 0; i < 14 && !seen; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === 'qz-secret')) seen = true
    }
    expect(seen).toBe(true)
  })
})

describe('召对', () => {
  it('花两点精力，开一场召对', () => {
    const s = initQueue(createInitialState())
    const o = s.officers[0]
    const after = audience(s, o.id)
    expect(after.energy).toBe(s.energy - 2)
  })

  it('问了一句，才有一条自己的判断', () => {
    const s = initQueue(createInitialState())
    const o = s.officers[0]
    expect(s.knowledge[o.id]).toBeUndefined()
    const after = recordTopic(s, o.id, 'politics')
    expect(after.knowledge[o.id]).toHaveLength(1)
    expect(after.knowledge[o.id][0].facet).toBe('talent')
  })

  it('问两次不同的话题，就是两条线索', () => {
    const s = initQueue(createInitialState())
    const o = s.officers[0]
    const a = recordTopic(s, o.id, 'politics')
    const b = recordTopic(a, o.id, 'family')
    expect(b.knowledge[o.id]).toHaveLength(2)
  })
})

describe('九边与四夷', () => {
  it('额兵与实额之间有差额，且未查时不可见', () => {
    const s = createInitialState()
    const f = s.frontiers[0]
    expect(f.actual).toBeLessThan(f.troops)
    expect(f.audited).toBe(false)
  })

  it('建州会自己长大，不管你在做什么', () => {
    const s = createInitialState()
    const before = s.powers.find((p) => p.id === 'jianzhou')!.strength
    for (let i = 0; i < 20; i++) tickPowers(s)
    expect(s.powers.find((p) => p.id === 'jianzhou')!.strength).toBeGreaterThan(before + 5)
  })

  it('饷断了，边镇战备往下掉', () => {
    const s = createInitialState()
    s.taicang = 5
    const before = s.frontiers[0].readiness
    for (let i = 0; i < 5; i++) tickFrontiers(s)
    expect(s.frontiers[0].readiness).toBeLessThan(before)
  })
})

describe('整局', () => {
  it('走满三十六旬即终局，且能给史评', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < TOTAL_TURNS; i++) s = advanceTurn(s)
    expect(s.over).toBe(true)
    const v = evaluate(s)
    expect(v.title.length).toBeGreaterThan(0)
    expect(v.lines.length).toBeGreaterThan(3)
  })

  it('一年下来太仓是往下走的', () => {
    let s = initQueue(createInitialState())
    const start = s.taicang
    for (let i = 0; i < TOTAL_TURNS; i++) s = advanceTurn(s)
    expect(s.taicang).toBeLessThan(start)
  })

  it('一年里进本不会断档', () => {
    let s = initQueue(createInitialState())
    let total = s.queue.length
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = advanceTurn(s)
      total += s.incoming
    }
    expect(total).toBeGreaterThan(60)
  })
})

describe('内廷', () => {
  it('内廷是另一套人，不与文官名册重叠', () => {
    const s = createInitialState()
    expect(s.inner.length).toBeGreaterThan(8)
    const valid = new Set(INNER_OFFICES.map((o) => o.id))
    for (const o of s.inner) {
      expect(valid.has(o.officeId)).toBe(true)
    }
    // 内廷的人不能出现在文官名册里
    const innerNames = new Set(s.inner.map((o) => o.name))
    expect(s.officers.some((o) => innerNames.has(o.name))).toBe(false)
  })

  it('授权代批之后，案头的本子比不授权时少', () => {
    // 一旬进八到十本，代批只代两三本 —— 比的是「授不授权」，不是绝对数
    let a = initQueue(createInitialState())
    for (let i = 0; i < 3; i++) a = advanceTurn(a)
    let b = initQueue(createInitialState())
    b.autopilot = 2
    for (let i = 0; i < 3; i++) b = advanceTurn(b)
    expect(b.queue.length).toBeLessThan(a.queue.length)
  })

  it('锦衣卫拿人，位子空出来', () => {
    const s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId === 'hubu-shangshu')!
    const after = arrest(s, target.id)
    expect(after.officers.find((o) => o.id === target.id)!.officeId).toBeNull()
  })

  it('户部尚书越能干，太仓进得越多', () => {
    const a = createInitialState()
    const b = createInitialState()
    a.officers.find((o) => o.officeId === 'hubu-shangshu')!.neng = 95
    b.officers.find((o) => o.officeId === 'hubu-shangshu')!.neng = 35
    tickTreasury(a)
    tickTreasury(b)
    expect(a.taicang).toBeGreaterThan(b.taicang)
  })
})

describe('署名', () => {
  it('一年里每一本奏疏都有人名（藩王、乡绅、密奏除外）', () => {
    let s = initQueue(createInitialState())
    const bad: string[] = []
    const check = (from: string) => {
      if (/襄王|乡绅/.test(from)) return
      const core = from.replace(/（[^）]*）/g, '').trim()
      if (!core.includes(' ')) bad.push(from)
    }
    for (const m of s.queue) check(m.from)
    for (let i = 0; i < 36; i++) {
      s = advanceTurn(s)
      for (const m of s.queue) check(m.from)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    if (bad.length) console.error('BAD_NAMES', [...new Set(bad)])
    expect(bad).toEqual([])
  })
})

describe('人言与密访', () => {
  it('一旬过去，总有几句话进耳朵', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 12; i++) s = advanceTurn(s)
    const rumors = Object.values(s.knowledge).flat().filter((c) => c.source === 'rumor')
    expect(rumors.length).toBeGreaterThan(0)
    // 人言带着说话人
    expect(rumors.every((c) => !!c.from)).toBe(true)
  })

  it('锦衣卫打探，花三万内帑，换来几条线索', () => {
    const s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId)!
    const r = spyOnOfficer(s, target.id)
    expect(r.s.neitang).toBeLessThan(s.neitang)
    expect(r.report.length).toBeGreaterThan(10)
    // 被买通时只回报「查无实据」，不给线索
    if (!/查无实据/.test(r.report)) {
      const clues = r.s.knowledge[target.id] ?? []
      expect(clues.length).toBeGreaterThan(0)
    }
  })

  it('内帑不够就打探不了', () => {
    const s = { ...initQueue(createInitialState()), neitang: 1 }
    const target = s.officers.find((o) => o.officeId)!
    const r = spyOnOfficer(s, target.id)
    expect(r.s.neitang).toBe(1)
    expect(r.report).toMatch(/不足|办不了/)
  })
})

describe('结局对账', () => {
  it('召对过的人，结局里会被翻出来对一次', () => {
    let s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId)!
    s = audience(s, target.id)
    s = recordTopic(s, target.id, 'politics')
    const v = evaluate(s)
    expect(v.people.length).toBeGreaterThan(0)
    const row = v.people.find((x) => x.name === target.name)
    expect(row).toBeTruthy()
    expect(row!.judged).not.toContain('没单独问过')
    expect(row!.actual.length).toBeGreaterThan(0)
    expect(row!.comment.length).toBeGreaterThanOrEqual(4)
  })

  it('没问过的人，结局里写明你没问过', () => {
    const s = initQueue(createInitialState())
    const v = evaluate(s)
    const untouched = v.people.filter((p) => p.judged.includes('没单独问过'))
    expect(untouched.length).toBeGreaterThan(0)
  })
})

describe('律令与奏疏联动', () => {
  it('废了考成，户部会来找你要钱', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 9; i++) s = advanceTurn(s)
    s = toggleStatute(s, 'kaocheng')
    expect(s.statutes.kaocheng).toBeFalsy()
    let found = false
    for (let i = 0; i < 6; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === 'kc-abolished-pay')) found = true
    }
    expect(found).toBe(true)
  })

  it('开了矿税，地方上会闹', () => {
    let s = initQueue(createInitialState())
    // 直接开到能动的旬数，并把「开矿」的奏疏走一遍（法要有由头才立得起来）
    for (let i = 0; i < 20; i++) s = advanceTurn(s)
    s = { ...s, energy: 8, flags: { ...s.flags, open_kuangshui: 1 } }
    s = toggleStatute(s, 'kuangshui')
    expect(s.statutes.kuangshui).toBe(true)
    let found = false
    for (let i = 0; i < 8; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === 'ks-riot')) found = true
    }
    expect(found).toBe(true)
  })

  it('律令会改国家走向：矿税给内帑，压民心', () => {
    let a = initQueue(createInitialState())
    let b: WorldState = { ...a, statutes: { ...a.statutes, kuangshui: true } }
    for (let i = 0; i < 12; i++) {
      a = advanceTurn(a)
      b = advanceTurn(b)
    }
    expect(b.neitang).toBeGreaterThan(a.neitang)
    expect(b.truth.minxin).toBeLessThan(a.truth.minxin)
  })
})

describe('事件依赖前情', () => {
  const appear = (flags: Record<string, number>, id: string, from = 30) => {
    let s = initQueue(createInitialState())
    s = { ...s, turn: from, flags: { ...s.flags, ...flags } }
    for (let i = 0; i < 14; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === id)) return true
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    return false
  }

  it('没夺张居正的爵，就没有抄家那一本', () => {
    expect(appear({}, 'y11-raid-home')).toBe(false)
  })

  it('夺了爵，抄家就会来', () => {
    expect(appear({ zhang_stripped: 1 }, 'y11-raid-home')).toBe(true)
  })

  it('京察没加严，就没有顾宪成鸣冤', () => {
    expect(appear({}, 'y13-purge', 104)).toBe(false)
  })

  it('京察加了严，就有人鸣冤', () => {
    expect(appear({ kaocha_strict: 1 }, 'y13-purge', 104)).toBe(true)
  })
})

describe('收口与缉访', () => {
  const appear = (flags: Record<string, number>, id: string, from = 30) => {
    let s = initQueue(createInitialState())
    s = { ...s, turn: from, flags: { ...s.flags, ...flags } }
    for (let i = 0; i < 14; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === id)) return true
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    return false
  }

  it('冯保倒了，司礼监才会空出来', () => {
    expect(appear({}, 'fb-after')).toBe(false)
    expect(appear({ fb_dead: 1 }, 'fb-after')).toBe(true)
  })

  it('宽考一年，才有逋欠那本', () => {
    expect(appear({ kc_loose: 1 }, 'kc-loose-end', 20)).toBe(true)
  })

  it('东厂访官，回话进听闻，且可能不准', () => {
    const s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId)!
    const r = dongchangProbe(s, target.id)
    expect(r.s.neitang).toBeLessThan(s.neitang)
    const clues = r.s.knowledge[target.id] ?? []
    expect(clues.length).toBe(1)
    expect(clues[0].source).toBe('rumor')
    expect(clues[0].from).toContain('东厂')
  })
})

describe('罢免的代价', () => {
  it('罢得越重，朝局掉得越多', () => {
    const s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId)!
    const a = dismissOfficer(s, target.id, 'plain')
    const b = dismissOfficer(s, target.id, 'confiscate')
    expect(b.truth.chaoshi).toBeLessThan(a.truth.chaoshi)
    expect(b.taicang).toBeGreaterThan(a.taicang)
  })

  it('同党的人声望会掉', () => {
    const s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId && o.faction !== '无党')!
    const allies = s.officers.filter(
      (x) => x.officeId && x.faction === target.faction && x.id !== target.id,
    )
    const after = dismissOfficer(s, target.id, 'jail')
    if (allies.length > 0) {
      const a0 = s.officers.find((x) => x.id === allies[0].id)!.reputation
      const a1 = after.officers.find((x) => x.id === allies[0].id)!.reputation
      expect(a1).toBeLessThan(a0)
    }
  })

  it('罢完人，会有人上疏申救', () => {
    let s = initQueue(createInitialState())
    const target = s.officers.find((o) => o.officeId)!
    s = dismissOfficer(s, target.id, 'jail')
    let found = false
    for (let i = 0; i < 5; i++) {
      s = advanceTurn(s)
      if (s.queue.some((m) => m.templateId === 'purge-backlash')) found = true
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    expect(found).toBe(true)
  })
})

describe('党争', () => {
  it('跑一两年，朝中会有保举攻讦的痕迹', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 40; i++) s = advanceTurn(s)
    const marks = s.log.filter(
      (l) => l.text.includes('交章荐') || l.text.includes('攻') || l.text.includes('联名'),
    )
    expect(marks.length).toBeGreaterThan(0)
  })
})

describe('抄家的账', () => {
  const withLian = (lian: number, id: string) => {
    const s = structuredClone(initQueue(createInitialState()))
    s.officers.find((o) => o.id === id)!.lian = lian
    return s
  }

  it('越贪的官，抄出来的钱越多', () => {
    const base = initQueue(createInitialState())
    const t = base.officers.find((o) => o.officeId && o.id.startsWith('o_'))!
    const greedy = dismissOfficer(withLian(10, t.id), t.id, 'confiscate')
    const clean = dismissOfficer(withLian(95, t.id), t.id, 'confiscate')
    expect(greedy.taicang).toBeGreaterThan(clean.taicang)
  })

  it('抄贪官，朝局和官风往上走；抄清官，全往下走', () => {
    const base = initQueue(createInitialState())
    const t = base.officers.find((o) => o.officeId && o.id.startsWith('o_'))!
    const greedy = dismissOfficer(withLian(10, t.id), t.id, 'confiscate')
    const clean = dismissOfficer(withLian(95, t.id), t.id, 'confiscate')
    expect(greedy.truth.chaoshi).toBeGreaterThan(clean.truth.chaoshi)
    expect(greedy.truth.guanfeng).toBeGreaterThan(clean.truth.guanfeng)
  })
})

describe('政令', () => {
  it('批了急件，就有一道政令交出去', () => {
    let s = initQueue(createInitialState())
    const m = s.queue.find((x) => x.kind === 'urgent' || x.kind === 'project')
    if (m) {
      s = decree(s, m.id, 'yi')
      expect(s.orders.length).toBeGreaterThan(0)
      expect(s.orders[0].executorName.length).toBeGreaterThan(0)
    }
  })

  it('办着办着会到期限，然后回话', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 20 && !s.orders.length; i++) {
      s = advanceTurn(s)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    expect(s.orders.length).toBeGreaterThan(0)
    for (let i = 0; i < 24; i++) s = advanceTurn(s)
    expect(s.orders.some((o) => o.answered)).toBe(true)
  })

  it('报上来的进度可能高于实际', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 20 && !s.orders.length; i++) {
      s = advanceTurn(s)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    for (let i = 0; i < 30; i++) s = advanceTurn(s)
    const answered = s.orders.filter((o) => o.answered)
    expect(answered.length).toBeGreaterThan(0)
    // 至少有一道，报的数不低于真数
    expect(answered.every((o) => o.reported >= o.progress - 0.001)).toBe(true)
  })

  it('核实要花精力，而且能翻出虚报', () => {
    let s = initQueue(createInitialState())
    for (let i = 0; i < 20 && !s.orders.length; i++) {
      s = advanceTurn(s)
      let n = s
      for (const m of [...n.queue]) n = decree(n, m.id, 'yi')
      s = n
    }
    for (let i = 0; i < 30; i++) s = advanceTurn(s)
    const ord = s.orders.find((o) => o.answered && !o.verified)
    if (ord) {
      const before = s.energy
      const r = verifyOrder(s, ord.id)
      expect(r.s.energy).toBe(before - 1)
      expect(r.s.orders.find((o) => o.id === ord.id)!.verified).toBe(true)
      expect(r.note.length).toBeGreaterThan(0)
    }
  })
})

describe('召对不能把自己说成别人', () => {
  it('问人事，回答里不会出现自己的名字', () => {
    const s = initQueue(createInitialState())
    const targets = s.officers.filter((o) => o.officeId).slice(0, 40)
    const bad: string[] = []
    for (const o of targets) {
      const ex = ask(o, 'people', s)
      // 「某某与臣是同乡」里的某某，不能是他自己
      if (ex.say.includes(`${o.name}与臣`)) bad.push(o.name)
    }
    expect(bad).toEqual([])
  })

  it('张四维被召对，不会说「张四维与臣是同乡」', () => {
    const s = initQueue(createInitialState())
    const zhang = s.officers.find((o) => o.name === '张四维')
    if (zhang) {
      const ex = ask(zhang, 'people', s)
      expect(ex.say).not.toContain('张四维与臣')
    }
  })
})
