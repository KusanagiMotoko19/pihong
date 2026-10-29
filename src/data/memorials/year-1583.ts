import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 万历十一年（1583）。turn 18 — 53。
 *
 * 这一年的事：张居正被追论、抄家，考成法废，建州有个叫努尔哈赤的人
 * 拿十三副遗甲起了兵——朝中没人当回事。
 */

/* ══════════════════ 追论张居正 ══════════════════ */

export const y11Impeach = def(
  'y11-impeach',
  'impeach',
  () => ({
    from: '云南道监察御史 羊可立',
    title: '为追论故辅罪状、乞正国法事',
    summary: '张居正身后被论十四罪，首及「诬蔑亲藩、侵占王坟」。',
    body:
      `臣羊可立谨奏：故太师张居正，蒙先帝托孤之重，柄国十年。\n\n` +
      `臣谨按其罪之大者：一、诬蔑辽王，夺其府第，致辽王幽死；` +
      `二、侵占王府坟地，起建坊表；三、挟制言路，凡劾己者，` +
      `或杖或戍，前后二十余人。\n\n` +
      `夫居正之罪，非独一身。其家江陵，田连阡陌，宅第如宫。` +
      `臣请下诏夺其官爵，籍其家产，以正国法，以快人心。\n\n` +
      `臣知此言一出，必有以「死者已矣」相劝者。然死者已矣，` +
      `被其杖死、戍死的那二十几个人，也死了。`,
    piaoni: '张居正负朕委任，不思尽忠，反行僭窃。着都察院会同刑部议罪。',
    secret:
      '这道票拟是张四维拟的。他等这一天等了十年 —— 当年在张居正门下，' +
      '他跪着递过帖子。如今他坐在这张桌子后面。',
    patience: 3,
    yiEffect: { metric: { chaoshi: -6, guanfeng: -3 }, flags: { zhang_charged: 1 } },
    ignoredEffect: { metric: { chaoshi: 4 }, flags: { zhang_spared: 1 } },
    options: [
      {
        key: 'strip',
        label: '夺爵，籍其家',
        note: '顺水推舟。江陵那一家子，一个也跑不掉',
        effect: {
          metric: { chaoshi: -8, guanfeng: -4, minxin: 3 },
          ledger: { taicang: 12 },
          flags: { zhang_stripped: 1 },
        },
      },
      {
        key: 'postpone',
        label: '留中不发',
        note: '压下去。压得住一时，压不住一世',
        effect: { metric: { chaoshi: -3 }, backlog: 2, flags: { zhang_deferred: 1 } },
      },
      {
        key: 'limit',
        label: '只夺官爵，不籍家',
        note: '留一线。士林会说皇上仁厚',
        effect: {
          metric: { chaoshi: 3, guanfeng: 2 },
          flags: { zhang_limited: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y11', when: (s) => s.turn >= 20 },
)

/* ══════════════════ 抄家 ══════════════════ */

export const y11RaidHome = def(
  'y11-raid-home',
  'urgent',
  () => ({
    from: '司礼监太监 张诚',
    title: '为奉旨籍没张居正家产、谨具奏闻事',
    summary: '抄江陵张府，得银十万余两，长子敬修自缢。',
    body:
      `奴才张诚谨奏：奉旨会同刑部侍郎丘橓，前往荆州籍没张居正家产。\n\n` +
      `自四月至六月，封其门，禁出入。初报家产：黄金二千四百两，` +
      `白银十万七千余两，宅三所，田八顷。\n\n` +
      `其长子敬修，于六月十七日夜，自缢于狱中，留血书一纸，` +
      `曰：「父死无以自明，愿以一身当之。」\n\n` +
      `其家人十余口，饿毙于空宅者三。\n\n` +
      `奴才不敢隐。此产籍得之数，与科道所劾「百万」之数，相去甚远。`,
    piaoni: '知道了。',
    secret:
      '「知道了」三个字是皇上自己写的。写完，他把笔放下了很久。' +
      '十万两银子，一条人命，一个死人的名声 —— 这笔账，怎么算都不划算。',
    patience: 2,
    yiEffect: { ledger: { taicang: 10 }, metric: { chaoshi: -5, guanfeng: -3 } },
    ignoredEffect: { metric: { chaoshi: -2 } },
    options: [
      {
        key: 'stop',
        label: '止之。余产免追',
        note: '人已经死了，够了',
        effect: {
          metric: { minxin: 5, guanfeng: 4, chaoshi: 3 },
          ledger: { taicang: -6 },
          flags: { zhang_raid_stopped: 1 },
        },
      },
      {
        key: 'continue',
        label: '仍旧追比，务尽其产',
        note: '斩草除根。天下人看着',
        effect: {
          ledger: { taicang: 8 },
          metric: { chaoshi: -8, guanfeng: -5, minxin: -4 },
          flags: { zhang_raid_full: 1 },
        },
      },
      {
        key: 'pity',
        label: '留田八顷，以赡其母',
        note: '给张老太太留口饭吃',
        effect: {
          metric: { minxin: 3, chaoshi: 2 },
          flags: { zhang_pity: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y11b', when: (s) => s.turn >= 26 && !!s.flags.zhang_stripped },
)

/* ══════════════════ 建州 ══════════════════ */

export const y11Jianzhou = def(
  'y11-jianzhou',
  'routine',
  () => ({
    from: '辽东巡抚',
    title: '为建州夷酋聚众、边境不靖事',
    summary: '建州左卫都指挥使努尔哈赤以十三副遗甲起兵，攻尼堪外兰。',
    body:
      `臣谨奏：建州左卫都指挥使努尔哈赤，于今年五月起兵，攻图伦城。\n\n` +
      `其父塔失、祖觉昌安，往年为官军向导，死于兵。努尔哈赤年二十五，` +
      `以父祖遗甲十三副，聚众百人。\n\n` +
      `臣查其势：所部不过数百，据地不过一城。建州诸部素不相下，` +
      `此起彼伏，年年有之。此前苏克素护部王杲、王台，皆曾猖獗，` +
      `后皆为官军所灭。\n\n` +
      `臣以为，此亦一部酋耳。惟其言「恨尼堪外兰」，` +
      `而尼堪外兰者，是当年引官军杀其父祖之人 —— 若此人得势，` +
      `恐为后患。乞严饬边将，勿与通好。`,
    piaoni: '知道了。着辽东巡抚严加哨探，毋致疏虞。',
    secret:
      '这道票拟是申时行拟的。「毋致疏虞」四个字，是给兵部的场面话。' +
      '辽东的兵册上有八万，实有不到四万 —— 这件事，申时行知道，你也知道。',
    patience: 6,
    yiEffect: { metric: { bianfang: -1 } },
    ignoredEffect: { metric: { bianfang: -3 } },
    options: [
      {
        key: 'watch',
        label: '着边将严察，另遣人探其虚实',
        note: '花点钱，把这个人弄清楚',
        effect: {
          ledger: { taicang: -4 },
          metric: { bianfang: 3 },
          flags: { jianzhou_watched: 1 },
        },
      },
      {
        key: 'divide',
        label: '分其部落，扶叶赫以制之',
        note: '以夷制夷，老办法',
        effect: {
          ledger: { taicang: -8 },
          metric: { bianfang: 4, chaoshi: -1 },
          flags: { jianzhou_divide: 1 },
        },
      },
      {
        key: 'ignore',
        label: '一部酋耳，不必理会',
        note: '省下这笔钱。二十年后再说',
        effect: {},
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y11c', when: (s) => s.turn >= 30 },
)

/* ══════════════════ 京察 ══════════════════ */

export const y11Kaocha = def(
  'y11-kaocha',
  'personnel',
  (s: WorldState) => ({
    from: '吏部尚书',
    title: '为六年京察届期、请旨遵行事',
    summary: '六年京察到期，吏部请旨：严察还是宽察。',
    body:
      `臣谨奏：六年京察，例于辰、戌、丑、未年举行 —— 今年辛未，正届期。\n\n` +
      `京察者，察京官也。四品以上自陈，五品以下听吏部、都察院考察。` +
      `其目有八：贪、酷、浮躁、不及、老、病、罢、不谨。\n\n` +
      `臣请旨：此番京察，是照常例，还是加严？\n\n` +
      `照常例者，去者不过数十人，各衙门安堵。加严者，` +
      `则自张太师当国以来依附之人，多在其中 —— 那些人，` +
      `如今有的在吏部，有的在兵部，有的在通政司。\n\n` +
      `臣不敢自专。太仓现存${Math.round(s.taicang)}万，京察若严，` +
      `朝中必有一番波动，政务也要停一停。`,
    piaoni: '着吏部会同都察院，秉公考察。',
    secret:
      '这道票拟是张四维拟的。他要用京察清掉张居正的人 —— ' +
      '「秉公」三个字底下，是他自己那张名单。',
    patience: 4,
    yiEffect: { metric: { guanfeng: 3, chaoshi: -2 } },
    ignoredEffect: { metric: { guanfeng: -4 } },
    options: [
      {
        key: 'strict',
        label: '加严。凡附张居正者，尽去之',
        note: '一朝换血，官风会清一阵，朝局要乱一阵',
        effect: {
          metric: { guanfeng: 9, chaoshi: -10 },
          backlog: 5,
          flags: { kaocha_strict: 1 },
        },
      },
      {
        key: 'normal',
        label: '照常例',
        note: '去几十个人，各衙门安堵',
        effect: { metric: { guanfeng: +2 }, flags: { kaocha_normal: 1 } },
      },
      {
        key: 'soft',
        label: '宽之。此时不宜动大批人',
        note: '稳住了眼前，留下了积弊',
        effect: {
          metric: { guanfeng: -5, chaoshi: 4 },
          flags: { kaocha_soft: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y11d', when: (s) => s.turn >= 34 },
)

/* ══════════════════ 河工 ══════════════════ */

export const y11River = def(
  'y11-river',
  'project',
  () => ({
    from: '总理河道 潘季驯',
    title: '为河工垂成、乞发帑金、以竟全功事',
    summary: '高家堰将竣，尚需帑金二十四万两，否则前功尽弃。',
    body:
      `臣潘季驯谨奏：臣治河三年，所行之法，一曰「束水攻沙」，` +
      `二曰「蓄清刷黄」。\n\n` +
      `高家堰者，洪泽湖之东堤也。此堤一成，则淮水不出，` +
      `淮不出则黄不倒灌，黄不倒灌则运道可保。\n\n` +
      `今堤已筑至九分，尚余一堤之工，需帑金二十四万。` +
      `若此时停工，伏秋一至，前功尽弃，所费已七十万，尽付东流。\n\n` +
      `臣知太仓支绌。然河决一次，所费不止二十四万，` +
      `所溺不止一州县。臣请于漕粮改折银内先拨。`,
    piaoni: '着户部议发。',
    secret:
      '户部不会痛快给。这一笔钱从漕粮折银里出，等于从户部的口袋里掏 —— ' +
      '而户部尚书王国光，正是当年反对潘季驯那套办法的人。',
    patience: 3,
    yiEffect: { ledger: { taicang: -10 }, metric: { minxin: 3 } },
    ignoredEffect: { metric: { minxin: -8, bianfang: -2 } },
    options: [
      {
        key: 'pay',
        label: '发帑二十四万，竟其功',
        note: '一次给足，河工可成',
        effect: {
          ledger: { taicang: -24 },
          metric: { minxin: 10 },
          flags: { river_funded: 1 },
        },
      },
      {
        key: 'half',
        label: '先发十二万',
        note: '一半的钱，一半的工',
        effect: {
          ledger: { taicang: -12 },
          metric: { minxin: 2 },
          flags: { river_half: 1 },
        },
      },
      { key: 'no', label: '不许。国库拿不出', note: '', effect: { metric: { minxin: -4 } } },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y11e', when: (s) => s.turn >= 40 },
)

export const YEAR_1583 = [y11Impeach, y11RaidHome, y11Jianzhou, y11Kaocha, y11River]
