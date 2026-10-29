import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'
import { OFFICE_BY_ID } from '../../engine/offices'

/**
 * 罢一个人的回响，和党争的实际动作。
 *
 * 朝中没有孤身一人的人。罢他一个，同党十几个都要动 ——
 * 动的办法不是造反，是上疏。联名、申救、攻讦，都是本分内的事。
 */

/* ══════════════════════════ 罢免之后 ══════════════════════════ */

export const purgeBacklash = def(
  'purge-backlash',
  'impeach',
  (s: WorldState) => {
    const sev = s.flags.purge_severity ?? 1
    const severe = sev >= 2
    // 找一个可能替他被说话的官：同党、在任、声望不低
    const ally = s.officers
      .filter((o) => o.officeId && o.reputation >= 55)
      .sort((a, b) => b.reputation - a.reputation)[0]

    return {
      from: ally ? `${OFFICE_BY_ID.get(ally.officeId!)?.name ?? '科臣'} ${ally.name}` : '吏科都给事中',
      title: severe ? '为大臣下狱、恐伤国体、乞赐矜察事' : '为去留太遽、人材可惜、乞赐酌议事',
      summary: severe
        ? '一人下狱，同列噤声。科臣上疏，话说得极客气，意思极重。'
        : '无过而罢，人皆自危。有臣上疏，请他复职。',
      body:
        `臣谨奏：前月${severe ? '某某下狱' : '某某罢职'}，臣不敢谓其无罪。\n\n` +
        (severe
          ? `然有一事，臣不能不奏：大国之体，在乎去留有法。\n\n` +
            `其人有罪，当付法司，三法司会审，罪状明白，然后下狱。` +
            `今一旨之下，即入诏狱，罪状未明，人心先疑。\n\n` +
            `且诏狱者，非国家之常法。祖宗设三法司，正为凡狱必经审录。` +
            `今以诏狱治大臣，此后凡被论者，皆不知自己犯的是哪一条。\n\n`
          : `然臣闻其人历任有年，未尝有贪酷之实。今无故而罢，` +
            `天下仕者将谓：做得好不好，不在事，在合不合上意。\n\n` +
            `如此，则人皆趋附，无人任事。\n\n`) +
        `臣非为其一人惜，为朝廷之体惜。伏乞圣裁。`,
      piaoni: '该衙门知道。',
      secret:
        '这本疏后面有十几个人联署，只是名字没写上去。' +
        '写这本的人，和被罢的那个人，是同一年中的进士。',
      patience: 3,
      yiEffect: { metric: { chaoshi: 2, guanfeng: 2 } },
      ignoredEffect: { metric: { chaoshi: -3, guanfeng: -2 } },
      options: [
        {
          key: 'restore2',
          label: '复其官',
          note: '认一次。人回来了，你的话以后就轻了',
          effect: {
            metric: { chaoshi: 6, guanfeng: 4 },
            flags: { purge_reversed: 1 },
          },
        },
        {
          key: 'half2',
          label: '不复官，量予恩典（致仕、驰驿归）',
          note: '给个体面，不给位子',
          effect: { metric: { chaoshi: 3, guanfeng: 2 }, flags: { purge_honored: 1 } },
        },
        {
          key: 'hard2',
          label: '罚俸，令其安分',
          note: '',
          effect: { metric: { chaoshi: -4, guanfeng: -3 }, flags: { purge_hardened: 1 } },
        },
      ],
    }
  },
  {
    weight: 0,
    cooldown: 999,
    line: 'purge',
    when: (s) => s.flags.purge_recent !== undefined && s.turn - s.flags.purge_recent <= 3,
  },
)

/* ══════════════════════════ 党争：保举与攻讦 ══════════════════════════ */

const PARTY_NOTE: Record<string, string> = {
  江陵旧人: '张太师门下行走过的那些人',
  晋党: '山西、陕西一榜出来的人',
  浙党: '浙江宁波、绍兴一带的同年',
  清流: '讲学论道、以名节相标榜的那些人',
  边将: '在边镇带过兵、靠军功上来的人',
  内廷: '和内官有往来的人',
  新进: '近三五年才入朝的',
  无党: '不结党的人',
}

/**
 * 一旬之内，朝中的派系在做三件事：保举自己人、攻讦别家人、联名表态。
 *
 * 这些不生成奏疏（奏疏太贵），直接算在声望与朝局上，然后留在起居注里。
 * 你在朝廷页看到的那些声望变化，一半是这么来的。
 */
export function tickFactions(s: WorldState): void {
  const serving = s.officers.filter((o) => o.officeId)
  if (serving.length < 20) return

  const rnd = Math.random()
  // 朝局越低，党争越凶
  const tension = (100 - s.truth.chaoshi) / 100
  if (rnd > 0.35 + tension * 0.4) return

  // 按派系分组，取最大的一党
  const groups = new Map<string, typeof serving>()
  for (const o of serving) {
    if (o.faction === '无党' || o.faction === '新进') continue
    const arr = groups.get(o.faction) ?? []
    arr.push(o)
    groups.set(o.faction, arr)
  }
  const ranked = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  if (ranked.length < 2) return

  const [bigName, big] = ranked[0]
  const [otherName, other] = ranked[1]
  const act = Math.random()

  if (act < 0.4) {
    // 保举：本党的人声望上涨
    const pick = big[Math.floor(Math.random() * big.length)]
    pick.reputation = Math.min(100, pick.reputation + 3)
    s.truth.chaoshi = Math.max(0, s.truth.chaoshi - 0.3)
    s.log.push({
      turn: s.turn,
      text: `${bigName}诸人交章荐${pick.name}，称其「可当大任」。`,
      tone: 'normal',
    })
  } else if (act < 0.8) {
    // 攻讦：别家的人声望下跌
    const pick = other[Math.floor(Math.random() * other.length)]
    pick.reputation = Math.max(0, pick.reputation - 4)
    s.truth.chaoshi = Math.max(0, s.truth.chaoshi - 0.6)
    s.log.push({
      turn: s.turn,
      text: `${bigName}中人攻${pick.name}，谓其「办事乖方」。${PARTY_NOTE[otherName] ?? ''}不服。`,
      tone: 'bad',
    })
  } else {
    // 联名：两边对着上疏，朝局抖一下
    s.truth.chaoshi = Math.max(0, s.truth.chaoshi - 1)
    s.truth.guanfeng = Math.max(0, s.truth.guanfeng - 0.4)
    s.log.push({
      turn: s.turn,
      text: `${bigName}与${otherName}各上联名一疏，互相攻讦。两本都留中。`,
      tone: 'bad',
    })
  }
}

/**
 * 谁在拟这份名单。
 *
 * 朝局崩了、某一党坐大，廷推的名单就成了那一党自己开的单子 ——
 * 你能选，但选谁都一样。
 */
export function partyController(s: WorldState): { faction: string; count: number } | null {
  if (s.truth.chaoshi > 62) return null
  const groups = new Map<string, number>()
  for (const o of s.officers) {
    if (!o.officeId) continue
    if (o.faction === '无党' || o.faction === '新进') continue
    groups.set(o.faction, (groups.get(o.faction) ?? 0) + 1)
  }
  const top = [...groups.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!top || top[1] < 14) return null
  return { faction: top[0], count: top[1] }
}
