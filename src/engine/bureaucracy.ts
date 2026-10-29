import type { Officer, WorldState } from './types'
import { OFFICE_BY_ID } from './offices'
import { mean } from './util'
import { Rng } from './names'
import { clamp } from './util'

export type Dim = 'de' | 'neng' | 'qin' | 'ji' | 'lian'

/**
 * 百官考课。
 *
 * 一句话：国家的走向不是凭空漂移的，是在这几个位子上的人干出来的。
 * 换上德才兼备的人，民心会慢慢上来；换上一批贪滑的，民心会慢慢下去。
 * 你换人的那一下看不出动静，半年之后就是一条曲线。
 */

/** 某个衙门在任者的平均五维。没人的衙门按 45 算 */
export function deptScore(s: WorldState, dept: string, dims: Dim[]): number {
  const list = s.officers.filter((o) => {
    if (!o.officeId) return false
    return OFFICE_BY_ID.get(o.officeId)?.dept === dept
  })
  if (list.length === 0) return 45
  return mean(list.map((o) => mean(dims.map((d) => o[d]))))
}

/** 地方官：督抚 + 布政使，看德与绩 */
export function localScore(s: WorldState): number {
  const list = s.officers.filter((o) => {
    if (!o.officeId) return false
    const slot = OFFICE_BY_ID.get(o.officeId)
    if (!slot) return false
    return slot.name.includes('巡抚') || slot.name.includes('布政使')
  })
  if (list.length === 0) return 45
  return mean(list.map((o) => (o.de * 0.45 + o.ji * 0.35 + o.lian * 0.2)))
}

/** 在内阁、六部堂官里，德行最差的那个（用来判断会不会结党） */
export function worstMoralist(s: WorldState): Officer | undefined {
  return s.officers
    .filter((o) => {
      if (!o.officeId) return false
      const slot = OFFICE_BY_ID.get(o.officeId)
      return slot && slot.rank <= 3 && slot.kind === 'civil'
    })
    .sort((a, b) => a.de - b.de)[0]
}

/**
 * 每旬的百官考课结算。
 *
 * 德 → 结党与弹劾；能 + 绩 → 衙门产出；勤 → 会不会压公文；廉 → 奏报真假（在别处算）
 */
export function tickBureaucracy(s: WorldState): void {
  const rng = new Rng(s.seed + s.turn * 31337)

  /* 一、民心：地方官德绩加起来的样子 */
  const local = localScore(s)
  s.truth.minxin = clamp(s.truth.minxin + (local - 55) / 55, 0, 100)

  /* 二、官风：都察院自己的操守 */
  const censor = deptScore(s, '都察院', ['de', 'lian'])
  s.truth.guanfeng = clamp(s.truth.guanfeng + (censor - 55) / 65, 0, 100)

  /* 三、朝局：内阁的德与能 */
  const cabinet = deptScore(s, '内阁', ['de', 'neng'])
  s.truth.chaoshi = clamp(s.truth.chaoshi + (cabinet - 55) / 90, 0, 100)

  /* 四、德薄的堂官，迟早结党 */
  const bad = worstMoralist(s)
  if (bad && bad.de < 46 && !s.flags[`clique_${bad.id}`] && rng.chance(0.035)) {
    s.flags[`clique_${bad.id}`] = 1
    s.truth.chaoshi = clamp(s.truth.chaoshi - 5, 0, 100)
    s.truth.guanfeng = clamp(s.truth.guanfeng - 3, 0, 100)
    s.log.push({
      turn: s.turn,
      text: `科道风闻：${bad.name}与同乡数人往来密迩，有所关说。事无实据，而物议已起。`,
      tone: 'bad',
    })
  }

  /* 五、勤薄的高官，公文压在衙门里 */
  const lazy = s.officers
    .filter((o) => {
      if (!o.officeId) return false
      const slot = OFFICE_BY_ID.get(o.officeId)
      return slot && slot.rank <= 3 && o.qin < 42
    })
    .sort((a, b) => a.qin - b.qin)[0]
  if (lazy && rng.chance(0.08)) {
    s.backlog += 1
    s.log.push({
      turn: s.turn,
      text: `${lazy.name}所领衙门，案牍堆积。有司催过三次，答曰「正在办理」。`,
      tone: 'bad',
    })
  }
}

/** 内阁与六部堂官的平均德，用来写史评 */
export function courtMoral(s: WorldState): number {
  return deptScore(s, '内阁', ['de'])
}
