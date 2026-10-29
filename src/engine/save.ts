import type { WorldState } from './types'

/**
 * 存档。key 带版本号：结构一变（M0 → M1 加了 powers / frontiers / xun），
 * 旧档直接作废重开，好过让残缺的档把界面搞崩。
 */
const KEY = 'pihong.save.v3'
const OLD_KEYS = ['pihong.save.v1', 'pihong.save.v2']

export function save(s: WorldState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 存档失败不该影响游戏 */
  }
}

export function load(): WorldState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as WorldState
    if (!s || typeof s.turn !== 'number' || !Array.isArray(s.officers)) return null
    if (!Array.isArray(s.powers) || !Array.isArray(s.frontiers)) return null
    if (!Array.isArray(s.inner)) return null
    if (!s.date || typeof s.date.xun !== 'number') return null
    if (typeof s.shelved !== 'number') s.shelved = 0
    // 后加的字段：老档读进来不能崩
    if (!Array.isArray(s.orders)) s.orders = []
    if (!s.statutes || typeof s.statutes !== 'object') s.statutes = { kaocheng: true }
    if (!s.knowledge || typeof s.knowledge !== 'object') s.knowledge = {}
    return s
  } catch {
    return null
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY)
    // 顺手清掉旧版本留下的档，免得以后又读到
    for (const k of OLD_KEYS) localStorage.removeItem(k)
  } catch {
    /* ignore */
  }
}
