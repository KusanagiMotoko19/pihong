import type { Memorial, WorldState } from './types'
import { clamp } from './util'
import {
  applyEffect,
  computeReported,
  tickBacklog,
  tickFrontiers,
  tickPowers,
  tickProject,
  tickTreasury,
} from './rules'
import { generateIncoming } from './events'
import { spawnRumors } from './rumors'
import { tickOrders } from './orders'
import { tickStatutes } from '../data/statutes'
import { tickFactions } from '../data/memorials/line-faction'
import { readClue, wordOf } from './knowledge'
import { OFFICE_BY_ID } from './offices'
import { runAutopilot, royalManorIncome } from './inner'
import { tickBureaucracy, courtMoral } from './bureaucracy'
import { TOTAL_TURNS } from '../data/opening'

export function nextDate(d: { year: number; month: number; xun: number }) {
  if (d.xun < 3) return { year: d.year, month: d.month, xun: d.xun + 1 }
  if (d.month < 12) return { year: d.year, month: d.month + 1, xun: 1 }
  return { year: d.year + 1, month: 1, xun: 1 }
}

/** 开局把本子铺到案头 */
export function initQueue(s: WorldState): WorldState {
  const next = structuredClone(s)
  next.queue = generateIncoming(next, 4)
  next.incoming = next.queue.length
  next.reported = computeReported(next)
  return next
}

/** 推一旬 */
export function advanceTurn(s: WorldState): WorldState {
  const next = structuredClone(s)
  if (next.over) return next

  /* 0. 司礼监代批：省你的精力，按他们的意思办 */
  runAutopilot(next)

  /* 1. 事项：真实进度与奏报进度分道扬镳 */
  for (const p of next.projects) tickProject(next, p)

  /* 2. 财政 */
  tickTreasury(next)

  /* 2b. 皇庄进项：内帑自己会生钱，看御马监那个人 */
  next.neitang += royalManorIncome(next)

  /* 3. 九边：饷能发得出，兵就还能站 */
  tickFrontiers(next)

  /* 4. 四夷：态度会淡，威胁会长 */
  tickPowers(next)

  /* 4b. 百官考课：民心、官风、朝局，是在位的人干出来的 */
  tickBureaucracy(next)

  /* 4b2. 律令：制度在暗处用力，当旬看不出，三年五年就看出了 */
  tickStatutes(next)

  /* 4b3. 党争：保举、攻讦、联名，都在声望与朝局上 */
  tickFactions(next)

  /* 4b4. 政令：交出去的差事，这一旬办到哪儿了 */
  tickOrders(next)

  /* 4c. 人言：不用你问，话自己会到耳朵里来 */
  Object.assign(next, spawnRumors(next))

  /* 5. 留中：没批的继续挂着，逾期开始反噬 */
  const expired: Memorial[] = []
  for (const m of next.queue) {
    if (m.resolved) continue
    m.stayMonths += 1
    if (m.stayMonths > m.patience) {
      if (m.ignoredEffect) applyEffect(next, m.ignoredEffect)
      m.resolved = true
      next.shelved += 1
      expired.push(m)
    }
  }
  if (expired.length > 0) {
    next.log.push({
      turn: next.turn,
      text: `${expired.length}件章奏留中逾期，事已不可为。此本永不再批。`,
      tone: 'bad',
    })
  }
  next.queue = next.queue.filter((m) => !m.resolved)

  /* 6. 壅滞 */
  next.backlog = next.queue.filter((m) => m.stayMonths >= 1).length + next.shelved
  tickBacklog(next)

  /* 7. 考成松紧的长期代价：宽则民安而吏弛 */
  next.truth.minxin = clamp(next.truth.minxin + (2 - next.policy.severity) * 0.3, 0, 100)
  next.truth.guanfeng = clamp(next.truth.guanfeng - (3 - next.policy.severity) * 0.18, 0, 100)

  /* 7b. 内廷：势大而忠薄的，早晚要伸手 */
  const top = [...next.inner]
    .filter((o) => o.kind === 'eunuch')
    .sort((a, b) => b.power - a.power)[0]
  if (top && top.power >= 78 && top.loyalty < 56 && !next.flags[`usurp_${top.id}`]) {
    next.flags[`usurp_${top.id}`] = 1
    next.truth.chaoshi = clamp(next.truth.chaoshi - 8, 0, 100)
    next.truth.guanfeng = clamp(next.truth.guanfeng - 3, 0, 100)
    next.log.push({
      turn: next.turn,
      text: `${top.name}势倾内外。凡有章奏先过其手，六科有疏，言「内臣权重，非国家之福」。`,
      tone: 'bad',
    })
  }

  /* 8. 民变苗头 */
  if (next.truth.minxin < 35 && !next.flags.unrest_noted) {
    next.flags.unrest_noted = 1
    next.log.push({
      turn: next.turn,
      text: '各省奏报：有饥民聚于山泽，掠富室。有司捕之，不能尽。',
      tone: 'bad',
    })
  }

  /* 9. 边患：威胁高的势力终会动手 */
  const hot = next.powers.find((p) => p.threat > 78 && !next.flags[`war_${p.id}`])
  if (hot) {
    next.flags[`war_${hot.id}`] = 1
    next.truth.bianfang = clamp(next.truth.bianfang - 6, 0, 100)
    next.log.push({
      turn: next.turn,
      text: `${hot.name}大举入犯。边报一日三至。`,
      tone: 'bad',
    })
  }

  /* 10. 时间 */
  next.turn += 1
  next.date = nextDate(next.date)
  next.energy = next.maxEnergy

  /* 11. 新本进案 */
  const fresh = generateIncoming(next, 3 + (next.turn % 2))
  next.queue.push(...fresh)
  next.incoming = fresh.length
  next.pending = []

  /* 12. 奏报刷新 */
  next.reported = computeReported(next)

  /* 13. 终局 */
  if (next.turn >= TOTAL_TURNS) next.over = true

  return next
}

export interface PersonVerdict {
  name: string
  office: string
  judged: string
  actual: string
  comment: string
}

export interface Verdict {
  title: string
  lines: string[]
  /** 结局时对一下：你当年怎么看这些人，他们实际如何 */
  people: PersonVerdict[]
  score: number
}

export function evaluate(s: WorldState): Verdict {
  const qz = s.projects.find((p) => p.id === 'qingzhang')
  const lines: string[] = []
  let score = 0

  if (qz && qz.status === 'done') {
    lines.push('清丈告竣，天下田土核实。赋役均平之基，自此始。')
    score += 30
  } else if (qz && qz.status === 'failed') {
    lines.push('清丈中止。田连阡陌者，仍匿其半。')
    score -= 15
  } else if (qz && qz.progress >= 55) {
    lines.push('清丈行过大半，虽未告竣，规模已具。')
    score += 15
  } else {
    lines.push('清丈迁延日久，报册虚饰。天下之田，仍是一笔糊涂账。')
    score -= 5
  }
  if (qz && qz.exposed) {
    lines.push('其间虚实，你终究是知道的。知道而不改，与不知同。')
  }

  if (s.taicang >= 300) {
    lines.push('太仓尚有赢余，不至于仰人鼻息。')
    score += 15
  } else if (s.taicang >= 150) {
    lines.push('太仓支绌，然犹可支吾。')
    score += 5
  } else {
    lines.push('太仓将竭。此后凡有大役，皆从内帑出——而内帑也不是无底的。')
    score -= 10
  }

  if (s.policy.severity >= 3) {
    lines.push('考成之法，始终未弛。百官畏法，百姓畏吏。')
    score += 10
  } else if (s.policy.severity <= 1) {
    lines.push('考成之法，渐次宽弛。天下称便，而事功亦废。')
    score -= 5
  } else {
    lines.push('考成宽严得中，是为守成之政。')
    score += 5
  }

  if (s.flags.fengbao_dead) {
    lines.push('冯保既逐，内廷之气稍戢。')
    score += 8
  } else if (s.flags.fengbao_alive) {
    lines.push('冯保仍在。司礼监的朱笔，替你批了一半的天下。')
    score -= 8
  }

  if (s.flags.zhang_ruined) {
    lines.push('张居正籍家之日，天下寒心。此后无人敢为朝廷任怨。')
    score -= 15
  } else if (s.flags.zhang_stripped) {
    lines.push('张居正削爵夺谥而不籍其家。恩怨分明，尚有分寸。')
    score += 5
  }

  const weak = s.frontiers.filter((f) => f.readiness < 45)
  if (weak.length >= 3) {
    lines.push(`九边之中，${weak.map((f) => f.name).join('、')}皆不足恃。`)
    score -= 12
  } else if (weak.length === 0) {
    lines.push('九边各镇，尚称整饬。')
    score += 10
  }

  const hostile = s.powers.filter((p) => p.threat > 60)
  if (hostile.length > 0) {
    lines.push(`四夷之中，${hostile.map((p) => p.name).join('、')}最为可虑。`)
    score -= 5 * hostile.length
  }

  const moral = courtMoral(s)
  if (moral >= 75) {
    lines.push('内阁诸臣，德行尚可称。朝中君子多，小人少。')
    score += 8
  } else if (moral < 50) {
    lines.push('内阁之中，德薄者居高位。君子退，小人进。')
    score -= 8
  }

  if (s.backlog >= 24) {
    lines.push('案头积压之章，始终未清。政务壅滞，自此成习。')
    score -= 10
  }

  const title =
    score >= 55 ? '可谓有为' : score >= 30 ? '守成之主' : score >= 10 ? '庸庸无失' : '自此始怠'

  return { title, lines, score, people: peopleVerdict(s) }
}


/**
 * 结局时对一对：你当年怎么看这些人，他们实际如何。
 *
 * 这是整局唯一一次揭开底牌的地方 —— 你赌对没有，全在这一屏。
 */
function peopleVerdict(s: WorldState): PersonVerdict[] {
  const asked = s.officers.filter((o) =>
    (s.knowledge[o.id] ?? []).some((c) => c.source === 'audience'),
  )
  const ranking = s.officers.filter(
    (o) => o.officeId && (OFFICE_BY_ID.get(o.officeId)?.rank ?? 9) <= 3,
  )
  const seen = new Set<string>()
  const picks: typeof s.officers = []
  for (const o of [...asked, ...ranking]) {
    if (seen.has(o.id)) continue
    seen.add(o.id)
    picks.push(o)
    if (picks.length >= 9) break
  }

  const band = (v: number): 1 | 2 | 3 | 4 | 5 =>
    v >= 85 ? 5 : v >= 70 ? 4 : v >= 55 ? 3 : v >= 40 ? 2 : 1

  return picks.map((o) => {
    const cs = s.knowledge[o.id] ?? []
    const talentClues = cs.filter((c) => c.facet === 'talent')
    const office = o.officeId ? (OFFICE_BY_ID.get(o.officeId)?.name ?? '在籍') : '在籍候选'

    const realBand = band(o.neng)
    const actual = wordOf('talent', realBand)

    if (talentClues.length === 0) {
      return {
        name: o.name,
        office,
        judged: '你没单独问过此人的事。',
        actual,
        comment: '名字在册子上，人却从没进过你的眼睛。史书上，他也是这么一笔带过。',
      }
    }

    const judgeAvg = talentClues.reduce((a, c) => a + c.band, 0) / talentClues.length
    const judgeBand = Math.round(judgeAvg)
    const judged = `${readClue(cs, 'talent')}（${talentClues.length} 条，把握${
      talentClues.length <= 2 ? '中' : '高'
    }）`
    const diff = judgeBand - realBand
    const comment =
      Math.abs(diff) >= 2
        ? diff > 0
          ? '你看高了他不少。他的本事撑不起你给的位置。'
          : '你看低了他不少。这个人在你手里，白待了。'
        : diff === 1
          ? '略高估了。不算看错，只是多给了半分指望。'
          : diff === -1
            ? '略低估了。他没你想的那么不济。'
            : '看得准。'
    return { name: o.name, office, judged, actual, comment }
  })
}
