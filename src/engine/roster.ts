import type { Officer, Faction, SpeechStyle } from './types'
import { Rng, makeName, makeOrigin, makeJinshi } from './names'
import { OFFICES, OFFICE_BY_ID } from './offices'
import { NOTABLES } from '../data/notables'

/* ------------------------------------------------------------------ *
 * 考语。明代吏部考核官员，给四字或八字评语，叫「考语」。
 * 问题在于：考语是人写的。写的人可能看走了眼，也可能收了钱。
 * ------------------------------------------------------------------ */

const DE_HIGH = ['德性端谨，士论归之', '持身有守，不随流俗', '孝友著闻，操履无亏']
const DE_MID = ['德性无玷，亦无赫赫之名', '中人之品，无大过', '循常守分']
const DE_LOW = ['行止有亏，物议及之', '险薄好讦，同僚侧目', '素行不检']

const NENG_HIGH = ['才具明敏，遇事剖决如流', '才识通敏，长于繁剧', '干练有为，能任艰巨']
const NENG_MID = ['才具平常，堪供驱使', '持重寡言，遇事不躁', '中人之才，可守常']
const NENG_LOW = ['才识短浅，不能任事', '阘茸无能，尸位素餐']

const QIN_HIGH = ['莅事惟勤，夙夜匪懈', '勤于职守，案无留牍', '居官勤恪，不惮劳苦']
const QIN_MID = ['循例办公，无所建明', '职守无废']
const QIN_LOW = ['怠于职守，案牍丛积', '屡次托故不到', '懈弛成习']

const LIAN_HIGH = ['操守谨严，一介不取', '清介自持，囊无余资', '砥砺名节，不附权势']
const LIAN_MID = ['操守无玷，亦无赫赫之名', '随俗俯仰，未闻贪声']
const LIAN_LOW = ['操守不谨，物以贿闻', '贪声昭著，物议沸腾', '簠簋不饬']

function band(v: number, hi: string[], mid: string[], lo: string[], rng?: Rng): string {
  const pool = v >= 72 ? hi : v >= 50 ? mid : lo
  return rng ? rng.pick(pool) : pool[0]
}

/**
 * 考语：吏部会同都察院给的评语。
 *
 * 按四善（德、慎、公、勤）的老规矩写，但写成五维的说法。
 * 三成与实情有出入 —— 拟考语的人也会看走眼，也会收钱。
 */
function appraisalOf(rng: Rng, dims: { de: number; neng: number; qin: number; lian: number }): string {
  const drift = rng.chance(0.3) ? rng.int(-26, 26) : rng.int(-5, 5)
  const d = dims.de + drift
  const n = dims.neng + drift
  const q = dims.qin + Math.round(drift * 0.7)
  const l = dims.lian + Math.round(drift * 0.6)

  // 考语不是把五项都念一遍。吏部写考语，先看品行，再看才具，操守有亏的一句必须点出来
  const parts = [band(d, DE_HIGH, DE_MID, DE_LOW, rng), band(n, NENG_HIGH, NENG_MID, NENG_LOW, rng)]
  if (l < 55) parts.push(band(l, LIAN_HIGH, LIAN_MID, LIAN_LOW, rng))
  else if (q >= 72 && rng.chance(0.5)) parts.push(band(q, QIN_HIGH, QIN_MID, QIN_LOW, rng))

  // 结论必须和才、廉对得上，不能前面骂完后面说堪任
  const verdict =
    n >= 70 && l >= 62
      ? '堪任繁剧。'
      : n >= 52 && l >= 48
        ? '可备任使。'
        : n < 45
          ? '不宜任事。'
          : '宜量加裁抑。'
  return parts.join('，') + '，' + verdict
}

/* ------------------------------------------------------------------ *
 * 召对印象。三条依次解锁：形貌、问事、露底。
 * ------------------------------------------------------------------ */

const LOOKS = [
  '进门行礼，然后就站着，不说话，等你先开口。',
  '说话带点乡音，急了会结巴。',
  '很年轻，紧张得手一直在袖子里攥着。',
  '须发半白，腰背却还是直的。',
  '生得清瘦，一件旧袍子洗得发亮。',
  '面容黑瘦，一看就是在外头待过的。',
  '应答很慢，每句话都像要先在心里过一遍。',
  '声音洪亮，震得殿里回音。',
  '一直低着头，只在你问话时才抬眼看你一下。',
  '长得敦厚，笑起来像个乡下的教书先生。',
]

const BUSINESS_HIGH = [
  '你问他本衙门的事，他一口气说了半炷香，没有一句是空的。',
  '他随身带了一本册子，翻开来全是数目，哪一年多少、哪一处多少，清清楚楚。',
  '你故意问错了一个数。他立刻纠正，语气很平，没有得意。',
  '他说了三件事，三件事都有办法，且都算过钱。',
]
const BUSINESS_MID = [
  '他答得中规中矩，该说的都说了，不该说的一个字没有。',
  '你问他难处，他先说「不敢言难」，然后说了半个时辰的难处。',
  '他讲的道理都对，可你听完还是不知道明天该做什么。',
]
const BUSINESS_LOW = [
  '你问他本衙门的事，他答得含含糊糊，凡是数目都说「容臣查了再奏」。',
  '他讲了很多，你听完发现什么也没讲。',
  '他说这事该问堂官。你提醒他，他就是堂官。他愣了愣，说「那容臣回去想想」。',
]

const BOTTOM_HIGH = [
  '临走时他说了一句多余的话，是关于别人的短处。你记住了这个人的分寸。',
  '你说「卿且退」，他没有立刻走，站着补了一句：「皇上，还有一件事。」',
]
const BOTTOM_MID = [
  '他退下时脚步不快不慢。你没有什么特别的感觉。',
  '他退到门口，回头看了一眼案上的奏疏。',
]
const BOTTOM_LOW = [
  '他说话时眼睛总往别处瞟。你不确定他在看什么。',
  '你问他一句私事，他答得很滑。滑得不像个读书人。',
]

function impressionsOf(rng: Rng, neng: number, lian: number): string[] {
  const looks = rng.pick(LOOKS)
  const biz =
    neng >= 72 ? rng.pick(BUSINESS_HIGH) : neng >= 50 ? rng.pick(BUSINESS_MID) : rng.pick(BUSINESS_LOW)
  // 第三条才是露底的那一句：操守低的，藏不住
  const bottom =
    lian >= 70 ? rng.pick(BOTTOM_HIGH) : lian >= 45 ? rng.pick(BOTTOM_MID) : rng.pick(BOTTOM_LOW)
  return [looks, biz, bottom]
}

/* ------------------------------------------------------------------ *
 * 生成
 * ------------------------------------------------------------------ */

const SPEECH_POOL: SpeechStyle[] = ['blunt', 'sly', 'pedant', 'dull', 'warm']

const PRIVATE_LIFE = [
  '老母在堂，七十有三',
  '有子三人，长子已中举',
  '妻病三年，药不离口',
  '家在通州，去年新置了一处宅子',
  '祖上三代都是举人，只他一人中了进士',
  '弟弟在乡里惹过一场官司',
  '长子在国子监读书，考了三回没中',
  '早年在边镇做过幕僚',
  '写得一手好字，替人写过墓志',
  '无子，只一个女儿，嫁在邻县',
  '有痼疾，每至冬月便咳血',
  '父母皆亡，家中只有老仆一人',
  '少年时家贫，靠族人接济',
  '嗜酒，酒后失言过一回',
  '妻族是本省的大族',
  '有一个兄弟在他手下当差',
  '藏书万卷，自称「不换田宅换书」',
  '每次考满都上一个乞休的疏，从没真走',
]

const WANTS = [
  '想升一级，好荫一子',
  '想回乡养亲',
  '想为亡父请一封诰',
  '想给长子谋个出身',
  '想留个清名在士林',
  '想入内阁',
  '想调离这个苦缺',
  '只想保住现在的位子',
  '想把对头挤走',
  '想在三年考满时不落人后',
]

const FACTION_POOL: Faction[] = ['晋党', '浙党', '清流', '边将', '新进', '无党', '无党', '无党', '江陵旧人']

const clampI = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)))

let counter = 0

function makeOfficer(
  rng: Rng,
  opts: { officeId: string | null; senior: boolean; idPrefix?: string },
): Officer {
  const { name, courtesy } = makeName(rng)
  const senior = opts.senior
  const neng = rng.normal(senior ? 66 : 58, senior ? 12 : 14, 22, 93)
  const lian = rng.normal(senior ? 58 : 60, 17, 8, 96)
  // 德与廉相关，但不完全同路：有人不贪而刻薄，有人和气而滑手
  const de = clampI(rng.normal(lian * 0.55 + 40 * 0.45, 14, 8, 97), 8, 97)
  const qin = rng.normal(senior ? 60 : 56, 15, 10, 96)
  // 绩：做得出来才算。能干又肯干的人，账上才有东西
  const ji = clampI(neng * 0.45 + qin * 0.35 + lian * 0.1 + rng.int(-12, 12), 5, 97)
  const age = rng.int(32, 66)
  const origin = makeOrigin(rng)
  const jinshi = makeJinshi(rng, senior)

  counter += 1
  return {
    id: `${opts.idPrefix ?? 'gen'}-${counter}`,
    name,
    courtesy,
    origin,
    jinshi,
    birthYear: 1582 - age,
    officeId: opts.officeId,
    bio: `${origin}人。${jinshi}。历${rng.pick(['知县', '推官', '给事中', '郎中', '知府', '副使', '参政', '按察使', '巡抚'])}，${rng.pick([
      '以卓异擢',
      '以考满升',
      '以边功进',
      '以荐举起',
      '以资历转',
    ])}今职。`,
    appraisal: appraisalOf(rng, { de, neng, qin, lian }),
    de,
    neng,
    qin,
    ji,
    lian,
    faction: rng.pick(FACTION_POOL),
    reputation: Math.max(
      5,
      Math.min(95, Math.round(neng * 0.5 + lian * 0.25 + ji * 0.25 + rng.int(-16, 16))),
    ),
    impressions: impressionsOf(rng, neng, lian),
    revealed: 0,
    tenure: 0,
    speech: rng.pick(SPEECH_POOL),
    privateLife: rng.pick(PRIVATE_LIFE),
    want: rng.pick(WANTS),
  }
}

/**
 * 造出整个朝廷与人才库。
 * 规矩：一个萝卜一个坑，历史人物先占坑，剩下的由生成器补。
 */
export function buildRoster(seed: number): Officer[] {
  const rng = new Rng(seed)
  counter = 0

  const officers: Officer[] = NOTABLES.map((n) => ({ ...n, impressions: [...n.impressions] }))
  const taken = new Set(officers.map((o) => o.officeId).filter(Boolean) as string[])

  // 补满官缺
  for (const slot of OFFICES) {
    if (taken.has(slot.id)) continue
    if (slot.kind === 'eunuch' && !rng.chance(0.5)) continue // 内廷不全填
    const senior = slot.rank <= 4
    officers.push(makeOfficer(rng, { officeId: slot.id, senior, idPrefix: `o_${slot.id}` }))
  }

  // 人才库：在籍候选、候补、新科
  while (officers.length < 400) {
    const age = rng.int(24, 62)
    const off = makeOfficer(rng, { officeId: null, senior: age > 45, idPrefix: 'pool' })
    off.birthYear = 1582 - age
    off.bio = `${off.origin}人。${off.jinshi}。${rng.pick([
      '今在籍候选',
      '前为知县，以忧去',
      '前为推官，被论调简',
      '新科观政，未授职',
      '由举人入监，候选举人',
      '前为郎中，以考察闲住',
    ])}。`
    officers.push(off)
  }

  return officers
}

export function officerAt(officers: Officer[], officeId: string): Officer | undefined {
  return officers.find((o) => o.officeId === officeId)
}

export function officeOf(o: Officer): string {
  if (!o.officeId) return '在籍'
  return OFFICE_BY_ID.get(o.officeId)?.name ?? '在籍'
}

export function isVacant(officers: Officer[], officeId: string): boolean {
  return !officers.some((o) => o.officeId === officeId)
}

/** 人才库里挑几个能补某个缺的，按声望排序。守制的人不在名单里 */
export function candidatesFor(
  officers: Officer[],
  officeId: string,
  n = 3,
  turn = 0,
): Officer[] {
  const slot = OFFICE_BY_ID.get(officeId)
  if (!slot) return []
  const pool = officers.filter((o) => o.officeId === null && (o.leaveUntil ?? 0) <= turn)
  // 品级越高，越看声望与干才
  const scored = pool.map((o) => ({
    o,
    score: o.reputation * 0.5 + o.neng * 0.2 + o.ji * 0.15 + o.lian * 0.15 - Math.abs(slot.rank - 4) * 2,
  }))
  scored.sort((a, b) => b.score - a.score)
  // 在最好的十五个里随机取三个 —— 廷推本来就不是纯按能力
  const top = scored.slice(0, 15)
  const picked: Officer[] = []
  while (picked.length < n && top.length > 0) {
    const i = Math.floor(((officers.length * 7 + picked.length * 13) % top.length) + 0)
    const [entry] = top.splice(i % top.length, 1)
    picked.push(entry.o)
  }
  return picked
}
