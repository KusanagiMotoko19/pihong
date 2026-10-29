import type { Clue, Officer, WorldState } from './types'
import { Rng } from './names'
import { addClue } from './knowledge'

/**
 * 人言。
 *
 * 你不用问，话自己会到耳朵里来 —— 只是每句话都有说话人的位置：
 * 同党夸他，是护；异党骂他，是攻；太监传话，是买卖。
 *
 * 所以人言不可尽信，也不可不信。
 */

const PRAISE = [
  '{n}老成练达，可当大任。',
  '{n}办事极细，从不误事。',
  '{n}在任几年，地方上都说好。',
  '{n}为人端正，士林推重。',
  '{n}的条陈我见过，说得在理。',
]

const BLAME = [
  '{n}好为大言，其实不济。',
  '{n}近来闭门不出，不知在做什么。',
  '{n}办事太急，属下怨声不少。',
  '{n}家里近来光景颇好，不知何故。',
  '{n}与那边的人往来太密了。',
]

const NEUTRAL = [
  '{n}近来告了病，说是咳嗽。',
  '{n}的折子递上去三次，都压着。',
  '{n}昨日在朝房与人争了几句。',
]

const band = (v: number): 1 | 2 | 3 | 4 | 5 =>
  v >= 85 ? 5 : v >= 70 ? 4 : v >= 55 ? 3 : v >= 40 ? 2 : 1

function clampBand(b: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, b)) as 1 | 2 | 3 | 4 | 5
}

/** 造一条人言 */
function makeRumor(rng: Rng, s: WorldState, target: Officer): Clue | null {
  const pool = s.officers.filter((o) => o.officeId && o.id !== target.id)
  if (pool.length === 0) return null
  const speaker = rng.pick(pool)

  const sameParty =
    speaker.faction === target.faction && target.faction !== '无党' && target.faction !== '新进'

  // 同党多说好话，异党多说坏话，剩下两成说不痛不痒的
  const tone: 'praise' | 'blame' | 'neutral' = rng.chance(0.2)
    ? 'neutral'
    : sameParty
      ? rng.chance(0.8)
        ? 'praise'
        : 'blame'
      : rng.chance(0.35)
        ? 'praise'
        : 'blame'

  const facetPick = rng.chance(0.6) ? 'talent' : 'integrity'
  const real = facetPick === 'talent' ? band(target.neng) : band(target.lian)

  let spoken: 1 | 2 | 3 | 4 | 5
  let fake = false
  if (tone === 'neutral') {
    spoken = real
  } else if (tone === 'praise') {
    // 夸的人往上抬一分；十次里有两次抬得离谱
    spoken = clampBand(rng.chance(0.2) ? real + 2 : real + 1)
    fake = spoken !== real
  } else {
    spoken = clampBand(rng.chance(0.2) ? real - 2 : real - 1)
    fake = spoken !== real
  }
  // 少数时候说的是实话
  if (tone !== 'neutral' && rng.chance(0.15)) {
    spoken = real
    fake = false
  }

  const bank = tone === 'praise' ? PRAISE : tone === 'blame' ? BLAME : NEUTRAL
  const text = rng.pick(bank).replace('{n}', target.name)

  return {
    facet: facetPick,
    band: spoken,
    text,
    source: 'rumor',
    from: `${speaker.name}${speaker.officeId ? '' : ''}`,
    turn: s.turn,
    false: fake || undefined,
  }
}

/**
 * 一旬过去，风里总有些话。
 * 只挑在任的官，一次最多两条 —— 说太多就不像人言，像报表。
 */
export function spawnRumors(s: WorldState): WorldState {
  const rng = new Rng(s.turn * 7919 + s.officers.length * 31 + 17)
  const serving = s.officers.filter((o) => o.officeId)
  if (serving.length === 0) return s

  const count = rng.chance(0.55) ? 2 : 1
  let next = s
  for (let i = 0; i < count; i++) {
    const target = rng.pick(serving)
    const clue = makeRumor(rng, next, target)
    if (!clue) continue
    next = addClue(next, target.id, clue)
  }
  return next
}
