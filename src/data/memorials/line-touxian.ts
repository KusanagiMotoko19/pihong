import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 投献。
 *
 * 明代赋役史上最阴的一条线：民间把田「献」给王府、勋贵、乡宦，
 * 挂在他们名下，田还是自己种，赋役却没了 —— 因为王府是优免的。
 * 官府的册子上，田就凭空少了；税还在，就摊到没投献的人头上。
 * 于是投献的人越来越多，直到一个县的田，半在藩府。
 *
 * 这一条线不是「新律令」，是**清丈、一条鞭、宗室法三者共同的对手**：
 *   你丈出来的田，他献回去；
 *   你折银征收，他把田藏进王府避税；
 *   你削宗室的禄，他更要收投献补亏。
 *
 * 所以它咬在三个系统上：
 *   一、财政：投献每增一成，税基减两分（rules.ts:tickTreasury）；
 *   二、清丈：投献压到六成以上，清丈进度会被拖回去（rules.ts:tickProject）；
 *   三、考课：亲阅册籍会看见投献（actions.ts:projectAction → touxian -1）。
 */

const on = (s: WorldState, id: string) => !!s.statutes[id]
const level = (s: WorldState) => Math.max(0, s.flags.touxian ?? 0)
const qzRunning = (s: WorldState) => {
  const p = s.projects.find((x) => x.id === 'qingzhang')
  return !!p && p.status === 'running' && p.progress > 25
}

/* ══════════════════════════ 第一次发现 ══════════════════════════ */

export const touxianOpen = def(
  'touxian-open',
  'impeach',
  (s) => {
    const zong = on(s, 'zonglu') || on(s, 'xianfeng')
    return {
      from: '巡按直隶监察御史',
      title: '为豪民投献、田去粮存、乞赐严禁事',
      summary: `南直隶三县，田亩册上少了七万亩 —— 不在水，不在沙，在王府的优免册里。`,
      body:
        `臣谨奏：臣巡历南直隶，查得苏、松、常三府，有「投献」之弊。\n\n` +
        `所谓投献者：民田一亩，本应纳粮五升。若将此田「献」于王府、勋贵、乡宦之家，` +
        `田仍自种，租仍自收，而赋役全免 —— 因为受献之家，是优免的。\n\n` +
        `臣查无锡一县：册上额田三十万亩，今实征者不过二十二万。` +
        `少的八万亩，都在襄王府、徐国公两家的名下。这两家，` +
        `在无锡的庄田，原本不过万亩。\n\n` +
        (zong
          ? `更可虑者：宗禄改折之后，各王府岁入骤减，收投献更急。` +
            `有王府遣人下乡，明言「献田者免役」，一旬之内，投献者三十余家。\n\n`
          : '') +
        `田既投献，粮无所出，则摊之于里甲。里甲赔累，则又投献。` +
        `此两年间，无锡一县，逃户三百余。\n\n` +
        `臣请严申投献之禁：凡投献者，田入官，本户充军；受献之家，罚禄。` +
        `然襄王、徐国公两家，皆在贵近，臣不敢擅问。伏乞圣裁。`,
      piaoni: '投献之弊，屡经言官奏及。着户部、都察院会议严禁。',
      secret:
        '这本是巡按御史递的，说得却极小心：他点了襄王与徐国公的名，' +
        '又补一句「臣不敢擅问」—— 把刀递上来，自己不沾血。',
      patience: 4,
      yiEffect: { metric: { minxin: -1 }, flags: { touxian: 1 } },
      ignoredEffect: { flags: { touxian: 2 }, metric: { minxin: -2, guanfeng: -1 } },
      options: [
        {
          key: 'strict',
          label: '遣御史按问，投献之田尽数入官',
          note: '一次查到底。得罪的是王府与勋贵',
          effect: {
            energy: -2,
            ledger: { taicang: 4 },
            metric: { guanfeng: 3, chaoshi: -3, minxin: 2 },
            flags: { touxian: -3, touxian_strict: 1 },
            log:
              '诏遣御史按问投献。无锡还田七万三千亩，襄王府罚禄一年，徐国公罚俸半年。' +
              '京中贵近，一时侧目。',
          },
        },
        {
          key: 'discuss',
          label: '下部议，令抚按查报',
          note: '照例的话：议了，报了，也就过去了',
          effect: {
            metric: { chaoshi: -1 },
            flags: { touxian: 1 },
            log: '投献之议下部。抚按查报了三个月，报上来的是「查无实据」。',
          },
        },
        {
          key: 'connive',
          label: '不问。令受献之家代纳一半',
          note: '眼前得一笔钱，往后田越来越少',
          effect: {
            ledger: { taicang: 6 },
            metric: { minxin: -3, guanfeng: -2 },
            flags: { touxian: 2, touxian_connived: 1 },
            log: '诏令受献之家代纳一半。襄王府认了，别家也认了 —— 认了之后，投献的人更多了。',
          },
        },
      ],
    }
  },
  {
    weight: 2,
    cooldown: 20,
    when: (s) =>
      (qzRunning(s) || on(s, 'yitiaobian') || on(s, 'zonglu') || on(s, 'xianfeng')) &&
      s.turn >= 8 &&
      level(s) < 12,
  },
)

/* ══════════════════════════ 成风之后 ══════════════════════════ */

export const touxianSpread = def(
  'touxian-spread',
  'urgent',
  (s) => ({
    from: '户部尚书',
    title: '为投献成风、版籍大坏、乞大索事',
    summary: `投献已及数省，册上之田与实征之田，差了三成。`,
    body:
      `臣谨奏：投献之弊，已不止一县一府。\n\n` +
      `臣以万历十年鱼鳞册与今岁实征册对勘：南直隶、浙江、江西三省，` +
      `册上田亩共二百一十万顷，实征者一百四十七万顷。差的六十三万顷，` +
      `十之七在王府、勋贵、乡宦的优免册里。\n\n` +
      `这些田，每年该纳银三十余万两。这三十余万两，如今摊在没投献的人身上。` +
      `于是不投献的，也只好投献。\n\n` +
      `臣请大索：凡优免册上之田，一律与鱼鳞册对勘；对不上的，田入官，` +
      `受献之家罚禄。此次大索，必得罪天下藩府、勋贵、乡宦 ——` +
      `臣一人当之，不辞。\n\n` +
      `太仓现存银${Math.round(s.taicang)}万。伏乞圣裁。`,
    piaoni: '大索之举，动摇者众。着九卿科道会议，务在可行。',
    secret:
      '户部尚书这一本，写「臣一人当之」，是因为他知道你不可能一个人当。' +
      '大索一旦办下去，第一个被参的，就是他。',
    patience: 3,
    yiEffect: { flags: { touxian: 1 }, metric: { chaoshi: -2 } },
    ignoredEffect: { flags: { touxian: 3 }, metric: { chaoshi: -4, minxin: -3 } },
    options: [
      {
        key: 'big',
        label: '准大索，三省同时对勘',
        note: '一次性把口子堵上，代价是所有既得利益者',
        effect: {
          energy: -3,
          ledger: { taicang: 10 },
          metric: { minxin: 6, guanfeng: 4, chaoshi: -6 },
          flags: { touxian: -5, touxian_great: 1 },
          log:
            '诏准大索，三省同时对勘优免册。还田四十一万顷，罚禄者七家。' +
            '数月之内，参户部尚书的弹章，堆了一尺。',
        },
      },
      {
        key: 'head',
        label: '只查首恶三家，以儆其余',
        note: '杀鸡儆猴。鸡会死，猴会看',
        effect: {
          ledger: { taicang: 5 },
          metric: { guanfeng: 2, chaoshi: -2 },
          flags: { touxian: -2, touxian_heads: 1 },
          log: '诏只查首恶三家。三家还田九万顷，其余各家把田契改了名。',
        },
      },
      {
        key: 'no',
        label: '不问。天下田赋，自有旧额',
        note: '不动，就还是这样',
        effect: {
          metric: { chaoshi: 2, minxin: -4 },
          flags: { touxian: 3 },
          log: '大索之议，不许。户部尚书告病。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 45,
    when: (s) => level(s) >= 5 && s.turn >= 16,
  },
)

export const TOUXIAN_TEMPLATES = [touxianOpen, touxianSpread]
