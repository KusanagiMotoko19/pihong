import type { Clue, InnerOfficer, WorldState } from './types'
import { applyEffect, findOfficer } from './rules'
import { clamp } from './util'
import { headOf } from '../data/inner'

function clone(s: WorldState): WorldState {
  return structuredClone(s)
}

/** 某个内廷机构的头儿 */
export function innerHead(s: WorldState, officeId: string): InnerOfficer | undefined {
  return headOf(s.inner, officeId)
}

/**
 * 司礼监代批。
 *
 * 授权之后，每旬它替你把一部分本子批了 —— 你省下精力，
 * 但这些本子等于没看。批得对不对，看掌印的人。
 */
export function runAutopilot(s: WorldState): void {
  if (s.autopilot === 0) return
  const head = innerHead(s, 'siliji')
  if (!head) return

  // 忠的不敢乱批，贪的挑省事的批；能干的多批，不行的少批
  const quota = s.autopilot === 1 ? 1 : 2 + (head.competence > 70 ? 1 : 0)
  let done = 0
  const batched: string[] = []

  for (const m of [...s.queue]) {
    if (done >= quota) break
    if (s.autopilot === 1 && m.kind !== 'routine') continue
    if (s.autopilot === 2 && m.kind === 'urgent') continue
    applyEffect(s, m.yiEffect)
    m.resolved = true
    done += 1
    batched.push(m.title)
  }

  s.queue = s.queue.filter((m) => !m.resolved)
  if (done > 0) {
    s.log.push({
      turn: s.turn,
      text: `司礼监代批${done}件：${batched.join('、')}。${head.name}没有说什么，只把批过的本子理好，摞在案角。`,
      tone: 'normal',
    })
    // 代批越多，内廷的势越大 —— 这条线是慢慢长出来的
    head.power = clamp(head.power + 1, 0, 100)
  }
}

/** 设不设代批 */
export function setAutopilot(s: WorldState, level: number): WorldState {
  const next = clone(s)
  next.autopilot = Math.max(0, Math.min(2, level))
  const head = innerHead(next, 'siliji')
  next.log.push({
    turn: next.turn,
    text:
      level === 0
        ? '收回司礼监代批之权。'
        : level === 1
          ? `命司礼监代批例行章奏。${head?.name ?? ''}叩首领旨。`
          : `命司礼监代批除急件外一切章奏。${head?.name ?? ''}叩首领旨，手有点抖。`,
    tone: 'normal',
  })
  return next
}

/* ------------------------------------------------------------------ *
 * 东厂：缉访
 * ------------------------------------------------------------------ */

export type SpyTarget = { kind: 'officer'; id: string } | { kind: 'frontier'; id: string }

export function spyOn(s: WorldState, t: SpyTarget): WorldState {
  const next = clone(s)
  const head = innerHead(next, 'dongchang')
  if (!head) return s
  if (next.energy < 2 || next.neitang < 2) return s
  next.energy -= 2
  next.neitang -= 2

  // 缉访准不准，看这个人的干与贪
  const honest = head.competence - head.greed * 0.4
  const reliable = honest > 40

  if (t.kind === 'officer') {
    const o = findOfficer(next, t.id)
    if (!o) return s
    if (reliable) {
      o.revealed = o.impressions.length // 一次看透
      next.log.push({
        turn: next.turn,
        text:
          `东厂密访${o.name}。回报极细：他几时见客、见的是谁、收了什么、说了什么。` +
          `你看完之后，对这个人的看法变了一半。`,
        tone: 'normal',
      })
    } else {
      // 贪的厂卫，报的未必是真话，还顺手敲一笔
      next.truth.guanfeng = clamp(next.truth.guanfeng - 2, 0, 100)
      next.log.push({
        turn: next.turn,
        text:
          `东厂密访${o.name}。回报只有三行字，都是「查无实据」。` +
          `事后有人递话：${o.name}给了东厂二百两。`,
        tone: 'bad',
      })
    }
  } else {
    const f = next.frontiers.find((x) => x.id === t.id)
    if (!f) return s
    f.audited = true
    next.flags['intel_bianfang'] = 1
    next.flags['intel_bianfang_turn'] = next.turn
    next.log.push({
      turn: next.turn,
      text: `东厂勘核${f.name}兵额。额兵${f.troops.toFixed(1)}万，实额${f.actual.toFixed(1)}万。缺的那一截，有账可查。`,
      tone: 'normal',
    })
  }
  return next
}

/* ------------------------------------------------------------------ *
 * 锦衣卫：拿人
 * ------------------------------------------------------------------ */

export function arrest(s: WorldState, officerId: string): WorldState {
  const next = clone(s)
  const head = innerHead(next, 'jinyiwei')
  if (!head) return s
  if (next.neitang < 5) return s
  const o = findOfficer(next, officerId)
  if (!o || !o.officeId) return s

  next.neitang -= 5
  const wasClean = o.lian > 72
  o.officeId = null
  o.tenure = 0

  next.truth.chaoshi = clamp(next.truth.chaoshi - 6, 0, 100)
  next.truth.guanfeng = clamp(next.truth.guanfeng - 3, 0, 100)

  if (wasClean) {
    next.flags[`wronged_${o.id}`] = 1
    next.log.push({
      turn: next.turn,
      text:
        `锦衣卫下${o.name}于诏狱。此人素有清名，朝中议论纷纷。` +
        `三日之内，六科上了四本疏，都说「诏狱非盛世所宜有」。`,
      tone: 'bad',
    })
  } else {
    next.log.push({
      turn: next.turn,
      text: `锦衣卫下${o.name}于诏狱。抄得赃银若干，朝中一时肃然。`,
      tone: 'normal',
    })
  }
  return next
}

/* ------------------------------------------------------------------ *
 * 内官监：营造
 * ------------------------------------------------------------------ */

export function buildPalace(s: WorldState, kind: 'palace' | 'tomb' | 'temple'): WorldState {
  const next = clone(s)
  const head = innerHead(next, 'neiguanjian')
  if (!head) return s
  const cost = kind === 'palace' ? 18 : kind === 'tomb' ? 25 : 8
  if (next.neitang < cost) return s
  next.neitang -= cost

  const eff = Math.round(head.competence / 20)
  if (kind === 'palace') {
    next.truth.chaoshi = clamp(next.truth.chaoshi + 3 + eff, 0, 100)
    next.truth.minxin = clamp(next.truth.minxin - 2, 0, 100)
    next.log.push({
      turn: next.turn,
      text: `兴修宫殿。内官监领银${cost}万两，工匠三千人。工部上疏，请「稍节土木」。`,
      tone: 'normal',
    })
  } else if (kind === 'tomb') {
    next.truth.chaoshi = clamp(next.truth.chaoshi + 2, 0, 100)
    next.log.push({
      turn: next.turn,
      text: `营建寿宫。内官监领银${cost}万两。这件事，朝中没有人敢说话。`,
      tone: 'normal',
    })
  } else {
    next.truth.minxin = clamp(next.truth.minxin + 3, 0, 100)
    next.log.push({
      turn: next.turn,
      text: `敕建寺观。内官监领银${cost}万两。僧道数百人，为皇上祈福。`,
      tone: 'normal',
    })
  }
  // 营造是内官监的肥差：干得越多，贪得越多
  head.greed = clamp(head.greed + 2, 0, 100)
  head.power = clamp(head.power + 2, 0, 100)
  return next
}

/* ------------------------------------------------------------------ *
 * 御马监：皇庄
 * ------------------------------------------------------------------ */

/** 御马监每旬向内帑解进的银两 */
export function royalManorIncome(s: WorldState): number {
  const head = innerHead(s, 'yumajian')
  if (!head) return 0
  // 干得多收得多，但贪的会截留
  const gross = 1 + head.competence / 40
  const kept = gross * (head.greed / 220)
  return Math.max(0, gross - kept)
}

/** 召见内臣：花两点精力，看清这个人一条底 */
export function meetInner(s: WorldState, id: string): WorldState {
  const next = clone(s)
  if (next.energy < 2) return s
  const o = next.inner.find((x) => x.id === id)
  if (!o || o.revealed >= o.impressions.length) return s
  next.energy -= 2
  o.revealed += 1
  next.log.push({
    turn: next.turn,
    text: `召见${o.title}${o.name}。问了几句宫里的事，他答得很熟。`,
    tone: 'normal',
  })
  return next
}

/**
 * 锦衣卫打探一个人。
 *
 * 比召对准，也比召对脏：头儿的「干」决定消息准不准，「贪」决定他会不会
 * 被人拿钱买通。所以要看你用的是什么人。
 */
export function spyOnOfficer(
  s: WorldState,
  officerId: string,
): { s: WorldState; report: string } {
  const head = innerHead(s, 'jinyiwei')
  const o = s.officers.find((x) => x.id === officerId)
  if (!head || !o) return { s, report: '办不了。' }
  // 三万是底价。贪一点的掌印会多要打点的钱
  const cost = head.greed >= 75 ? 4 : 3
  if (s.neitang < cost) return { s, report: '内帑不足，这笔钱出不起。' }

  const next = clone(s)
  next.neitang -= cost

  // 贪高的人，容易被银子堵住嘴
  const bribeOdds = (head.greed - 50) / 160 // 贪 88 → 0.24
  const bribed = Math.random() < bribeOdds || head.competence < 45
  // 干高的人，报得准
  const slack = head.competence >= 70 ? 1 : 2

  const band = (v: number): 1 | 2 | 3 | 4 | 5 =>
    v >= 85 ? 5 : v >= 70 ? 4 : v >= 55 ? 3 : v >= 40 ? 2 : 1
  const jitter = () => Math.max(1, Math.min(5, (Math.random() < 0.5 ? 1 : -1) * slack)) as
    | 1
    | 2
    | 3
    | 4
    | 5
  const clampB = (b: number) => Math.max(1, Math.min(5, b)) as 1 | 2 | 3 | 4 | 5

  const facetNote: Record<string, string[]> = {
    talent: [
      '问的是公事，答得不含糊，条理清楚',
      '问的是公事，说了半天，说不出个所以然',
      '谈吐明白，只是不肯多说',
    ],
    integrity: [
      '家中并无余财，宅子是租的',
      '家中用度比俸禄高出不少，来路不明',
      '常有人夜里登门，走的后门',
    ],
    temper: [
      '待下甚严，属下都怕他',
      '与同僚往来极少，独来独往',
      '性子急，当众发过一回火',
    ],
  }

  if (bribed) {
    const text = '查无实据。此人行事谨慎，无可指摘。'
    next.log = [
      ...next.log,
      { turn: next.turn, text: `锦衣卫探${o.name}，回话只说「查无实据」。`, tone: 'normal' as const },
    ]
    return { s: next, report: text }
  }

  const picks = ['talent', 'integrity', 'temper'] as const
  const lines: string[] = []
  for (const f of picks) {
    const realBand =
      f === 'talent' ? band(o.neng) : f === 'integrity' ? band(o.lian) : band(Math.round((o.de + o.qin) / 2))
    const spoken = clampB(realBand + (Math.random() < 0.35 ? jitter() : 0))
    const note = facetNote[f][Math.min(2, Math.max(0, 2 - spoken))]
    lines.push(note)
    next.knowledge = { ...next.knowledge }
    const list = [...(next.knowledge[o.id] ?? [])]
    const at = list.findIndex((c) => c.source === 'result')
    const clue = {
      facet: f,
      band: spoken,
      text: note,
      source: 'result' as const,
      from: `锦衣卫（${head.name}）`,
      turn: next.turn,
    }
    if (at >= 0) list[at] = clue
    else list.push(clue)
    next.knowledge[o.id] = list
  }

  next.log = [
    ...next.log,
    {
      turn: next.turn,
      text: `锦衣卫探${o.name}，三日回话，报了三件事。`,
      tone: 'normal' as const,
    },
  ]

  const report =
    `锦衣卫去了三天，回来报了三件事：\n\n` +
    `一、${lines[0]}。\n二、${lines[1]}。\n三、${lines[2]}。\n\n` +
    `（费内帑${cost}万两）`

  return { s: next, report }
}

/**
 * 东厂缉访一个官。
 *
 * 比锦衣卫便宜（内帑二万），也比锦衣卫脏：厂卫拿来的多是「风闻」，
 * 十句里有两三句是买来的。可它有一桩好处 —— 太监是家奴，
 * 他敢查的地方，外廷的官不敢查。
 */
export function dongchangProbe(
  s: WorldState,
  officerId: string,
): { s: WorldState; report: string } {
  const head = innerHead(s, 'dongchang')
  const o = s.officers.find((x) => x.id === officerId)
  if (!head || !o) return { s, report: '办不了。' }
  if (s.neitang < 2) return { s, report: '内帑不足二万，这笔钱出不起。' }

  const next = clone(s)
  next.neitang -= 2

  // 干得低，拿回来的就是街谈巷议；贪得高，回来的话是银子买的
  const fuzzy = head.competence < 55 || Math.random() < (head.greed - 50) / 200 + 0.25

  const band = (v: number): 1 | 2 | 3 | 4 | 5 =>
    v >= 85 ? 5 : v >= 70 ? 4 : v >= 55 ? 3 : v >= 40 ? 2 : 1
  const clampB = (b: number) => Math.max(1, Math.min(5, b)) as 1 | 2 | 3 | 4 | 5

  const pool: { facet: 'talent' | 'integrity' | 'temper'; text: string; real: number }[] = [
    { facet: 'talent', text: '人说此人办事时快时慢，大约是看跟谁办', real: band(o.neng) },
    { facet: 'talent', text: '人说此人条陈写得漂亮，落到纸上就不成了', real: band(o.neng) },
    { facet: 'integrity', text: '人说此人近来手头宽，不知是哪来的', real: band(o.lian) },
    { facet: 'integrity', text: '人说此人从不收礼，连同年送的书都退回去了', real: band(o.lian) },
    { facet: 'temper', text: '人说此人与同僚处不来，动辄争几句', real: band(Math.round((o.de + o.qin) / 2)) },
    { facet: 'temper', text: '人说此人喝起酒来话多，说完就忘', real: band(Math.round((o.de + o.qin) / 2)) },
  ]

  const pick = pool[Math.floor(Math.random() * pool.length)]
  // 风闻就是这样：方向可能对，程度常错，偶尔整个反了
  const spoken = fuzzy
    ? clampB(Math.random() < 0.35 ? 6 - pick.real : pick.real + (Math.random() < 0.5 ? 1 : -1))
    : pick.real

  next.knowledge = { ...next.knowledge }
  const list = [...(next.knowledge[o.id] ?? [])]
  const clue: Clue = {
    facet: pick.facet,
    band: spoken as 1 | 2 | 3 | 4 | 5,
    text: pick.text,
    source: 'rumor' as const,
    from: `东厂（${head.name}）`,
    turn: next.turn,
    false: fuzzy || undefined,
  }
  const at = list.findIndex((c) => c.source === 'rumor' && c.from === clue.from)
  if (at >= 0) list[at] = clue
  else list.push(clue)
  next.knowledge[o.id] = list

  next.log = [
    ...next.log,
    { turn: next.turn, text: `东厂访${o.name}，报来一句风闻。`, tone: 'normal' as const },
  ]

  const report =
    `东厂去了两日，回话只有一句：\n\n「${pick.text}。」\n\n` +
    (fuzzy ? `（番子说得含糊，问细了就推说「都是底下人传的」。费内帑二万两）` : `（费内帑二万两）`)

  return { s: next, report }
}
