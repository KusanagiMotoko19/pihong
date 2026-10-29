import type { Effect, MetricKey, WorldState } from './types'
import { Rng } from './names'

/**
 * 精力能做的事。
 *
 * 召对之所以以前没用，是因为它只给一条印象。现在凡是花精力的，
 * 都要有一样拿得出手的产出：一笔钱、一项真数据、一个人、或者一个方向。
 */

export interface ActivityResult {
  effect: Effect
  /** 这一下的结果是「好的」还是「坏的」 */
  good: boolean
  text: string
}

export interface Activity {
  id: string
  name: string
  cost: number
  desc: string
  run: (s: WorldState) => ActivityResult
}

function rngOf(s: WorldState, salt: number): Rng {
  return new Rng(s.seed + s.turn * 104729 + salt)
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'tingzheng',
    name: '御门听政',
    cost: 2,
    desc: '在皇极门受朝，百官奏事。能压住场面，也听得见几句真话。',
    run: (s) => {
      const r = rngOf(s, 1)
      const good = r.chance(0.75)
      return {
        good,
        effect: {
          metrics: { chaoshi: good ? 4 : 2, guanfeng: good ? 1 : -1 },
          log: good
            ? '御门听政。百官奏事，条理清楚。散朝时听见有人说：「皇上今日精神好。」'
            : '御门听政。站了一个时辰，六部所奏，全是套话。',
        },
        text: good ? '朝会整肃，六部奏事有条理。' : '朝会照旧，奏的都是套话。',
      }
    },
  },
  {
    id: 'yuewu',
    name: '阅武',
    cost: 2,
    desc: '校阅京营。看得见兵，也看得见兵身上的破棉袄。',
    run: (s) => {
      const r = rngOf(s, 2)
      const f = s.frontiers[r.int(0, s.frontiers.length - 1)]
      const good = r.chance(0.65)
      return {
        good,
        effect: {
          metrics: { bianfang: good ? 3 : 1 },
          frontier: { id: f.id, readiness: good ? 4 : -1 },
          log: good
            ? `校阅京营。兵马尚可用。回来后即命${f.name}补造军器。`
            : `校阅京营。队伍站不齐，有一队人的刀是木头的。`,
        },
        text: good ? '京营尚可一战。' : '京营虚有其表，刀是木头的。',
      }
    },
  },
  {
    id: 'jingyan',
    name: '经筵',
    cost: 2,
    desc: '听讲官讲书。讲官多是翰林，讲完了会替同年说几句好话。',
    run: (s) => {
      const r = rngOf(s, 3)
      const pool = s.officers.filter((o) => o.officeId === null)
      const talent = pool.length > 0 ? pool[r.int(0, pool.length - 1)] : null
      const found = r.chance(0.45) && talent
      if (found && talent) {
        talent.reputation = Math.min(99, talent.reputation + 10)
      }
      return {
        good: true,
        effect: {
          metrics: { guanfeng: 2, chaoshi: 1 },
          log: found
            ? `经筵。讲官讲《大学衍义》，讲完推荐了一个人：${talent!.name}。`
            : '经筵。讲官讲《大学衍义》，中规中矩。',
        },
        text: found ? `讲官荐人：${talent!.name}（在籍）。` : '经筵如仪。',
      }
    },
  },
  {
    id: 'zhaijiao',
    name: '斋醮',
    cost: 1,
    desc: '在宫中设醮祈福。花钱不多，有时候真的下雨。',
    run: (s) => {
      const r = rngOf(s, 4)
      const roll = r.next()
      if (roll < 0.55) {
        return {
          good: true,
          effect: { metrics: { minxin: 3 }, log: '斋醮七日。适逢降雨，中外称圣德。' },
          text: '斋醮之后下了雨。百姓信了。',
        }
      }
      if (roll < 0.85) {
        return {
          good: true,
          effect: { metrics: { minxin: 1 }, log: '斋醮七日。无功无过。' },
          text: '斋醮如仪，天没下雨，也没旱。',
        }
      }
      return {
        good: false,
        effect: {
          metrics: { minxin: -2, guanfeng: -2 },
          log: '斋醮七日，糜费不赀，而旱如故。言官有疏，说「祷祀非治国之本」。',
        },
        text: '斋醮无功，言官上疏讥讽。',
      }
    },
  },
  {
    id: 'mibao',
    name: '阅密报',
    cost: 2,
    desc: '东厂的密报，一旬一匣。看多了会疑心，不看会瞎。',
    run: (s) => {
      const r = rngOf(s, 5)
      const keys: MetricKey[] = ['minxin', 'bianfang', 'guanfeng', 'chaoshi']
      const k = keys[r.int(0, 3)]
      const names: Record<MetricKey, string> = {
        minxin: '民心',
        bianfang: '边防',
        guanfeng: '官风',
        chaoshi: '朝局',
      }
      return {
        good: true,
        effect: {
          metrics: { chaoshi: -1 },
          flags: { [`intel_${k}`]: 1 },
          log: `阅东厂密报。${names[k]}一项，报的与实数差得不少。`,
        },
        text: `你看到了「${names[k]}」的真数。`,
      }
    },
  },
  {
    id: 'xunxing',
    name: '巡幸',
    cost: 4,
    desc: '出宫走一趟。看得见真实的田、真实的人，也看得见真实的账。',
    run: (s) => {
      const r = rngOf(s, 6)
      const cost = 3 + r.int(0, 4)
      return {
        good: true,
        effect: {
          taicang: -cost,
          metrics: { minxin: 4, chaoshi: 2 },
          flags: { intel_minxin: 1, intel_guanfeng: 1 },
          log: `巡幸畿甸。见麦田有蝗，见县衙破败，见老农跪在道边，说「今年的税，实在交不出」。`,
        },
        text: '你看见了民心和官风的真数。',
      }
    },
  },
  {
    id: 'jitian',
    name: '祭天',
    cost: 3,
    desc: '南郊祭天。礼仪繁重，但天下人看的就是这个。',
    run: (s) => {
      const r = rngOf(s, 7)
      const good = r.chance(0.8)
      return {
        good,
        effect: {
          taicang: -2,
          metrics: { minxin: good ? 5 : 2, chaoshi: 2 },
          log: good
            ? '南郊祭天。礼成，天有微云，风不扬尘。百官以为吉。'
            : '南郊祭天。礼成时落了一阵雨，执事者的衣裳全湿了，仪注乱了半刻。',
        },
        text: good ? '祭天礼成，中外称善。' : '祭天时下雨，仪注乱了半刻。',
      }
    },
  },
  {
    id: 'shangci',
    name: '赏赐群臣',
    cost: 2,
    desc: '撒钱。撒得巧，人心向着你；撒得滥，就成了规矩。',
    run: (s) => {
      const r = rngOf(s, 8)
      return {
        good: true,
        effect: {
          neitang: -(2 + r.int(0, 3)),
          metrics: { chaoshi: 4, guanfeng: -1 },
          log: '赏赐在京文武官员。银币有差，人人有份。',
        },
        text: '赏了银子。朝会上的人，脸色都好看了些。',
      }
    },
  },
  {
    id: 'xingming',
    name: '亲览刑名',
    cost: 2,
    desc: '看刑部的招册。有几桩案子，判得不太对。',
    run: (s) => {
      const r = rngOf(s, 9)
      const ping = r.chance(0.6)
      return {
        good: true,
        effect: ping
          ? { metrics: { minxin: 3, guanfeng: 2 }, log: '亲览刑名，平反冤狱三起。' }
          : { metrics: { guanfeng: 2, minxin: -2 }, log: '亲览刑名，勾决重囚二十七人。' },
        text: ping ? '平反了三桩冤狱。' : '勾决了二十七个人。',
      }
    },
  },
  {
    id: 'bianjiang',
    name: '召见边将',
    cost: 2,
    desc: '叫一个总兵来问话。他说的未必真，但你能看见他的手。',
    run: (s) => {
      const r = rngOf(s, 10)
      const f = s.frontiers[r.int(0, s.frontiers.length - 1)]
      return {
        good: true,
        effect: {
          metrics: { bianfang: 2 },
          frontier: { id: f.id, audited: true },
          flags: { intel_bianfang: 1 },
          log: `${f.name}总兵入见。问及兵额，他先说「足额」，后来改口说「略有逃亡」。实额${f.actual.toFixed(1)}万。`,
        },
        text: `${f.name}的实额，你知道了。`,
      }
    },
  },
  {
    id: 'neitang',
    name: '查内帑',
    cost: 1,
    desc: '清点自己的私房。这是唯一一本不必经过别人的账。',
    run: () => ({
      good: true,
      effect: {
        metrics: { chaoshi: -1 },
        log: '命内官监清查内帑。账目与内官监所报，差了三万两。',
      },
      text: '内帑的账，你自己对了一遍。',
    }),
  },
  {
    id: 'weifu',
    name: '微服私访',
    cost: 3,
    desc: '换身便服出宫。看得见真东西，也可能遇上真麻烦。',
    run: (s) => {
      const r = rngOf(s, 11)
      const roll = r.next()
      if (roll < 0.6) {
        return {
          good: true,
          effect: {
            metrics: { minxin: 5, chaoshi: -1 },
            flags: { intel_minxin: 1, intel_guanfeng: 1 },
            log: '微服出宫，走了一趟城南。见粮价、见乞丐、见衙役在街上打人。回宫之后一夜没睡。',
          },
          text: '你看见了粮价和衙役的鞭子。',
        }
      }
      if (roll < 0.88) {
        return {
          good: false,
          effect: {
            metrics: { chaoshi: -3, guanfeng: -2 },
            log: '微服出宫，被巡城御史认出，跪在街上不肯起来。第二天，全城都知道皇上出过宫。',
          },
          text: '被人认出来了。',
        }
      }
      return {
        good: false,
        effect: {
          metrics: { chaoshi: -5, minxin: 2 },
          flags: { danger: 1 },
          log: '微服出宫，在城外遇上一伙人，随行的锦衣卫折了两个。回宫时天还没亮。',
        },
        text: '遇上麻烦了，折了两个人。',
      }
    },
  },
]

export const ACTIVITY_BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]))

/** 召对时能问出的一项真数据，按该官员的职掌来 */
export function intelFromOffice(s: WorldState, officeId: string | null): { key: MetricKey; label: string } | null {
  if (!officeId) return null
  if (officeId.startsWith('hubu')) return { key: 'guanfeng', label: '各省钱粮完欠' }
  if (officeId.startsWith('bingbu') || officeId.startsWith('zz-')) return { key: 'bianfang', label: '各镇兵额虚实' }
  if (officeId.startsWith('xunfu') || officeId.startsWith('buzheng')) return { key: 'minxin', label: '地方民情' }
  if (officeId.startsWith('ducha') || officeId.startsWith('ke-')) return { key: 'guanfeng', label: '吏治清浊' }
  if (officeId.startsWith('grand') || officeId.startsWith('libu')) return { key: 'chaoshi', label: '朝中动向' }
  const pool: MetricKey[] = ['minxin', 'bianfang', 'guanfeng', 'chaoshi']
  return { key: pool[s.turn % 4], label: '职掌所及' }
}

/** 该人是不是个可用之才（召对时用得着） */
export function talentOf(s: WorldState, id: string): string | null {
  const o = s.officers.find((x) => x.id === id)
  if (!o) return null
  if (o.officeId) return null
  if (o.reputation >= 78) return '此人在士林中有声，可用。'
  return null
}

