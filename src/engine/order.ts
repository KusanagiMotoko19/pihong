import type { Memorial, MemorialKind } from './types'

const ORDER: Record<MemorialKind, number> = {
  urgent: 0,
  impeach: 1,
  personnel: 2,
  project: 3,
  routine: 4,
}

/** 案头的次序：急的在前，压得久的在前 */
export function sortQueue(list: Memorial[]): Memorial[] {
  return [...list].sort((a, b) => {
    const d = ORDER[a.kind] - ORDER[b.kind]
    return d !== 0 ? d : a.stayMonths - b.stayMonths
  })
}
