import type { Order, WorldState } from './types'
import { OFFICE_BY_ID } from './offices'

/**
 * 政令。
 *
 * 批红只是把话说出去。话说出去之后还有四步：
 * 交办 → 有人接 → 有人办 → 有人回话。而回话里的数，未必是真的。
 *
 * 这一层要解决的问题是：以前你批完就完了，现在批完才开始。
 */

const TASK_TEXT: Record<string, string> = {
  routine: '照拟施行',
  urgent: '即行查办',
  project: '督率承办',
  personnel: '会议具奏',
  impeach: '查明回奏',
}

/** 一个衙门里谁去办这件事：长官为第一承办，副贰为协办 */
function executorFor(s: WorldState, senderId?: string) {
  if (senderId) {
    const o = s.officers.find((x) => x.id === senderId)
    if (o && o.officeId) {
      return {
        id: o.id,
        name: o.name,
        office: OFFICE_BY_ID.get(o.officeId)?.name ?? '本衙门',
        competence: o.neng,
        qin: o.qin,
      }
    }
  }
  const fallback = s.officers.find((x) => x.officeId && (OFFICE_BY_ID.get(x.officeId)?.rank ?? 9) <= 3)
  if (!fallback) return null
  return {
    id: fallback.id,
    name: fallback.name,
    office: OFFICE_BY_ID.get(fallback.officeId!)?.name ?? '本衙门',
    competence: fallback.neng,
    qin: fallback.qin,
  }
}

/** 批了之后，把这件差事交出去 */
export function issueOrder(
  s: WorldState,
  params: {
    source: string
    kind: 'routine' | 'urgent' | 'project' | 'personnel' | 'impeach'
    title: string
    senderId?: string
    /** 得罪人的程度，决定阻力与拖延 */
    heat?: number
  },
): WorldState {
  const ex = executorFor(s, params.senderId)
  if (!ex) return s

  const heat = params.heat ?? 0
  const ord: Order = {
    id: `ord-${s.turn}-${s.orders.length}`,
    source: params.title,
    executorId: ex.id,
    executorName: ex.name,
    executorOffice: ex.office,
    task: `${TASK_TEXT[params.kind] ?? '照拟施行'}：${params.title.replace(/^为|事$/g, '')}`,
    turnStart: s.turn,
    // 能干的人办得快；得罪人的事拖得久
    dueTurn: s.turn + Math.max(2, Math.round(3 + heat - ex.competence / 40 + (100 - ex.qin) / 40)),
    progress: 0,
    reported: 0,
    resistance: heat,
    status: 'running',
    answered: false,
    verified: false,
  }

  return {
    ...s,
    orders: [...s.orders, ord],
    log: [
      ...s.log,
      {
        turn: s.turn,
        text: `诏下，交${ex.office}${ex.name}承办。`,
        tone: 'normal' as const,
      },
    ],
  }
}

/**
 * 每旬推进。
 *
 * 真进度 = 干才 + 勤勉 - 阻力。报上来的进度 = 真进度 + 虚饰。
 * 越到后期查得越紧，虚饰也越难维持 —— 但永远维持得住一部分。
 */
export function tickOrders(s: WorldState): void {
  const serving = s.officers.filter((o) => o.officeId)
  const avgLian = serving.length
    ? serving.reduce((a, o) => a + o.lian, 0) / serving.length
    : 55
  // 官风越坏，虚报越多。一分之差，报上来的水分就多一分
  const padding = Math.max(0, (74 - s.truth.guanfeng) / 70 + (60 - avgLian) / 150)

  for (const ord of s.orders) {
    if (ord.status !== 'running') continue
    const o = s.officers.find((x) => x.id === ord.executorId)
    const neng = o ? o.neng : 55
    const qin = o ? o.qin : 55
    const lian = o ? o.lian : 55

    // 朝局坏到一定程度，政令出了京就中格：同样的人、同样的钱，事办不下去
    const court = 0.6 + s.truth.chaoshi / 250
    const gain = Math.max(
      1.2,
      ((neng * 0.55 + qin * 0.35) / 12 - ord.resistance * 0.9) * court,
    )
    ord.progress = Math.min(100, ord.progress + gain)

    const lie = Math.max(0, (100 - lian) / 100) * padding * 100
    ord.reported = Math.min(100, Math.max(ord.progress, ord.reported + gain + lie * 0.08))

    if (s.turn >= ord.dueTurn && !ord.answered) {
      ord.answered = true
      // 报得好看一点：没办完也说办完了
      ord.reported = Math.min(100, Math.max(ord.reported, ord.progress + lie))
      ord.status = ord.progress >= 55 ? 'done' : 'failed'
      s.log.push({
        turn: s.turn,
        text: `${ord.executorOffice}${ord.executorName}回奏：前奉诏旨，已办竣。`,
        tone: 'normal' as const,
      })
    }
  }
}

/**
 * 遣人核实。
 *
 * 花一点精力，换一个真的数 —— 也许换来的还是一个假的数，
 * 因为去核实的人，也要经过同一套官场。
 */
export function verifyOrder(s: WorldState, orderId: string): { s: WorldState; note: string } {
  const next: WorldState = structuredClone(s)
  if (next.energy < 1) return { s, note: '精力不足。' }
  const ord = next.orders.find((x) => x.id === orderId)
  if (!ord || ord.verified) return { s, note: '' }

  next.energy -= 1
  ord.verified = true

  const gap = ord.reported - ord.progress
  const o = next.officers.find((x) => x.id === ord.executorId)

  if (gap <= 8) {
    next.log.push({
      turn: next.turn,
      text: `核实${ord.executorOffice}${ord.executorName}所办，与回奏相符。`,
      tone: 'good',
    })
    return {
      s: next,
      note: `查得实情：所办与回奏相符。${ord.executorName}此人，还算实心办事。`,
    }
  }

  // 虚报被揭出来
  ord.status = 'exposed'
  if (o) {
    o.reputation = Math.max(0, o.reputation - 8)
    o.appraisal = '虚报政绩，已为钦差所核。'
  }
  next.truth.guanfeng = Math.max(0, next.truth.guanfeng - 2)
  next.log.push({
    turn: next.turn,
    text: `核实${ord.executorOffice}${ord.executorName}所办，虚报${Math.round(gap)}分。`,
    tone: 'bad',
  })

  return {
    s: next,
    note:
      `查得实情：报的是${Math.round(ord.reported)}分，实际只办了${Math.round(ord.progress)}分。\n\n` +
      `${ord.executorName}的回奏，是虚的。`,
  }
}

/** 政令一栏要用到的计数 */
export function orderStats(s: WorldState) {
  const running = s.orders.filter((o) => o.status === 'running').length
  const waiting = s.orders.filter((o) => o.answered && !o.verified).length
  const exposed = s.orders.filter((o) => o.status === 'exposed').length
  return { running, waiting, exposed, total: s.orders.length }
}
