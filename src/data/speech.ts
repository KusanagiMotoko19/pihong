import type { Facet, Officer, SpeechStyle, WorldState } from '../engine/types'

/**
 * 召对。
 *
 * 规矩：他说的每句话都带着他的底 —— 能干的人答得具体，平庸的人答得空，
 * 贪的人回避数目，直的人不绕弯。你不必看数值，看得懂话就够了。
 */

export type Topic = 'politics' | 'people' | 'family' | 'past'

export const TOPICS: { key: Topic; label: string; hint: string }[] = [
  { key: 'politics', label: '问政事', hint: '他办过什么，办得怎样' },
  { key: 'people', label: '问人事', hint: '他跟谁走，谁跟他走' },
  { key: 'family', label: '问家事', hint: '他要什么，他怕什么' },
  { key: 'past', label: '问旧事', hint: '他怎么上来的' },
]

/** 五种人，五种开口的样子 */
const OPEN: Record<SpeechStyle, string> = {
  blunt: '臣直说：',
  sly: '臣不敢妄言，只说一句：',
  pedant: '臣谨按祖制，不敢妄议：',
  dull: '臣……臣愚以为：',
  warm: '臣家中常说：',
}

export interface Exchange {
  topic: Topic
  say: string
  note: string
  facet: Facet
  band: 1 | 2 | 3 | 4 | 5
}

const band5 = (v: number): 1 | 2 | 3 | 4 | 5 =>
  v >= 85 ? 5 : v >= 70 ? 4 : v >= 55 ? 3 : v >= 40 ? 2 : 1

/* ══════════════════════════════ 问政事 ══════════════════════════════ */

const POLITICS: Record<1 | 2 | 3 | 4 | 5, [string, string]> = {
  5: [
    '河南的难处不在田，在漕。漕粮过淮，一石加耗三斗——这三分耗是路上吃的、官仓收的、旗军讨的。臣算过，一年下来，光是耗米就抵得上一个府的正赋。',
    '他说这些时手上在比划，从左到右，像在画一条河。',
  ],
  4: [
    '首在清耗。淮安、徐州两处仓加耗最重，臣去年查过一回，虚报的有两成。',
    '他答得很快，没有一句虚话，也没往自己身上揽功。',
  ],
  3: [
    '臣以为当先抚绥，次及催科。百姓安了，赋自然就出来了。',
    '话不错，只是空。你再问细些，他就绕回去了。',
  ],
  2: [
    '祖宗成法具在，只要守得住，自然无事。',
    '这话可以应付任何问题。他也确实是这么应付的。',
  ],
  1: [
    '这……臣到任未久，容臣查明了再奏。',
    '他到任两年了。',
  ],
}

/* ══════════════════════════════ 问家事 ══════════════════════════════ */

const FAMILY: Record<1 | 2 | 3 | 4 | 5, [string, string]> = {
  5: [
    '臣家里人口不繁。老母在堂，今年七十三，眼睛不济了。臣想求个近处的差事，好早晚看顾。',
    '他说这话没有避讳，也没有借机求什么。这样的人，你信得过。',
  ],
  4: [
    '臣家中薄有田产，是祖上留下的，数目臣记得清。三个儿子，长子去年中了举，余下还在读书。',
    '数目说得清，不夸也不藏。',
  ],
  3: [
    '臣家里……还好，都还过得去。',
    '他没说数目。你也没再问。',
  ],
  2: [
    '臣一向俭省，家中用度都是内人操持，臣从不过问。',
    '你想起东厂前些日子报过一句：他在通州新置了一处宅子。',
  ],
  1: [
    '臣蒙皇上厚恩，家里的事……不敢劳圣虑。',
    '他把话岔开了。岔得很熟。',
  ],
}

/* ══════════════════════════════ 问旧事 ══════════════════════════════ */

const PAST: Record<1 | 2 | 3 | 4 | 5, [string, string]> = {
  5: [
    '臣是嘉靖四十四年的进士，初授推官，在江西。那几年闹倭，臣守过一回城，守了十七天。',
    '他说守城的事说得很轻，像不值得一提。',
  ],
  4: [
    '臣在户部当过三年主事，管的是山东司。那时节的账，臣至今还记得清。',
    '他记得清，说明当年是真下了功夫。',
  ],
  3: [
    '臣由进士授知县，历任同知、知府，蒙恩擢到这里。',
    '履历干净，都是常格，没有什么可说的。',
  ],
  2: [
    '臣……臣历任几处，都是蒙上宪提拔。',
    '他说不清自己做过什么。',
  ],
  1: [
    '臣的履历都在册子上，皇上可以查。',
    '他把话推回给册子。',
  ],
}

/* ══════════════════════════════ 问人事 ══════════════════════════════ */

/** 这一派里，除了他自己，声望最高的那一个 —— 他嘴里说的人，不能是他自己 */
function partyMate(s: WorldState | undefined, o: Officer): string {
  if (!s) return ''
  const same = s.officers
    .filter((x) => x.officeId && x.faction === o.faction && x.id !== o.id)
    .sort((a, b) => b.reputation - a.reputation)
  return same[0]?.name ?? ''
}

function people(o: Officer, s?: WorldState): [string, string] {
  const mate = partyMate(s, o)
  switch (o.faction) {
    case '江陵旧人':
      return [
        '张太师在日，臣在他门下行走过几年。他待人严，可从不亏待做事的人。',
        '他提起张居正时用了「太师」，没改口。',
      ]
    case '晋党':
      // 说同乡的那个人，得是同乡里另一个人。说成自己就荒唐了
      return mate
        ? [
            `${mate}与臣是同乡，乡里乡亲，平日走动是有的。别的不敢说。`,
            '他把「走动」两个字咬得很清楚，像是先替自己划了界。',
          ]
        : [
            '臣是山西人。同乡在外做官的也有几个，平日不过书信往来。',
            '他说得含糊。山西人在朝中不止他一个，这一点他自己清楚。',
          ]
    case '浙党':
      return [
        '臣与浙江几位同年素来相熟，会试一榜出来的，难免通气。',
        '「难免」二字用得巧。',
      ]
    case '清流':
      return [
        '臣不敢结党。朝中几位讲学的先生，臣是敬重的，却未曾拜门。',
        '他说「未曾拜门」时看了你一眼，像是在等你信。',
      ]
    case '边将':
      return [
        '臣在边上一十六年，与各镇将官都是同生共死过来的。这些人不读书，可认人。',
        '他把「认人」说得很重。',
      ]
    case '内廷':
      return [
        '臣与司礼监几位公公只是公事往来，从无私交。',
        '这话说得太快了。',
      ]
    case '新进':
      return [
        '臣是新进，朝中诸位前辈，臣都只闻其名。',
        '他说得实在。新进的人本来就没什么党。',
      ]
    default:
      return [
        '臣素不与人来往，只办自己的差事。',
        '说「素不与人来往」的人，通常是被谁都不理的。',
      ]
  }
}

/** 问一句，答一句 */
export function ask(o: Officer, topic: Topic, s?: WorldState): Exchange {
  const open = OPEN[o.speech]

  if (topic === 'politics') {
    const b = band5(o.neng)
    const [say, note] = POLITICS[b]
    return { topic, say: `${open}${say}`, note, facet: 'talent', band: b }
  }

  if (topic === 'family') {
    const b = band5(o.lian)
    const [say, note] = FAMILY[b]
    // 家事里带一句他自己的私事，人就活了
    const extra = o.speech === 'dull' ? '' : `　${o.privateLife}。`
    return { topic, say: `${open}${say}${extra}`, note, facet: 'integrity', band: b }
  }

  if (topic === 'past') {
    const b = band5(o.de)
    const [say, note] = PAST[b]
    return { topic, say: `${open}${say}`, note, facet: 'temper', band: b }
  }

  const [say, note] = people(o, s)
  return { topic, say, note, facet: 'faction', band: 3 }
}
