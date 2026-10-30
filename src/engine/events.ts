import type { Effect, Memorial, MemorialTemplate, WorldState } from './types'
import { Rng } from './names'
import { ALL_TEMPLATES, TIMELINE } from '../data/opening'
import { resolveSender } from './sender'
import { backgroundOf } from '../data/backgrounds'

/** 同一模板隔多久才可能再出 */
const DEFAULT_COOLDOWN = 8

let seq = 0

function eligible(t: MemorialTemplate, s: WorldState): boolean {
  if (t.when && !t.when(s)) return false
  if (t.once && (s.flags[`tpl_${t.id}`] ?? -999) > -999) return false
  if (t.requires && !t.requires.every((f) => (s.flags[f] ?? 0) > 0)) return false
  if (t.forbids && t.forbids.some((f) => (s.flags[f] ?? 0) > 0)) return false
  const last = s.flags[`tpl_${t.id}`] ?? -999
  const cd = t.cooldown ?? DEFAULT_COOLDOWN
  return s.turn - last >= cd
}

/**
 * 同一本子反复来，油水一次比一次少。
 *
 * 追解逋欠、抄没家产、折色改征，动的都是存量，不是每年新长出来的钱。
 * 第一次办是「清出一笔」，第三次办就只剩纸面文章了。
 * 所以同一模板第 n 次出现，进项按 0.55^(n-1) 递减，最低压到一成二。
 */
function moneyFade(state: WorldState, templateId: string): number {
  const reps = state.flags[`reps_${templateId}`] ?? 0
  return reps === 0 ? 1 : Math.max(0.12, Math.pow(0.55, reps))
}

/** 只缩「进项」，不动支出：要花的钱不会因为说过一遍就少花 */
function scaleIncome(e: Effect, f: number): Effect {
  if (f === 1) return e
  const fix = (v?: number) => (v !== undefined && v > 0 ? Math.max(1, Math.round(v * f)) : v)
  const out: Effect = { ...e }
  if (e.taicang !== undefined) out.taicang = fix(e.taicang)
  if (e.neitang !== undefined) out.neitang = fix(e.neitang)
  if (e.taipu !== undefined) out.taipu = fix(e.taipu)
  if (e.ledger) {
    out.ledger = {
      taicang: fix(e.ledger.taicang),
      neitang: fix(e.ledger.neitang),
      taipu: fix(e.ledger.taipu),
    }
  }
  return out
}

export function instantiate(state: WorldState, templateId: string): Memorial | null {
  const tpl = ALL_TEMPLATES[templateId]
  if (!tpl) return null
  if (tpl.when && !tpl.when(state)) return null
  if (tpl.once && (state.flags[`tpl_${tpl.id}`] ?? -999) > -999) return null
  if (tpl.requires && !tpl.requires.every((f) => (state.flags[f] ?? 0) > 0)) return null
  if (tpl.forbids && tpl.forbids.some((f) => (state.flags[f] ?? 0) > 0)) return null

  const fade = moneyFade(state, templateId)
  const built = tpl.build(state)
  seq += 1
  // 每一本都得有个活人署名
  const sender = resolveSender(state, built.from)
  // 同一件事反复来：本子里得有个交代，不能每回都像头一次
  const reps = state.flags[`reps_${templateId}`] ?? 0
  const body =
    reps >= 1
      ? `${built.body}\n\n此事臣前后${reps + 1}疏，前${reps}疏未奉明旨，不得已再渎。`
      : built.body
  return {
    ...built,
    body,
    yiEffect: scaleIncome(built.yiEffect, fade),
    options: built.options.map((o) => ({ ...o, effect: scaleIncome(o.effect, fade) })),
    from: sender.text,
    senderId: sender.id,
    background: backgroundOf(tpl.id),
    id: `${templateId}@${state.turn}#${seq}`,
    templateId,
    kind: tpl.kind,
    stayMonths: 0,
    read: false,
    resolved: false,
  }
}

/**
 * 这一旬该进哪些本子。
 *
 * 三层，优先级从高到低：
 *   一、时间线上写死的（开局、必现的节点）
 *   二、叙事线（带 line 的）：每条线一次只推进一个节点，最多两条线同时动
 *   三、日常杂事：按权重抽，用来填空
 *
 * 这样故事能往前走，而不会每旬都是同样的本子换个人名。
 */
export function generateIncoming(state: WorldState, count: number): Memorial[] {
  const out: Memorial[] = []
  const used = new Set<string>()

  const push = (id: string) => {
    const m = instantiate(state, id)
    if (m && !used.has(m.templateId)) {
      out.push(m)
      used.add(m.templateId)
    }
  }

  // 一、剧本
  for (const id of TIMELINE[state.turn] ?? []) push(id)

  // 二、叙事线
  const rng = new Rng(state.seed + state.turn * 7919)
  const all = Object.values(ALL_TEMPLATES)
  const storyPool = all.filter((t) => t.line && eligible(t, state) && !used.has(t.id))

  const byLine = new Map<string, MemorialTemplate[]>()
  for (const t of storyPool) {
    const arr = byLine.get(t.line!) ?? []
    arr.push(t)
    byLine.set(t.line!, arr)
  }

  // 每条线取当前该推的那个节点，按「多久没动过」排序，
  // 最久没动的先动 —— 五条线轮着来，不会有一条被饿死。
  // 但已经推过多遍的线要往后退：一条线说六遍，就不是剧情，是唠叨。
  const lines = [...byLine.entries()].map(([line, arr]) => ({
    line,
    tpl: arr[0],
    last: state.flags[`tpl_${arr[0].id}`] ?? -999,
    reps: state.flags[`reps_${arr[0].id}`] ?? 0,
  }))
  lines.sort((a, b) => a.last + a.reps * 12 - (b.last + b.reps * 12))
  for (const l of lines.slice(0, 2)) {
    push(l.tpl.id)
  }

  // 三、日常
  const remain = Math.max(0, count - out.length)
  if (remain > 0) {
    const daily = all.filter((t) => !t.line && eligible(t, state) && !used.has(t.id))
    // 同一件事出得越多，越不容易再出：天下事不只有这一件。
    // 说满六遍之后压到地板权重 —— 还能再来，但只当补白，不当正事。
    const weights = daily.map((t) => {
      const reps = state.flags[`reps_${t.id}`] ?? 0
      if (reps >= 6) return 0.08
      return (t.weight ?? 1) * Math.pow(0.62, reps)
    })
    for (let i = 0; i < remain && daily.length > 0; i++) {
      const picked = pickWeighted(rng, daily, weights)
      if (!picked) break
      const idx = daily.indexOf(picked)
      daily.splice(idx, 1)
      weights.splice(idx, 1)
      push(picked.id)
    }
  }

  // 记冷却、置 flag
  for (const m of out) {
    state.flags[`tpl_${m.templateId}`] = state.turn
    // 同一本子出过几次：进项递减靠它
    state.flags[`reps_${m.templateId}`] = (state.flags[`reps_${m.templateId}`] ?? 0) + 1
    const tpl = ALL_TEMPLATES[m.templateId]
    for (const f of tpl.sets ?? []) state.flags[f] = 1
  }

  return out
}

function pickWeighted<T>(rng: Rng, items: T[], weights: number[]): T | null {
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return null
  let r = rng.next() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1] ?? null
}

/** 给模板做一层包装，省得每个都写 id */
export function def(
  id: string,
  kind: MemorialTemplate['kind'],
  build: MemorialTemplate['build'],
  extra: Partial<
    Pick<
      MemorialTemplate,
      'when' | 'weight' | 'cooldown' | 'once' | 'requires' | 'forbids' | 'sets' | 'line'
    >
  > = {},
): MemorialTemplate {
  return { id, kind, build, ...extra }
}
