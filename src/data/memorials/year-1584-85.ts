import { def } from '../../engine/events'

/**
 * 万历十二年、十三年（1584—1585）。turn 54 — 125。
 *
 * 这两年表面平静：张居正的事办完了，京察办完了，朝中暂时没人大声说话。
 * 平静底下三件事在长：言路的人在换血、辽东的军屯在废、日本那边在调兵。
 */

/* ══════════════════ 万历十二年 ══════════════════ */

export const y12Hairui = def(
  'y12-hairui',
  'personnel',
  () => ({
    from: '吏部尚书',
    title: '为起用旧臣、乞简海瑞等事',
    summary: '海瑞年七十三，起为南京右都御史，朝野相庆，百官股栗。',
    body:
      `臣谨奏：海瑞，广东琼山人，年七十三。历任应天巡抚、南京吏部侍郎，` +
      `以直声闻天下。万历初为张居正所抑，闲居十余年。\n\n` +
      `今朝中言路渐开，廷臣多请起用旧人。海瑞之名，在荐牍中者十七次。\n\n` +
      `臣查其为人：清介绝俗，然亦刚而无容。昔抚应天，` +
      `下车甫两月，属吏墨者望风解印，豪强之家皆徙他郡。` +
      `民皆称之，而士大夫苦之。\n\n` +
      `臣请起为南京右都御史。此官闲，无实权，然天下观听所系。`,
    piaoni: '准。着即行取来京。',
    secret:
      '吏部荐他，不是要他用他，是要天下人看见「朝廷用清官」。' +
      '南京右都御史是个闲官——海瑞到了南京，能做的事，只有上疏。',
    patience: 5,
    yiEffect: { metric: { guanfeng: 4, chaoshi: 3 } },
    ignoredEffect: { metric: { guanfeng: -3 } },
    options: [
      {
        key: 'use',
        label: '起为南京右都御史',
        note: '清名归朝廷，麻烦归南京的官',
        effect: {
          metric: { guanfeng: 7, chaoshi: 2 },
          flags: { hairui_back: 1 },
        },
      },
      {
        key: 'real',
        label: '授以实职，令其整饬吏治',
        note: '真让他办事，官场要炸',
        effect: {
          metric: { guanfeng: 12, chaoshi: -8 },
          flags: { hairui_real: 1 },
        },
      },
      {
        key: 'no',
        label: '年老，不必起用',
        note: '省事。天下人会记着这一笔',
        effect: { metric: { guanfeng: -4 }, flags: { hairui_refused: 1 } },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y12', when: (s) => s.turn >= 58 },
)

export const y12SaltMerchant = def(
  'y12-salt',
  'routine',
  () => ({
    from: '两淮巡盐御史',
    title: '为盐引壅积、边储匮乏、乞改纲法事',
    summary: '两淮盐引壅积一百二十万道，商人不肯中，边储告竭。',
    body:
      `臣谨奏：两淮盐课，为天下盐课之半。今引壅积一百二十万道，` +
      `商人不肯中纳。\n\n` +
      `其故有三：一、势要占窝，以低价占引，转手高价卖与商人；` +
      `二、余盐私贩，官引之外，私盐十倍；三、守支日久，商人纳银之后，` +
      `守候支盐，有守至二三十年者。\n\n` +
      `臣请改行纲法：以商人所纳边粮，编为纲册，世守其业。` +
      `旧引悉停，新引按纲配销。如此，则势要不能占窝，商人肯出本钱。\n\n` +
      `惟此事关乎两淮数十万家商贾，亦关乎各边镇的粮储。`,
    piaoni: '着户部议。',
    secret:
      '「势要占窝」这四个字，占了朝中几家。武清侯家、英国公家，都在两淮有引。' +
      '改纲法，等于把他们的摇钱树砍了。',
    patience: 5,
    yiEffect: { ledger: { taicang: 6 } },
    ignoredEffect: { metric: { bianfang: -3 } },
    options: [
      {
        key: 'reform',
        label: '改纲法，清占窝',
        note: '边储能缓，几家勋贵要记恨',
        effect: {
          ledger: { taicang: 18 },
          metric: { bianfang: 4, chaoshi: -6, guanfeng: -2 },
          flags: { salt_gang: 1 },
        },
      },
      {
        key: 'status',
        label: '照旧。只惩一两个占窝的',
        note: '打一只鸡给猴看',
        effect: {
          ledger: { taicang: 5 },
          metric: { chaoshi: -2, guanfeng: 2 },
          flags: { salt_status: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y12b', when: (s) => s.turn >= 68 },
)

export const y12Altan = def(
  'y12-altan',
  'routine',
  () => ({
    from: '宣大总督 郑洛',
    title: '为虏酋请封、乞赐敕书事',
    summary: '三娘子遣使请封「忠顺夫人」，并请增马市额。',
    body:
      `臣谨奏：顺义王俺答已老，其妻三娘子主部事。\n\n` +
      `三娘子遣使至边，请三事：一、封「忠顺夫人」，赐敕书；` +
      `二、增马市额，每年加马二千匹；三、请给部众布帛、铁锅。\n\n` +
      `臣查：自隆庆五年封贡以来，宣大无边警十三年。马市所入，` +
      `每岁易马五千匹，皆堪用。此三事若准，边上可再安十年。\n\n` +
      `惟铁锅一事，部议以为不可。铁可铸兵，往年有禁。` +
      `然臣观虏中，釜破无以炊，往往铤而走险。`,
    piaoni: '着礼部、兵部会议。',
    secret:
      '铁锅这件事，兵部咬得很死。可宣大总督知道：' +
      '去年冬天，口外部落为了几口锅，抢了三个边堡。',
    patience: 6,
    yiEffect: { metric: { bianfang: 3 } },
    ignoredEffect: { metric: { bianfang: -4 } },
    options: [
      {
        key: 'all',
        label: '三事皆准',
        note: '边安十年，铁锅一开，后患自担',
        effect: {
          metric: { bianfang: 8, minxin: 2 },
          ledger: { taicang: -6 },
          flags: { altan_all: 1 },
        },
      },
      {
        key: 'title',
        label: '只封夫人，市额与铁锅不许',
        note: '给名分不给实惠',
        effect: { metric: { bianfang: 2 }, flags: { altan_title: 1 } },
      },
      {
        key: 'no',
        label: '一概不许。夷情难测',
        note: '',
        effect: { metric: { bianfang: -6 }, flags: { altan_refused: 1 } },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y12c', when: (s) => s.turn >= 76 },
)

/* ══════════════════ 万历十三年 ══════════════════ */

export const y13Drought = def(
  'y13-drought',
  'urgent',
  () => ({
    from: '顺天府尹 徐元太',
    title: '为京畿大旱、民不聊生、乞赐赈济事',
    summary: '京畿自春不雨，麦尽枯，饥民流入京师者日以千计。',
    body:
      `臣谨奏：京畿自二月不雨，至五月，麦尽枯，秋禾不能下种。\n\n` +
      `顺天、保定、河间三府，饥民流入京师者，日以千计。` +
      `城外粥厂三处，日给米三十石，尚不能遍。\n\n` +
      `臣查太仓现存之数，可支者有限。然京师重地，` +
      `饥民聚于城外，恐生他变。\n\n` +
      `臣请发太仓米五万石，设粥厂十处，并乞免三府今年秋粮之半。`,
    piaoni: '着户部发米赈济，仍免三府秋粮三分。',
    secret:
      '户部会拖。拖到秋天，如果下了雨，这事就过去了；' +
      '如果没下，粮价会自己教他们怎么办。',
    patience: 2,
    yiEffect: { ledger: { taicang: -6 }, metric: { minxin: 5 } },
    ignoredEffect: { metric: { minxin: -12, chaoshi: -5 } },
    options: [
      {
        key: 'full',
        label: '发米五万石，免秋粮之半',
        note: '花大钱，稳京师',
        effect: {
          ledger: { taicang: -20 },
          metric: { minxin: 12, chaoshi: 3 },
          flags: { drought_relief: 1 },
        },
      },
      {
        key: 'half',
        label: '发米二万石，免三分之一',
        note: '折中。饿死的人会少一些',
        effect: {
          ledger: { taicang: -9 },
          metric: { minxin: 5 },
          flags: { drought_half: 1 },
        },
      },
      {
        key: 'pray',
        label: '斋戒祷雨，免粮不发',
        note: '求天。天不下雨，就是天的事',
        effect: {
          metric: { minxin: -8, chaoshi: -3 },
          flags: { drought_pray: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y13', when: (s) => s.turn >= 96 },
)

export const y13Purge = def(
  'y13-purge',
  'impeach',
  () => ({
    from: '南京吏部主事 顾宪成',
    title: '为京察不公、乞赐昭雪事',
    summary: '京察被黜者百余人鸣冤，顾宪成上疏直指吏部挟私。',
    body:
      `臣顾宪成谨奏：去年京察，臣不在被黜之列。然臣所见，有不能不言者。\n\n` +
      `此番京察，去者一百三十七人。其中确系贪酷者不过三十余人，` +
      `其余或「浮躁」、或「不及」、或「不谨」——此皆虚目，可予可夺。\n\n` +
      `臣闻其中有张某者，以不附执政，坐「浮躁」去；` +
      `李某者，以曾劾执政之门人，坐「不谨」去。\n\n` +
      `京察者，朝廷所以甄别人才，非执政所以报怨。` +
      `今以一人之喜怒，定百人之去留，臣恐此后无人敢言。\n\n` +
      `臣愿与吏部诸臣，当廷对质。`,
    piaoni: '顾宪成出位妄言，着罚俸一年。',
    secret:
      '这道票拟是张四维拟的。他没敢加重罪 —— 顾宪成是有名的，' +
      '罚俸一年，既堵了他的嘴，又不至于闹大。',
    patience: 3,
    yiEffect: { metric: { chaoshi: -3, guanfeng: 2 } },
    ignoredEffect: { metric: { guanfeng: -4, chaoshi: -5 } },
    options: [
      {
        key: 'recheck',
        label: '命都察院覆核京察',
        note: '翻案。吏部要难看，言路要叫好',
        effect: {
          metric: { guanfeng: 8, chaoshi: -6 },
          flags: { kaocha_recheck: 1 },
        },
      },
      {
        key: 'punish',
        label: '罚俸一年，照旧',
        note: '压下去。压一次，下次要压得更重',
        effect: {
          metric: { chaoshi: -4, guanfeng: -2 },
          flags: { kaocha_punish: 1 },
        },
      },
      {
        key: 'promote',
        label: '召顾宪成入京，授吏部主事',
        note: '把骂你的人放在人事口上',
        effect: {
          metric: { guanfeng: 6, chaoshi: 4 },
          flags: { guxiancheng_promoted: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y13b', when: (s) => s.turn >= 104 && (!!s.flags.kaocha_strict || !!s.flags.kaocha_punish) },
)

export const y13Liaodong = def(
  'y13-liaodong',
  'routine',
  () => ({
    from: '辽东巡抚',
    title: '为辽东屯田尽废、边储仰给内地事',
    summary: '辽东屯田原额五万顷，今存者不足八千，粮尽仰给山东。',
    body:
      `臣谨奏：辽东屯田，洪武原额五万七千顷，今存者七千八百顷。\n\n` +
      `其废之故：一、屯军逃亡，册上有名，实地无人；` +
      `二、将官占屯，以屯田为私产，役军如佃户；` +
      `三、边外侵扰，近边之田不能耕种。\n\n` +
      `今辽东一镇，岁需粮三十万石，本地所出不足八万，` +
      `余皆仰给山东海运、登莱拨运。海运一石，费银三钱，` +
      `是辽东一石之粮，内地三石之价。\n\n` +
      `臣请清查屯田，凡将官侵占者，尽数退出。此事关涉将领数十人。`,
    piaoni: '着辽东巡抚会同户部清查。',
    secret:
      '辽东的将领，有一半的家丁是靠占屯养的。清屯，等于断他们的活路——' +
      '而这些人，正是打仗时你唯一能用的兵。',
    patience: 5,
    yiEffect: { ledger: { taicang: 4 }, metric: { bianfang: 2 } },
    ignoredEffect: { metric: { bianfang: -5 }, ledger: { taicang: -5 } },
    options: [
      {
        key: 'clean',
        label: '严查侵占，尽数退出',
        note: '屯田能回一些，边将要离心',
        effect: {
          ledger: { taicang: 12 },
          metric: { bianfang: -4, guanfeng: 5 },
          flags: { liaodong_clean: 1 },
        },
      },
      {
        key: 'slow',
        label: '先查不究，令其自首',
        note: '给台阶。多半没人下',
        effect: { ledger: { taicang: 4 }, metric: { bianfang: 1 }, flags: { liaodong_slow: 1 } },
      },
      {
        key: 'ship',
        label: '不必清屯，改海运以省脚价',
        note: '绕开将领，从路上省钱',
        effect: { ledger: { taicang: -8 }, metric: { bianfang: 4 }, flags: { liaodong_shipping: 1 } },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y13c', when: (s) => s.turn >= 112 },
)

export const YEAR_1584_85 = [y12Hairui, y12SaltMerchant, y12Altan, y13Drought, y13Purge, y13Liaodong]
