import type { Memorial, WorldState } from './types'
import { clamp } from './util'
import {
  K,
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
  next.queue = generateIncoming(next, 10)
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

  /* 2b. 皇庄进项：内帑自己会生钱，看御马监那个人；用度也在这一笔里出 */
  next.neitang = Math.max(0, next.neitang + royalManorIncome(next) - K.INNER_COST)

  /* 3. 九边：饷能发得出，兵就还能站 */
  tickFrontiers(next)

  /* 4. 四夷：态度会淡，威胁会长 */
  tickPowers(next)

  /* 4b. 百官考课：民心、官风、朝局，是在位的人干出来的 */
  tickBureaucracy(next)

  /* 4b1. 四维见底的时候，国家会自己坏下去 —— 这是「崩坏迹象」 */
  tickCrisis(next)

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

  /* 11. 新本进案。
     一旬进十到十二本，而你的精力只有十点 —— 读六本、召对两次，剩下的只能依拟或留中。
     这就是皇帝的真实处境：不是没本子看，是看不完。 */
  const fresh = generateIncoming(next, 10 + (next.turn % 3))
  next.queue.push(...fresh)
  next.incoming = fresh.length
  next.pending = []

  /* 12. 奏报刷新 */
  next.reported = computeReported(next)

  /* 13. 终局 */
  if (next.turn >= TOTAL_TURNS) next.over = true

  return next
}

/**
 * 四维见底。
 *
 * 数值低到一定程度，不是「数字不好看」，是国家真的开始坏：
 * 政令出不了京、盗贼破县城、库银失窃、边镇失守。
 * 这些不是随机事件 —— 是玩家的账到期了。
 */
function tickCrisis(s: WorldState): void {
  const t = s.truth

  // 朝局：政令出不了京
  if (t.chaoshi < 20) {
    s.taicang -= 1.5
    s.backlog = Math.max(0, s.backlog + 0.4)
    if (!s.flags.crisis_chaoshi) {
      s.flags.crisis_chaoshi = 1
      s.log.push({
        turn: s.turn,
        text: '廷议三日不决，政令中格。六部各持一说，无人肯署名。外省的文书到了通政司，压着不发。',
        tone: 'bad',
      })
    }
  }

  // 民心：民变
  if (t.minxin < 20) {
    s.taicang -= 2
    t.guanfeng = clamp(t.guanfeng - 0.2, 0, 100)
    if (!s.flags.crisis_minxin) {
      s.flags.crisis_minxin = 1
      s.log.push({
        turn: s.turn,
        text: '陕西、河南盗起，聚众数千，破县城二。有司请兵，兵部无饷可发；请赈，户部无粮可拨。',
        tone: 'bad',
      })
    }
  }

  // 官风：贪墨公行
  if (t.guanfeng < 20) {
    s.taicang -= 1.5
    if (!s.flags.crisis_guanfeng) {
      s.flags.crisis_guanfeng = 1
      s.log.push({
        turn: s.turn,
        text: '户部库银失窃三万，守库吏与主事皆逃。查了三个月，查不下去 —— 查的人也在分这笔钱。',
        tone: 'bad',
      })
    }
  }

  // 边防：边镇失守
  if (t.bianfang < 20) {
    t.minxin = clamp(t.minxin - 0.5, 0, 100)
    s.taicang -= 1
    if (!s.flags.crisis_bianfang) {
      s.flags.crisis_bianfang = 1
      s.log.push({
        turn: s.turn,
        text: '边报：一镇失守，守将战死。虏骑入边二百里，掠人畜数万，三日不退。',
        tone: 'bad',
      })
    }
  }

  // 三面见底：亡国之象
  const broken = [t.minxin, t.guanfeng, t.chaoshi, t.bianfang].filter((v) => v < 20).length
  if (broken >= 3 && !s.flags.crisis_total) {
    s.flags.crisis_total = 1
    s.log.push({
      turn: s.turn,
      text: '四维之中，三面见底。京师米价一日三涨，宫门外有人卖儿。内帑尚有银，而天下已无人肯为你办事。',
      tone: 'bad',
    })
  }
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

  /* 民心 —— 本纪里最常提起的一句，也是奏报里最不可信的一项 */
  if (s.truth.minxin < 30) {
    lines.push('各省饥民聚于山泽，掠富室，有司捕之不能尽。而赋役如故。')
    score -= 18
  } else if (s.truth.minxin < 45) {
    lines.push('民力已疲。州县催科如故，而仓廪日虚。')
    score -= 9
  } else if (s.truth.minxin >= 68) {
    lines.push('民间稍安，荒田有人开垦。')
    score += 8
  }

  /* 官风 */
  if (s.truth.guanfeng < 40) {
    lines.push('吏治大坏，贪声载路。考语不足信，而考成亦不足恃。')
    score -= 12
  } else if (s.truth.guanfeng >= 72) {
    lines.push('百官尚知自爱。考语虽不尽实，大体可据。')
    score += 6
  }

  /* 朝局 */
  if (s.truth.chaoshi < 35) {
    lines.push('朝局倾轧，各持门户。政令出而中格，阁部相攻者数年。')
    score -= 14
  } else if (s.truth.chaoshi >= 70) {
    lines.push('朝局粗安，阁部相安无事。')
    score += 6
  }

  /* 留中：章奏压在案上，事就没了下文 */
  if (s.backlog >= 120) {
    lines.push(`案上未批之章，前后逾百件。天下事，从此委之他人。`)
    score -= 30
  } else if (s.backlog >= 60) {
    lines.push(`留中不报者${Math.round(s.backlog)}件。政事壅滞，自此成习。`)
    score -= 18
  } else if (s.backlog >= 24) {
    lines.push('案头积压之章，始终未清。政务壅滞，自此成习。')
    score -= 10
  }

  /* 三事俱修：民安、吏谨、朝局可观 —— 这三样凑齐的时候，史书才肯写一句好话 */
  const trim = [s.truth.minxin, s.truth.guanfeng, s.truth.chaoshi].filter((v) => v >= 78).length
  if (trim === 3) {
    lines.push('民安于野，吏谨于位，朝无大狱。数年之间，号为小康。')
    score += 8
  }

  /* 三面见底：不是守成，是坐在将倾的屋子里 */
  const doomed = [s.truth.minxin, s.truth.guanfeng, s.truth.chaoshi, s.truth.bianfang].filter(
    (v) => v < 20,
  ).length
  if (doomed >= 3) {
    lines.push(
      '四维之中，三面见底。内帑尚有银，而天下无人肯为你办事 ——' +
        '这不是亡于兵，是亡于无人可用。',
    )
    score -= 25
  }

  /* 投献：册上的田，一亩一亩地躲进王府的优免册 */
  const toux = Math.max(0, s.flags.touxian ?? 0)
  if (toux >= 8) {
    lines.push('投献之田已及数成：册上之田多为藩府、勋贵所据，赋役之基已空。')
    score -= 10
  } else if (toux >= 4) {
    lines.push('投献渐多，册籍与实田已对不上。')
    score -= 4
  }

  const title =
    score >= 70
      ? '可谓中兴'
      : score >= 45
        ? '可谓有为'
        : score >= 20
          ? '守成之主'
          : score >= 0
            ? '庸庸无失'
            : '自此始怠'
  // 章奏留中逾百件而国不亡者，史书另有一句评语
  const finalTitle =
    doomed >= 3 ? '国将不国' : s.backlog >= 120 ? '委政于人' : title

  return { title: finalTitle, lines, score, people: peopleVerdict(s) }
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
