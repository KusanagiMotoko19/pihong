import type { Clue, Facet, Officer, WorldState } from './types'

/**
 * 认知账本。
 *
 * 玩家永远看不到真值。他看到的是「听来的话」攒成的印象：
 *   单条线索 → 「似在中上」
 *   多条一致 → 「明敏」
 *   互相矛盾 → 「众说纷纭」
 *
 * 有些线索本身是假的（同僚替他吹、他自己粉饰）。玩家看不出来，
 * 所以假线索照样算进判断 —— 这就是「以为知道」。
 */

const WORDS: Record<Facet, [string, string, string, string, string]> = {
  talent: ['似不通事体', '平平', '中上', '明敏', '卓异'],
  integrity: ['颇不检', '有玷', '未察', '谨饬', '清介'],
  temper: ['躁妄', '峻急', '未见其偏', '持重', '沉毅'],
  faction: ['无党', '杂', '杂', '杂', '杂'],
  record: ['', '', '', '', ''],
}

/** 某一档对应的词，结局对照时用 */
export function wordOf(facet: Facet, band: number): string {
  const idx = Math.min(4, Math.max(0, Math.round(band) - 1))
  return WORDS[facet][idx]
}

function mean(list: Clue[]): number {
  return list.reduce((a, c) => a + c.band, 0) / list.length
}

/** 把一堆线索读成一句话 */
export function readClue(clues: Clue[], facet: Facet): string {
  const list = clues.filter((c) => c.facet === facet)
  if (list.length === 0) return '未有所闻'

  // 两个人的话对不上，就是「众说纷纭」，不硬凑一个数
  const bands = list.map((c) => c.band)
  if (list.length >= 2 && Math.max(...bands) - Math.min(...bands) >= 2) {
    return '众说纷纭'
  }

  const avg = mean(list)
  const idx = Math.min(4, Math.max(0, Math.round(avg) - 1))
  const word = WORDS[facet][idx]

  // 只有一条，语气要虚一点
  return list.length === 1 ? `似${word}` : word
}

/** 把握程度：你攒了多少条线索 */
export function confidence(clues: Clue[], facet: Facet): '低' | '中' | '高' {
  const n = clues.filter((c) => c.facet === facet).length
  if (n === 0) return '低'
  if (n <= 2) return '中'
  return '高'
}

/** 你还没验过的面目 */
export function blanks(clues: Clue[]): Facet[] {
  const have = new Set(clues.map((c) => c.facet))
  return (['talent', 'integrity', 'temper', 'faction', 'record'] as Facet[]).filter(
    (f) => !have.has(f),
  )
}

export function cluesOf(s: WorldState, id: string): Clue[] {
  return s.knowledge[id] ?? []
}

/** 记一笔。同一条线索重复记就覆盖，不堆长度。 */
export function addClue(s: WorldState, id: string, clue: Clue): WorldState {
  const next: WorldState = { ...s, knowledge: { ...s.knowledge } }
  const list = [...(next.knowledge[id] ?? [])]

  const at = list.findIndex((c) => c.facet === clue.facet && c.source === clue.source)
  if (at >= 0) list[at] = clue
  else list.push(clue)

  next.knowledge[id] = list
  return next
}

/**
 * 此人现在在你眼里什么样。
 * 注意：这里读的是线索，不是 officer 的真值。
 */
export function portrait(s: WorldState, o: Officer) {
  const cs = cluesOf(s, o.id)
  return {
    talent: readClue(cs, 'talent'),
    integrity: readClue(cs, 'integrity'),
    temper: readClue(cs, 'temper'),
    faction: readClue(cs, 'faction'),
    record: readClue(cs, 'record'),
    clues: cs,
    blanks: blanks(cs),
  }
}
