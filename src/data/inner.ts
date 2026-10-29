import type { InnerOffice, InnerOfficer } from '../engine/types'
import { Rng, makeName } from '../engine/names'

/**
 * 内廷。这一套人不属于朝廷，属于你。
 *
 * 司礼监替你批红，东厂替你看着别人，锦衣卫替你拿人，
 * 内官监替你修房子，御马监替你收租子，尚膳监替你做饭。
 * 每一样都能用，每一样都长牙。
 */

export const INNER_OFFICES: InnerOffice[] = [
  { id: 'siliji', name: '司礼监', duty: '掌批红，代天子朱笔', power: 5 },
  { id: 'dongchang', name: '东厂', duty: '缉访，为天子耳目', power: 4 },
  { id: 'jinyiwei', name: '锦衣卫', duty: '亲军侍卫，缉捕诏狱', power: 4 },
  { id: 'neiguanjian', name: '内官监', duty: '营造宫室陵寝', power: 2 },
  { id: 'yumajian', name: '御马监', duty: '皇庄草场，收进内帑', power: 2 },
  { id: 'shangshanjian', name: '尚膳监', duty: '供御膳，办典礼', power: 1 },
  { id: 'zhizao', name: '苏杭织造', duty: '织造上用缎匹', power: 2 },
]

const HISTORICAL: InnerOfficer[] = [
  {
    id: 'fb',
    name: '冯保',
    kind: 'eunuch',
    officeId: 'siliji',
    title: '司礼监掌印太监',
    bio: '嘉靖中入宫，隆庆末掌东厂。与张居正合谋逐高拱，拥立今上。掌司礼监十年，批红之权尽在其手。',
    loyalty: 42,
    competence: 79,
    greed: 88,
    power: 95,
    impressions: [
      '他说话时眼皮低垂，你总觉得他在看你。',
      '提起先帝，他落了一滴眼泪。你没看出这滴泪是真的还是算好的。',
      '「老奴伺候皇上这些年，只求皇上安安稳稳的。」这话像慈父，也像威胁。',
    ],
    revealed: 0,
  },
  {
    id: 'zc',
    name: '张诚',
    kind: 'eunuch',
    officeId: 'siliji',
    title: '司礼监秉笔太监',
    bio: '新城人。冯保当权时屈居其下，凡事让其先。极恭顺，恭顺得叫人不安。',
    loyalty: 55,
    competence: 66,
    greed: 60,
    power: 52,
    impressions: [
      '极恭顺，恭顺得让你不自在。',
      '「冯公公是老前辈，奴才什么都不敢争。」说这话时，他的手指在袖子里动了一下。',
    ],
    revealed: 0,
  },
  {
    id: 'zj',
    name: '张鲸',
    kind: 'eunuch',
    officeId: 'dongchang',
    title: '东厂提督太监',
    bio: '司礼监旧人，掌东厂缉访。人极精干，也极会看眼色。',
    loyalty: 60,
    competence: 72,
    greed: 78,
    power: 64,
    impressions: [
      '他汇报事情从不带感情，像在念一张单子。',
      '「厂卫拿人，从来不问缘由。可奴才每次都问一句——问完了，才敢报给皇上。」',
    ],
    revealed: 0,
  },
  {
    id: 'cj',
    name: '陈矩',
    kind: 'eunuch',
    officeId: 'siliji',
    title: '司礼监秉笔太监',
    bio: '安肃人。为人谨厚，不喜生事。后掌东厂，以「祖宗法度」四字自律。',
    loyalty: 82,
    competence: 70,
    greed: 24,
    power: 45,
    impressions: [
      '话极少。你问三句，他答一句。',
      '「东厂拿人，臣总要看过案卷才敢发。」这话在这行里，算是难得的。',
    ],
    revealed: 0,
  },
  {
    id: 'lsy',
    name: '刘守有',
    kind: 'guard',
    officeId: 'jinyiwei',
    title: '锦衣卫指挥使',
    bio: '麻城人，武举出身。张居正柄国时掌锦衣卫，凡诏狱之事，一听内阁指使。',
    loyalty: 58,
    competence: 74,
    greed: 70,
    power: 68,
    impressions: [
      '他穿的是飞鱼服，腰里别着绣春刀。说话却斯文，像个读书人。',
      '「锦衣卫的刀，是皇上的刀。」他说这话时，手放在刀柄上。',
    ],
    revealed: 0,
  },
]

const GENERATED: { name: string; kind: 'eunuch' | 'guard'; officeId: string; title: string }[] = [
  { name: '李佑', kind: 'eunuch', officeId: 'neiguanjian', title: '内官监掌印太监' },
  { name: '王本', kind: 'eunuch', officeId: 'yumajian', title: '御马监掌印太监' },
  { name: '孙朝', kind: 'eunuch', officeId: 'shangshanjian', title: '尚膳监掌印太监' },
  { name: '赵禄', kind: 'eunuch', officeId: 'siliji', title: '司礼监随堂太监' },
  { name: '周用', kind: 'eunuch', officeId: 'dongchang', title: '东厂掌刑千户' },
  { name: '郑安', kind: 'guard', officeId: 'jinyiwei', title: '锦衣卫指挥同知' },
  { name: '吴英', kind: 'guard', officeId: 'jinyiwei', title: '锦衣卫指挥佥事' },
  { name: '冯保二', kind: 'guard', officeId: 'jinyiwei', title: '锦衣卫北镇抚司千户' },
  { name: '何进', kind: 'eunuch', officeId: 'neiguanjian', title: '内官监总理工程' },
  { name: '鲁保', kind: 'eunuch', officeId: 'zhizao', title: '苏杭织造太监' },
]

const BIOUS = [
  '自幼净身入宫，在内书堂读过书。',
  '由御用监小火者拔擢，办事极快，也极会看人。',
  '原是南京守备太监的旧人，调京未久。',
  '北直隶人，随驾多年，未曾外放。',
  '初为锦衣卫校尉，以缉捕积功至此。',
  '以父荫入锦衣卫，未历战阵。',
]

export function buildInner(seed: number): InnerOfficer[] {
  const rng = new Rng(seed + 9973)
  const out: InnerOfficer[] = HISTORICAL.map((o) => ({ ...o, impressions: [...o.impressions] }))

  for (const g of GENERATED) {
    const { courtesy } = makeName(rng)
    out.push({
      id: `in-${g.name}`,
      name: g.name,
      kind: g.kind,
      officeId: g.officeId,
      title: g.title,
      bio: `${rng.pick(BIOUS)}字${courtesy}。`,
      loyalty: rng.normal(58, 16, 15, 95),
      competence: rng.normal(56, 15, 20, 92),
      greed: rng.normal(58, 18, 10, 97),
      power: rng.normal(45, 15, 12, 85),
      impressions: [
        rng.pick([
          '跪着回话，头也不抬。',
          '说话极快，一句接一句，生怕你打断。',
          '站在角落里，像一件家具。',
        ]),
        rng.pick([
          '你问他宫里的事，他答得滴水不漏。',
          '他说「奴才不敢」。可你没问他敢不敢什么。',
        ]),
      ],
      revealed: 0,
    })
  }

  return out
}

/** 某机构的主官（取势最大者） */
export function headOf(inner: InnerOfficer[], officeId: string): InnerOfficer | undefined {
  return inner
    .filter((o) => o.officeId === officeId)
    .sort((a, b) => b.power - a.power)[0]
}
