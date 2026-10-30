import { clamp, mean } from './util'
import { Rng } from './names'
import type { Effect, MetricKey, Officer, Project, WorldState } from './types'

/* ------------------------------------------------------------------ *
 * 常数：全部集中在这里，调平衡只改这一处
 * ------------------------------------------------------------------ */

export const K = {
  /** 太仓每旬入（万两）。岁入四百万，一年三十六旬 */
  INCOME: 11.1,
  /** 太仓每旬常支（万两）：百官俸禄、宫廷岁供里归户部的那一份。
   *  九边的年例银不在这个数里 —— 它按各镇年例实算，加镇、加饷，账立刻就变 */
  OUTGO_BASE: 2.6,
  /** 事项每旬需银 */
  PROJECT_COST: 1.7,
  /** 事项基础旬进度 */
  PROJECT_BASE: 1.15,
  /** 官员基准能力，低于此为负 */
  BASE: 70,
  /** 忠言基准操守 */
  BASE_INTEGRITY: 60,
  /** 精力：一旬十点，够看十本、或看六本加召对两次。天下的本子比这多得多 */
  ENERGY_MAX: 10,
  ENERGY_READ: 1,
  ENERGY_AUDIENCE: 3,
  /** 内廷每旬的用度（万两）：赏赐、香火、太监的月米。这笔钱从内帑出 */
  INNER_COST: 1.7,
  /** 壅滞三档 */
  BACKLOG_WARN: 12,
  BACKLOG_BAD: 24,
  BACKLOG_CRIT: 36,
} as const

/* ------------------------------------------------------------------ *
 * 失真：本作最重要的一段代码
 *
 * 所有数字都向好的一面偏，因为报喜的人得功、报忧的人担责。
 * 偏差大小由两件事决定：考成的严苛度、百官的操守。
 * 这两件事都在玩家手里 —— 这是本作给出的唯一解药。
 * ------------------------------------------------------------------ */

export function distortion(state: WorldState): number {
  // 只在任的官说了算。在籍候补的，说不上话
  const serving = state.officers.filter((o) => o.officeId !== null)
  const avgIntegrity = mean(serving.map((o) => o.lian))
  const severityTerm = state.policy.severity * 3
  const integrityTerm = (K.BASE_INTEGRITY - avgIntegrity) * 0.4
  return severityTerm + integrityTerm
}

export function computeReported(state: WorldState): Record<MetricKey, number> {
  const d = distortion(state)
  // 四个衙门的口径不是一样虚：地方报灾情虚、边镇报兵额虚得最多、吏部考语最不虚。
  // 每旬再飘一点 —— 差值是活的，玩家算不出一个固定的数，只能猜。
  const rng = new Rng(state.seed + state.turn * 131)
  const drift = () => rng.next() * 1.8
  return {
    minxin: clamp(state.truth.minxin + d * 1.15 + drift(), 0, 100),
    bianfang: clamp(state.truth.bianfang + d * 0.85 + drift(), 0, 100),
    guanfeng: clamp(state.truth.guanfeng + d * 0.55 + drift(), 0, 100),
    chaoshi: clamp(state.truth.chaoshi + d * 0.75 + drift(), 0, 100),
  }
}

/** 一句话说明当前信息质量，不用数字 */
export function infoQuality(state: WorldState): { label: string; detail: string } {
  const d = distortion(state)
  if (d <= 2)
    return {
      label: '耳目尚清',
      detail: '所报与实情相去不远。这是考成不苛、百官尚知自爱的时候。',
    }
  if (d <= 8)
    return {
      label: '报喜者多',
      detail: '奏报比实情好看些。这是常态——历代皆然。',
    }
  if (d <= 15)
    return {
      label: '文饰渐盛',
      detail: '底下人开始拣好听的说。你看到的数字，要打个折扣。',
    }
  return {
    label: '粉饰成风',
    detail: '奏报已不足信。除非亲问、亲查，否则你等于在雾里看火。',
  }
}

/* ------------------------------------------------------------------ *
 * 效果落地
 * ------------------------------------------------------------------ */

export function applyEffect(state: WorldState, e: Effect): void {
  if (e.taicang) state.taicang += e.taicang
  if (e.neitang) state.neitang += e.neitang
  if (e.taipu) state.taipu += e.taipu
  if (e.energy) state.energy = Math.max(0, state.energy + e.energy)

  if (e.metrics || e.metric) {
    const src = { ...(e.metrics ?? {}), ...(e.metric ?? {}) }
    for (const [k, v] of Object.entries(src)) {
      const key = k as MetricKey
      state.truth[key] = clamp(state.truth[key] + (v ?? 0), 0, 100)
    }
  }

  if (e.ledger) {
    if (e.ledger.taicang) state.taicang += e.ledger.taicang
    if (e.ledger.neitang) state.neitang += e.ledger.neitang
    if (e.ledger.taipu) state.taipu += e.ledger.taipu
  }

  if (e.statutes) {
    state.statutes = { ...state.statutes, ...e.statutes }
  }

  if (e.backlog) {
    state.backlog = Math.max(0, state.backlog + e.backlog)
  }

  if (e.project) {
    const p = state.projects.find((x) => x.id === e.project!.id)
    if (p) {
      if (e.project.progress !== undefined) p.progress = clamp(p.progress + e.project.progress, 0, 100)
      if (e.project.reported !== undefined) p.reported = clamp(p.reported + e.project.reported, 0, 100)
      if (e.project.budget !== undefined) p.budget += e.project.budget
      if (e.project.resistance !== undefined)
        p.resistance = clamp(p.resistance + e.project.resistance, 0, 100)
      if (e.project.expose) p.exposed = true
      if (e.project.status) p.status = e.project.status
    }
  }

  if (e.flags) {
    for (const [k, v] of Object.entries(e.flags)) {
      if (v === undefined) continue
      state.flags[k] = (state.flags[k] ?? 0) + v
    }
  }

  if (e.spawn) state.pending.push(...e.spawn)

  if (e.policy) {
    const oldSeverity = state.policy.severity
    Object.assign(state.policy, e.policy)
    // 考成松紧一动，百官立刻有反应；没动就别惊动他们
    if (e.policy.severity !== undefined && oldSeverity !== state.policy.severity) {
      const relaxed = oldSeverity - state.policy.severity // 正数＝放松
      state.truth.guanfeng = clamp(state.truth.guanfeng - relaxed * 2, 0, 100)
      state.truth.minxin = clamp(state.truth.minxin + relaxed * 1.5, 0, 100)
      state.truth.chaoshi = clamp(state.truth.chaoshi + (relaxed > 0 ? 2 : -2), 0, 100)
    }
  }

  if (e.reveal) {
    const o = findOfficer(state, e.reveal)
    if (o) o.revealed = Math.min(o.impressions.length, o.revealed + 1)
  }

  if (e.power) {
    const p = state.powers.find((x) => x.id === e.power!.id)
    if (p) {
      if (e.power.attitude !== undefined) p.attitude = clamp(p.attitude + e.power.attitude, -100, 100)
      if (e.power.strength !== undefined) p.strength = clamp(p.strength + e.power.strength, 0, 100)
      if (e.power.threat !== undefined) p.threat = clamp(p.threat + e.power.threat, 0, 100)
      if (e.power.status !== undefined) p.status = e.power.status
      p.contacts += 1
    }
  }

  if (e.frontier) {
    const f = state.frontiers.find((x) => x.id === e.frontier!.id)
    if (f) {
      if (e.frontier.readiness !== undefined)
        f.readiness = clamp(f.readiness + e.frontier.readiness, 0, 100)
      if (e.frontier.actual !== undefined) f.actual = Math.max(0, f.actual + e.frontier.actual)
      if (e.frontier.troops !== undefined) f.troops = Math.max(0, f.troops + e.frontier.troops)
      if (e.frontier.audited !== undefined) f.audited = e.frontier.audited
    }
  }

  if (e.appoint) {
    const o = findOfficer(state, e.appoint.officerId)
    if (o) {
      // 守制的人不能起用 —— 丁忧不是罢官，是礼制，期满自然回来
      const inLeave = (o.leaveUntil ?? 0) > state.turn
      if (!(inLeave && e.appoint.officeId)) {
        // 一个位子只坐一个人：先把原来的挪走
        if (e.appoint.officeId) {
          for (const other of state.officers) {
            if (other.officeId === e.appoint.officeId && other.id !== o.id) other.officeId = null
          }
        }
        o.officeId = e.appoint.officeId
        o.tenure = 0
      }
    }
  }

  if (e.leave) {
    const o = findOfficer(state, e.leave.officerId)
    if (o) {
      o.leaveUntil = state.turn + e.leave.xun
      o.officeId = null
      o.tenure = 0
    }
  }

  if (e.log) {
    state.log.push({ turn: state.turn, text: e.log, tone: 'normal' })
  }
}

/* ------------------------------------------------------------------ *
 * 清丈的账：清出来的田要能看见，也要能变成钱
 * ------------------------------------------------------------------ */

/**
 * 清丈的折算率：告竣算全额，未告竣按进度折半。
 * 一处定义，结算（tickTreasury）与说明（项目页）共用 —— 免得说法与实算对不上。
 */
export function clearanceRate(p?: Project): number {
  if (!p) return 0
  return p.status === 'done' ? 1 : (p.progress / 100) * 0.5
}

/**
 * 清丈已清出的隐占田（万顷）与折成的岁入（万两/年）。
 * 史实：万历清丈新增田约 82.8 万顷。这里按进度折算。
 */
export function clearanceGain(p?: Project): { qing: number; silver: number } {
  if (!p) return { qing: 0, silver: 0 }
  const qing = Math.round(((82.8 * p.progress) / 100) * 10) / 10
  return { qing, silver: Math.round(clearanceRate(p) * 48) }
}

/* ------------------------------------------------------------------ *
 * 月度演算
 * ------------------------------------------------------------------ */

/** 事项：真实进度与奏报进度分道扬镳 */
export function tickProject(state: WorldState, p: Project): void {
  if (p.status !== 'running') return

  const steward = state.officers.find((o) => o.id === p.stewardId)
  if (!steward) {
    p.status = 'failed'
    return
  }

  // 能决定做得好不好，勤决定做得快不快，廉决定钱有没有花在正处
  const neng = steward.neng / K.BASE
  const qin = 0.6 + 0.4 * (steward.qin / K.BASE)
  const lian = 0.55 + 0.45 * (steward.lian / K.BASE)

  const ji = 0.75 + 0.25 * (steward.ji / K.BASE)
  let delta = K.PROJECT_BASE * neng * qin * lian * ji

  // 钱跟不上，事就停半拍
  const funded = p.budget - p.spent >= K.PROJECT_COST
  if (!funded) delta *= 0.3
  else p.spent += K.PROJECT_COST

  // 阻力：既得利益者的反扑
  delta *= 1 - p.resistance / 140

  // 考成松了，官就不那么肯干了
  delta *= 0.85 + state.policy.severity * 0.05

  // 皇帝插手越多，事越慢。这是本作最反直觉、也最真实的一条
  const meddle = state.flags[`meddle_${p.id}`] ?? 0
  delta *= 1 - Math.min(0.45, meddle * 0.09)

  // 投献：清丈丈出来的田，又被献回王府 —— 丈得越多，投献越凶。
  // 投献过六成，清丈就被拖着走：白天丈完，晚上立契。
  if (p.id === 'qingzhang' && (state.flags.touxian ?? 0) >= 6) {
    delta -= Math.min(0.8, ((state.flags.touxian ?? 0) - 5) * 0.25)
  }

  p.months += 1
  p.progress = clamp(p.progress + delta, 0, 100)

  // 关键节点：真实进度到了，事就往前走一步
  for (const m of p.milestones) {
    if (!m.hit && p.progress >= m.at) {
      m.hit = true
      p.history.push({ turn: state.turn, text: m.text })
      state.log.push({ turn: state.turn, text: `${p.name}：${m.text}`, tone: 'good' })
      if (m.at >= 80) p.stage = 'close'
      else if (m.at >= 30) p.stage = 'promote'
    }
  }

  // 奏报：操守差 + 考成严 = 虚报
  const inflate =
    ((K.BASE - steward.lian) / 100) * 2.6 + state.policy.severity * 0.6 + 0.4
  p.reported = clamp(p.reported + delta + inflate, 0, 100)

  if (p.progress >= 100 && p.reported >= 100) {
    p.status = 'done'
    state.log.push({
      turn: state.turn,
      text: `${p.name}告竣。承办${steward.name}上疏报功，请叙。`,
      tone: 'good',
    })
  }
}

/** 财政：税银按月解到，支出按旬支放 */
export function tickTreasury(state: WorldState): void {
  // 达标线越高，州县催得越紧，太仓进项越多 —— 代价记在民心账上
  // 户部尚书的本事，决定这笔钱能不能收进库：能员加一成，庸才减三分
  const hubu = officeHolder(state, 'hubu-shangshu')
  const skill = hubu ? (hubu.neng * 0.6 + hubu.ji * 0.4 - 60) / 300 : -0.05
  // 清丈清出来的田，是要上账的：田多了，税基就大了。
  // 未告竣之前，已丈的那部分也算一点（按进度折半），告竣之后全额。
  const qz = state.projects.find((p) => p.id === 'qingzhang')
  const cleared = clearanceRate(qz)
  // 投献：把田挂到王府、勋贵名下，赋役就没了。投献一成，税基就少两分。
  // 这是清丈的对头 —— 你丈出来，他献回去。
  const invest = Math.min(0.3, Math.max(0, state.flags.touxian ?? 0) * 0.02)
  const mul =
    (0.9 + ((state.policy.quota - 70) / 30) * 0.18) *
    (1 + skill) *
    (1 + cleared * 0.12) *
    (1 - invest)
  // 每月的上旬解到上月税银，中下旬只出不进
  const income = state.date.xun === 1 ? K.INCOME * 3 * mul : 0
  // 九边年例按各镇实数摊到每旬：加一镇、加一饷，太仓立刻见紧
  const annualPay = state.frontiers.reduce((a, f) => a + f.pay, 0)
  const outgo = K.OUTGO_BASE + annualPay / 36
  state.taicang += income - outgo

  // 欠饷有底：太仓可以透支到负数，但透到「欠饷十五个月」就是极限
  state.taicang = Math.max(state.taicang, -150)

  // 太仆寺马价银：马政一年也要花几十万。不动它，它自己也会慢慢下去
  state.taipu = Math.max(0, state.taipu - 0.15)

  // 太仓见底，百官俸禄发不出，官风垮
  if (state.taicang < 40) {
    state.truth.guanfeng = clamp(state.truth.guanfeng - 2, 0, 100)
    state.truth.chaoshi = clamp(state.truth.chaoshi - 1, 0, 100)
  }
  if (state.taicang < 0) {
    state.truth.minxin = clamp(state.truth.minxin - 2, 0, 100)
  }
}

/** 壅滞：留中的奏疏堆起来，帝国血管开始堵 */
export function tickBacklog(state: WorldState): void {
  if (state.backlog >= K.BACKLOG_CRIT) {
    state.truth.chaoshi = clamp(state.truth.chaoshi - 2, 0, 100)
    state.truth.guanfeng = clamp(state.truth.guanfeng - 1, 0, 100)
  } else if (state.backlog >= K.BACKLOG_BAD) {
    state.truth.chaoshi = clamp(state.truth.chaoshi - 1, 0, 100)
    state.truth.minxin = clamp(state.truth.minxin - 1, 0, 100)
  } else if (state.backlog >= K.BACKLOG_WARN) {
    state.truth.guanfeng = clamp(state.truth.guanfeng - 1, 0, 100)
  }
}

/** 五维的中文读法（官署文书里用，界面上不摊数字） */
export const DIM_LABEL: Record<string, string> = {
  de: '德',
  neng: '能',
  qin: '勤',
  ji: '绩',
  lian: '廉',
}


export function findOfficer(state: WorldState, id: string): Officer | undefined {
  return state.officers.find((o) => o.id === id)
}

/** 某个位子上的人 */
export function officeHolder(s: WorldState, officeId: string): Officer | undefined {
  return s.officers.find((o) => o.officeId === officeId)
}

/** 在任官员（人才库里的人不算） */
export function serving(state: WorldState): Officer[] {
  return state.officers.filter((o) => o.officeId !== null)
}

/* ------------------------------------------------------------------ *
 * 九边：额兵与实额之间那一截，是各级将官的饭碗
 * ------------------------------------------------------------------ */

const FRONTIER_CMD: Record<string, string> = {
  liaodong: 'zz-liaodong',
  jizhou: 'zz-jizhou',
  xuanfu: 'zz-xuanfu',
  datong: 'zz-datong',
  shanxi: 'zz-shanxi',
  yansui: 'zz-yansui',
  ningxia: 'zz-ningxia',
  guyuan: 'zz-guyuan',
  gansu: 'zz-gansu',
}

export function tickFrontiers(state: WorldState): void {
  const annualPay = state.frontiers.reduce((a, f) => a + f.pay, 0)
  const perXun = annualPay / 36
  // 太仓能支得起三个月的饷，边军就不闹
  const funded = state.taicang > perXun * 3

  for (const f of state.frontiers) {
    // 饷足则操练，饷缺则逃亡。**不养就慢慢烂**——这是九边的常态
    const drift = funded ? 0.1 : -1.5
    const fillRate = f.actual / Math.max(0.1, f.troops)
    // 这一镇的将，顶不知道顶用：戚继光在蓟州，兵就整；换个庸才，兵就散
    const cmd = officeHolder(state, FRONTIER_CMD[f.id] ?? '')
    const cmdBonus = cmd ? (cmd.neng * 0.5 + cmd.qin * 0.3 + cmd.ji * 0.2 - 60) / 120 : -0.35
    f.readiness = clamp(f.readiness + drift + cmdBonus + (fillRate - 0.8) * 4, 0, 100)

    // 吃空饷：实额一点点漏掉。看不见，直到有人去查。
    // 将官越贪漏得越快 —— 兵册上的数目，本来就是各级将官的饭碗
    const leak = 0.002 + ((100 - (cmd?.lian ?? 45)) / 100) * 0.008
    f.actual = Math.max(f.troops * 0.5, f.actual - leak)
  }

  if (!funded) {
    state.truth.bianfang = clamp(state.truth.bianfang - 0.8, 0, 100)
  }
}

/**
 * 四夷。它们不看你说了什么，只看你有多强、给不给钱。
 * 注意建州那一条：它会自己长大，不管你在做什么。
 */
export function tickPowers(state: WorldState): void {
  for (const p of state.powers) {
    // 态度向中性缓慢回归 —— 恩怨都会淡
    p.attitude += (0 - p.attitude) * 0.015

    if (p.id === 'jianzhou') {
      p.strength = clamp(p.strength + 0.55, 0, 100)
      p.threat = clamp(p.threat + 0.42, 0, 100)
    }
    if (p.id === 'japan') {
      p.strength = clamp(p.strength + 0.3, 0, 100)
    }

    const hostility = Math.max(0, -p.attitude) / 100
    const target = p.strength * 0.55 + hostility * 55
    p.threat = clamp(p.threat * 0.85 + target * 0.15, 0, 100)
  }
}
