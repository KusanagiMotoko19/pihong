import type { Memorial, MemorialTemplate, WorldState } from './types'
import { Rng } from './names'
import { ALL_TEMPLATES, TIMELINE } from '../data/opening'
import { resolveSender } from './sender'
import { backgroundOf } from '../data/backgrounds'

/** 同一模板隔多久才可能再出 */
const DEFAULT_COOLDOWN = 8

let seq = 0

function eligible(t: MemorialTemplate, s: WorldState): boolean {
  if (t.when && !t.when(s)) return false
  if (t.requires && !t.requires.every((f) => (s.flags[f] ?? 0) > 0)) return false
  if (t.forbids && t.forbids.some((f) => (s.flags[f] ?? 0) > 0)) return false
  const last = s.flags[`tpl_${t.id}`] ?? -999
  const cd = t.cooldown ?? DEFAULT_COOLDOWN
  return s.turn - last >= cd
}

export function instantiate(state: WorldState, templateId: string): Memorial | null {
  const tpl = ALL_TEMPLATES[templateId]
  if (!tpl) return null
  if (tpl.when && !tpl.when(state)) return null
  if (tpl.requires && !tpl.requires.every((f) => (state.flags[f] ?? 0) > 0)) return null
  if (tpl.forbids && tpl.forbids.some((f) => (state.flags[f] ?? 0) > 0)) return null

  const built = tpl.build(state)
  seq += 1
  // 每一本都得有个活人署名
  const sender = resolveSender(state, built.from)
  return {
    ...built,
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
  // 最久没动的先动 —— 五条线轮着来，不会有一条被饿死
  const lines = [...byLine.entries()].map(([line, arr]) => ({
    line,
    tpl: arr[0],
    last: state.flags[`tpl_${arr[0].id}`] ?? -999,
  }))
  lines.sort((a, b) => a.last - b.last)
  for (const l of lines.slice(0, 2)) {
    push(l.tpl.id)
  }

  // 三、日常
  const remain = Math.max(0, count - out.length)
  if (remain > 0) {
    const daily = all.filter((t) => !t.line && eligible(t, state) && !used.has(t.id))
    const weights = daily.map((t) => t.weight ?? 1)
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
    Pick<MemorialTemplate, 'when' | 'weight' | 'cooldown' | 'requires' | 'forbids' | 'sets' | 'line'>
  > = {},
): MemorialTemplate {
  return { id, kind, build, ...extra }
}
