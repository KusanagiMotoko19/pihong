import { useMemo } from 'react'
import type { InnerOfficer, Officer } from '../engine/types'

/**
 * 把人名做成可点的入口 —— 外廷、内廷一视同仁。
 * 太监和锦衣卫也是有名有姓的人，点开一样能看他的底。
 */

export type PersonKind = 'officer' | 'inner'

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function OfficerText({
  text,
  officers,
  inner,
  onPick,
}: {
  text: string
  officers: Officer[]
  inner?: InnerOfficer[]
  onPick: (id: string, kind: PersonKind) => void
}) {
  const parts = useMemo(() => {
    type Entry = { id: string; kind: PersonKind; name: string }
    const all: Entry[] = [
      ...officers
        .filter((o) => o.name.length >= 2)
        .map((o) => ({ id: o.id, kind: 'officer' as const, name: o.name })),
      ...(inner ?? [])
        .filter((o) => o.name.length >= 2)
        .map((o) => ({ id: o.id, kind: 'inner' as const, name: o.name })),
    ]
    if (all.length === 0) return [{ text }]
    all.sort((a, b) => b.name.length - a.name.length)

    const map = new Map(all.map((e) => [e.name, e]))
    const re = new RegExp(`(${all.map((e) => esc(e.name)).join('|')})`, 'g')
    const out: { text: string; id?: string; kind?: PersonKind }[] = []
    let last = 0
    for (const m of text.matchAll(re)) {
      const i = m.index ?? 0
      if (i > last) out.push({ text: text.slice(last, i) })
      const hit = map.get(m[0])
      out.push({ text: m[0], id: hit?.id, kind: hit?.kind })
      last = i + m[0].length
    }
    if (last < text.length) out.push({ text: text.slice(last) })
    return out
  }, [text, officers, inner])

  return (
    <>
      {parts.map((p, i) =>
        p.id ? (
          <span
            key={i}
            className="name-link"
            onClick={(e) => {
              e.stopPropagation()
              onPick(p.id!, p.kind!)
            }}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}
