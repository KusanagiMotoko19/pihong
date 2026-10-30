import type { WorldState } from './types'
import { K, applyEffect, findOfficer } from './rules'
import { OFFICES, OFFICE_BY_ID, officeName } from './offices'
import { ACTIVITY_BY_ID, intelFromOffice } from './activities'
import { addClue } from './knowledge'
import { TOPICS, ask } from '../data/speech'
import { issueOrder } from './orders'
import type { Topic } from '../data/speech'

export function cloneState(s: WorldState): WorldState {
  return structuredClone(s)
}

/** 细看一本：花一点精力，换来全文和全部选项 */
export function readMemorial(s: WorldState, id: string): WorldState {
  const next = cloneState(s)
  const m = next.queue.find((x) => x.id === id)
  if (!m || m.read || m.resolved) return s
  if (next.energy < K.ENERGY_READ) return s
  next.energy -= K.ENERGY_READ
  m.read = true
  return next
}

/**
 * 批红。
 * key === 'yi' → 按内阁票拟办（执行 yiEffect）
 * 其余 key → 执行对应选项（须已细看，除非该选项标了 needsReading: false）
 */
export function decree(s: WorldState, id: string, key: string): WorldState {
  const next = cloneState(s)
  const m = next.queue.find((x) => x.id === id)
  if (!m || m.resolved) return s

  if (key === 'yi') {
    applyEffect(next, m.yiEffect)
    m.resolved = true
  } else {
    const opt = m.options.find((o) => o.key === key)
    if (!opt) return s
    if (opt.needsReading && !m.read) return s
    applyEffect(next, opt.effect)
    m.resolved = true
  }

  next.queue = next.queue.filter((x) => !x.resolved)
  next.backlog = next.queue.filter((m) => m.stayMonths >= 1).length + next.shelved

  // 批了不是完事。急件与事项要交出去办，办完还要回话
  if (m.kind === 'urgent' || m.kind === 'project') {
    const heat = m.kind === 'urgent' ? 2 : 1
    Object.assign(
      next,
      issueOrder(next, {
        source: m.id,
        kind: m.kind,
        title: m.title,
        senderId: m.senderId,
        heat,
      }),
    )
  }

  return next
}

/** 留中：不批，放着。它会一直挂在案头，直到超过忍耐的月数 */
export function stayMemorial(s: WorldState, id: string): WorldState {
  const next = cloneState(s)
  const m = next.queue.find((x) => x.id === id)
  if (!m) return s
  m.stayMonths = Math.max(m.stayMonths, 1)
  next.backlog = next.queue.filter((x) => x.stayMonths >= 1).length + next.shelved
  return next
}

/** 召对：花三点精力，换一条印象，外加一项真数据 */
export function audience(s: WorldState, officerId: string): WorldState {
  const next = cloneState(s)
  if (next.energy < 2) return s
  const o = findOfficer(next, officerId)
  if (!o) return s
  next.energy -= 2

  // 问话总得问出点东西来：他职掌所及的那一项，你知道真数了
  const intel = intelFromOffice(next, o.officeId)
  if (intel) {
    next.flags[`intel_${intel.key}`] = 1
    next.flags[`intel_${intel.key}_turn`] = next.turn
  }

  next.log.push({
    turn: next.turn,
    text:
      `召对${officeName(o.officeId)}${o.name}。` +
      (intel ? `问及${intel.label}，他说的和奏报上的不一样。` : ''),
    tone: 'normal',
  })
  return next
}

/** 做一件事：花精力，换产出 */
export function doActivity(s: WorldState, activityId: string): WorldState {
  const a = ACTIVITY_BY_ID.get(activityId)
  if (!a || s.energy < a.cost) return s
  const next = cloneState(s)
  next.energy -= a.cost
  const res = a.run(next)
  // 情报类活动，记下这一旬看到的真数
  if (res.effect.flags) {
    for (const k of Object.keys(res.effect.flags)) {
      if (k.startsWith('intel_') && !k.endsWith('_turn')) {
        next.flags[`${k}_turn`] = next.turn
      }
    }
  }
  applyEffect(next, res.effect)
  next.log.push({ turn: next.turn, text: res.text, tone: res.good ? 'normal' : 'bad' })
  return next
}

/** 某项国情，最近有没有看到真数（看见过则返回 true） */
export function hasIntel(s: WorldState, key: string): boolean {
  const t = s.flags[`intel_${key}_turn`]
  return typeof t === 'number' && s.turn - t <= 3
}

/** 事项上的操作：拨款 / 巡视 / 换人 */
export function projectAction(
  s: WorldState,
  id: string,
  action: 'fund' | 'inspect' | 'replace',
  officerId?: string,
): WorldState {
  const next = cloneState(s)
  const p = next.projects.find((x) => x.id === id)
  if (!p || p.status !== 'running') return s

  if (action === 'fund') {
    if (next.taicang < 20) return s
    next.taicang -= 20
    p.budget += 20
    p.progress = Math.min(100, p.progress + 3)
    p.resistance = Math.max(0, p.resistance - 4)
    p.history.push({ turn: next.turn, text: '发银二十万两，续办。' })
    next.log.push({ turn: next.turn, text: `发银二十万两续办${p.name}。`, tone: 'normal' })
  }

  if (action === 'inspect') {
    if (next.energy < 2) return s
    next.energy -= 2
    p.exposed = true
    p.progress = Math.min(100, p.progress + 1)
    // 亲阅册籍，投献的田就藏不住了：看得见的账，才收得回来
    next.flags.touxian = Math.max(0, (next.flags.touxian ?? 0) - 1)
    p.history.push({ turn: next.turn, text: '上亲阅册籍，虚实始见。' })
    next.log.push({
      turn: next.turn,
      text: `亲阅${p.name}册籍。报的是${Math.round(p.reported)}分，实不过${Math.round(p.progress)}分。`,
      tone: 'bad',
    })
  }

  if (action === 'replace' && officerId) {
    const o = next.officers.find((x) => x.id === officerId)
    if (!o) return s
    for (const other of next.officers) {
      if (other.officeId && other.officeId === o.officeId) other.officeId = null
    }
    p.stewardId = officerId
    p.resistance = Math.min(100, p.resistance + 5)
    p.progress = Math.max(0, p.progress - 3)
    p.history.push({ turn: next.turn, text: `改派${o.name}承办。` })
    next.log.push({ turn: next.turn, text: `改派${o.name}承办${p.name}。`, tone: 'normal' })
  }

  return next
}

/** 任免：把某人放到某个位子上，或罢回原籍 */
export function appointOfficer(
  s: WorldState,
  officerId: string,
  officeId: string | null,
): WorldState {
  const next = cloneState(s)
  const o = next.officers.find((x) => x.id === officerId)
  if (!o) return s
  // 守制未满的人不能起用
  if (officeId && (o.leaveUntil ?? 0) > s.turn) return s
  if (officeId) {
    // 一个位子只坐一个人
    for (const other of next.officers) {
      if (other.officeId === officeId && other.id !== o.id) other.officeId = null
    }
  }
  const from = o.officeId
  o.officeId = officeId
  o.tenure = 0
  next.log.push({
    turn: next.turn,
    text: officeId
      ? `命${o.name}为${officeName(officeId)}。${from ? `原任${officeName(from)}。` : ''}`
      : `${o.name}罢职归籍。`,
    tone: 'normal',
  })
  // 人事一动，朝局跟着动：破格用人的，人记着；罢人的，人也记着
  next.truth.chaoshi = Math.max(
    0,
    Math.min(100, next.truth.chaoshi + (officeId ? 1 : -2)),
  )
  return next
}

/** 现在的空缺 */
export function vacantOffices(s: WorldState): string[] {
  const taken = new Set(s.officers.filter((o) => o.officeId).map((o) => o.officeId as string))
  return OFFICES.filter((o) => !taken.has(o.id)).map((o) => o.id)
}

/** 密谕：不经过内阁，直接叫一个人去办一件事 */
export function secretOrder(
  s: WorldState,
  officerId: string,
  kind: 'watch' | 'audit' | 'push',
): WorldState {
  const next = cloneState(s)
  if (next.energy < 2) return s
  const o = next.officers.find((x) => x.id === officerId)
  if (!o) return s
  next.energy -= 2

  const eff = Math.round((o.neng * 0.6 + o.qin * 0.4) / 20)

  if (kind === 'audit') {
    // 查账：查得实，也得罪人
    next.taicang += eff
    next.truth.guanfeng = Math.min(100, next.truth.guanfeng + 2)
    next.truth.chaoshi = Math.max(0, next.truth.chaoshi - 2)
    next.log.push({
      turn: next.turn,
      text: `密谕${o.name}查核钱粮。查得隐占、冒支共${eff}万两。得罪的人不少。`,
      tone: 'normal',
    })
  } else if (kind === 'watch') {
    // 盯人：知道某人的底
    const target = next.officers.find((x) => x.officeId && x.id !== o.id)
    if (target) {
      target.revealed = Math.min(target.impressions.length, target.revealed + 1)
      next.log.push({
        turn: next.turn,
        text: `密谕${o.name}访查${target.name}。回奏的话，和你自己想的不太一样。`,
        tone: 'normal',
      })
    }
  } else {
    // 督办：把一件正事往前推
    const p = next.projects.find((x) => x.status === 'running')
    if (p) {
      p.progress = Math.min(100, p.progress + eff * 0.5)
      p.resistance = Math.max(0, p.resistance - 2)
      next.log.push({
        turn: next.turn,
        text: `密谕${o.name}督办${p.name}。他去了，地方上不敢怠慢。`,
        tone: 'good',
      })
    }
  }
  return next
}
export function setPolicy(
  s: WorldState,
  patch: { quota?: number; severity?: number },
): WorldState {
  const next = cloneState(s)
  applyEffect(next, { policy: patch })
  return next
}

/**
 * 召对里问一个话题。
 * 得到的是「你注意到的」，不是「他的数值」——数值要你自己从话里读。
 */
export function recordTopic(s: WorldState, officerId: string, topic: Topic): WorldState {
  const o = findOfficer(s, officerId)
  if (!o) return s
  const ex = ask(o, topic, s)
  const label = TOPICS.find((t) => t.key === topic)!.label

  const next = addClue(s, officerId, {
    facet: ex.facet,
    band: ex.band,
    text: ex.note,
    source: 'audience',
    turn: s.turn,
  })

  next.log = [
    ...s.log,
    { turn: s.turn, text: `召对${o.name}，${label}。${ex.note}`, tone: 'normal' as const },
  ]
  return next
}

/**
 * 罢一个人的三种办法。
 *
 * 罢职、拿问、抄家 —— 重的不是对这个人，是对他背后那些人。
 * 朝中没有人是孤身一人的，罢他一个，同党十几个都要动。
 */
export type DismissSeverity = 'plain' | 'jail' | 'confiscate'

export function dismissOfficer(
  s: WorldState,
  officerId: string,
  severity: DismissSeverity,
): WorldState {
  const next = cloneState(s)
  const o = next.officers.find((x) => x.id === officerId)
  if (!o) return s

  const faction = o.faction
  const allies = next.officers.filter(
    (x) => x.officeId && x.id !== o.id && x.faction === faction && faction !== '无党',
  )

  // 贪到什么程度，决定这一刀砍下去是除害还是结怨
  const greed = 100 - o.lian // 越贪越高
  const slot = o.officeId ? OFFICE_BY_ID.get(o.officeId) : undefined
  const rank = slot?.rank ?? 5

  // 同党离心：人越贪，同党越不敢认他，离心反而轻
  const chill =
    severity === 'plain'
      ? 2
      : severity === 'jail'
        ? greed >= 70
          ? 4
          : 6
        : greed >= 70
          ? 12 // 大贪官倒台，同党怕被牵连，主动撇清
          : 8

  for (const a of allies) {
    a.reputation = Math.max(0, a.reputation - chill)
  }

  // 朝局：抄一个贪官是除害，抄一个清官是寒心
  if (severity === 'confiscate') {
    if (greed >= 70) {
      next.truth.chaoshi = Math.min(100, next.truth.chaoshi + 4)
      next.truth.guanfeng = Math.min(100, next.truth.guanfeng + 6)
      next.truth.minxin = Math.min(100, next.truth.minxin + 2)
    } else if (greed >= 45) {
      next.truth.chaoshi = Math.max(0, next.truth.chaoshi - 2)
      next.truth.guanfeng = Math.min(100, next.truth.guanfeng + 1)
    } else {
      // 抄了个清官。这事的账要算很久
      next.truth.chaoshi = Math.max(0, next.truth.chaoshi - 10)
      next.truth.guanfeng = Math.max(0, next.truth.guanfeng - 6)
      next.truth.minxin = Math.max(0, next.truth.minxin - 5)
    }
  } else {
    const hit = severity === 'plain' ? 1.5 : 5
    next.truth.chaoshi = Math.max(0, next.truth.chaoshi - hit)
    if (severity === 'jail') next.truth.guanfeng = Math.max(0, next.truth.guanfeng - 1)
  }

  // 抄出来的钱，按他贪到什么程度
  let looted = 0
  if (severity === 'confiscate') {
    const cap = rank <= 2 ? 45 : rank <= 4 ? 20 : 9
    looted = Math.round(2 + (greed / 100) * cap)
    next.taicang += looted
  }

  o.officeId = null
  o.tenure = 0

  next.flags.purge_recent = next.turn
  next.flags.purge_count = (next.flags.purge_count ?? 0) + 1
  next.flags.purge_severity = severity === 'plain' ? 1 : severity === 'jail' ? 2 : 3
  next.flags[`purged_${faction}`] = (next.flags[`purged_${faction}`] ?? 0) + 1

  const act =
    severity === 'plain' ? '罢职归籍' : severity === 'jail' ? '下诏狱' : '下诏狱，籍其家'
  const lootNote = looted > 0 ? `籍得银${looted}万两。` : ''
  const verdict = severity === 'confiscate' && greed < 45 ? '外间议论纷纷。' : ''
  next.log.push({
    turn: next.turn,
    text: `${o.name}${act}。${lootNote}${verdict}${
      allies.length > 0 ? `同党${allies.length}人观望。` : ''
    }`,
    tone: severity === 'plain' ? 'normal' : greed >= 70 && severity === 'confiscate' ? 'good' : 'bad',
  })

  return next
}
