import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 律令的反弹。
 *
 * 立一条法，不是签个字就完了。它会立刻长出一批新的奏疏 ——
 * 有人因为这条法得利，有人因为这条法受损，两边都会递本子上来。
 *
 * 这是本作里「制度」与「奏疏」之间唯一的桥：
 * 你动的不是数值，是一群人的利害。
 */

const on = (s: WorldState, id: string) => !!s.statutes[id]
const off = (s: WorldState, id: string) => !s.statutes[id]

/* ══════════════════════════ 考成法被废之后 ══════════════════════════ */

export const kcAbolishedPay = def(
  'kc-abolished-pay',
  'urgent',
  (s: WorldState) => ({
    from: '户部尚书',
    title: '为逋欠骤增、国用告急事',
    summary: '考成既罢，各省拖欠半年之内增至一百八十万。',
    body:
      `臣谨奏：自《考成法》罢后，各省逋欠骤增。\n\n` +
      `上半年报部者，山东欠三十一万，河南欠二十七万，南直隶欠四十二万，` +
      `合各省计之，已一百八十余万。去年这个时候，是七十六万。\n\n` +
      `臣细查其故：非百姓不纳，是州县不催。州县何以不催？` +
      `从前完不成要降级，如今完不成只罚俸。罚俸一年，不过二十两。\n\n` +
      `臣不敢请复考成 —— 朝中正以「苛」字攻之。然太仓现在只余${Math.round(s.taicang)}万，` +
      `九边的年例还欠着一半。这笔账，总要有人认。`,
    piaoni: '着户部严饬各抚按，照旧例催征。',
    secret:
      '这道票拟是张四维拟的。他既要废考成，又要催征，两头都要占。' +
      '「照旧例」三个字最妙——旧例就是没有考成的旧例。',
    patience: 3,
    yiEffect: { ledger: { taicang: 12 }, metric: { chaoshi: -2 } },
    ignoredEffect: { ledger: { taicang: -8 }, metric: { minxin: -3 } },
    options: [
      {
        key: 'restore',
        label: '复考成，只宽一分',
        note: '把「降三级」改为「降一级」，其余照旧',
        effect: {
          ledger: { taicang: 22 },
          metric: { guanfeng: -4, chaoshi: -5, minxin: -2 },
          flags: { kc_half_restored: 1 },
        },
      },
      {
        key: 'borrow',
        label: '向南京户部、太仆寺挪借',
        note: '先过了今年，明年的账明年再说',
        effect: { ledger: { taicang: 26, taipu: -30 }, metric: { chaoshi: 2 } },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-kc',
    when: (s) => off(s, 'kaocheng') && s.turn >= 8,
    sets: ['kc_abolished_reported'],
  },
)

/* ══════════════════════════ 一条鞭法推行之后 ══════════════════════════ */

export const ytbJiangnan = def(
  'ytb-jiangnan',
  'urgent',
  () => ({
    from: '应天巡抚',
    title: '为江南赋重、民力不堪、乞赐酌议事',
    summary: '一条鞭行于江南三月，苏松常镇四府士绅联名请缓。',
    body:
      `臣谨奏：一条鞭法行于苏松常镇四府，三月于兹。\n\n` +
      `法本身是好的：赋役归并，计亩征银，胥吏不能飞洒，小民不受包揽之累。` +
      `臣在任所见，里甲之弊，去其大半。\n\n` +
      `然有一事不能不奏：四府田赋甲于天下，一亩之入，不敷一亩之税。` +
      `往时纳本色，尚可挪借；今改折银，秋成之日必须卖谷换银，` +
      `谷贱银贵，一石只换得三钱。\n\n` +
      `今有华亭、上海、武进三县士绅联名具呈，乞将折银之数，每两减一钱。` +
      `联名者二百四十七人，其中进士出身者三十一人。\n\n` +
      `臣不敢代为请，亦不敢壅于上闻。`,
    piaoni: '着户部查议。',
    secret:
      '这二百四十七人里，有十九个是张四维的门生。他们不是替百姓请，' +
      '是替自家的田请——折银折得越少，他们交得越少。',
    patience: 4,
    yiEffect: { ledger: { taicang: 8 }, metric: { minxin: -3 } },
    ignoredEffect: { metric: { minxin: -5, guanfeng: -2 } },
    options: [
      {
        key: 'cut',
        label: '准减一钱，以示宽恤',
        note: '江南人心得，太仓少收',
        effect: {
          ledger: { taicang: -18 },
          metric: { minxin: 6, chaoshi: 3 },
          flags: { ytb_jiangnan_cut: 1 },
        },
      },
      {
        key: 'hold',
        label: '不许。法已立，不容再议',
        note: '寸步不让，看谁先撑不住',
        effect: {
          ledger: { taicang: 10 },
          metric: { chaoshi: -4, guanfeng: -2 },
          flags: { ytb_jiangnan_hold: 1 },
        },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-ytb',
    when: (s) => on(s, 'yitiaobian') && s.turn >= 14,
  },
)

/* ══════════════════════════ 开海之后 ══════════════════════════ */

export const khPirate = def(
  'kh-pirate',
  'urgent',
  () => ({
    from: '福建巡抚',
    title: '为海氛不靖、乞严守御事',
    summary: '月港开关半载，商船日多，海寇亦混迹其中。',
    body:
      `臣谨奏：月港开关以来，出海商船月增数十。关税所入，` +
      `半年已得银二万三千两，是往年海禁时所无。\n\n` +
      `然有可虑者：商船既多，海寇亦混杂其中。` +
      `真倭已少，多是漳泉之人，挟倭为名，聚众劫掠。` +
      `前月南澳一役，官军追之，贼船反手就打，船比我们的快。\n\n` +
      `臣请于月港设水寨，募兵三千，岁需饷银六万。` +
      `或者仍旧禁海，则此患自消 —— 只是那二万三千两的税，也没有了。`,
    piaoni: '着福建巡抚相机剿抚，兵部知道。',
    secret:
      '这道票拟把「相机」两个字用得很好——相机就是没有定策。' +
      '福建的兵，一半在卫所册子上，一半在将领的家丁里，真打起来不知道能调出多少人。',
    patience: 4,
    yiEffect: { metric: { bianfang: -2 }, ledger: { taicang: 3 } },
    ignoredEffect: { metric: { bianfang: -7, minxin: -4 } },
    options: [
      {
        key: 'navy',
        label: '设水寨，募兵三千',
        note: '岁费六万，海防才立得住',
        effect: {
          ledger: { taicang: -30 },
          metric: { bianfang: 8 },
          flags: { kh_navy: 1 },
        },
      },
      {
        key: 'close',
        label: '复禁海',
        note: '一了百了，但税也没了',
        effect: {
          statutes: { kaihai: false },
          metric: { bianfang: 4, minxin: -4, chaoshi: 3 },
        },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-kh',
    when: (s) => on(s, 'kaihai') && s.turn >= 20,
  },
)

export const khEunuchTax = def(
  'kh-eunuch-tax',
  'project',
  () => ({
    from: '福建市舶太监 高寀',
    title: '为市舶税务、乞归内监管理事',
    summary: '市舶太监请将月港关税改由内监征收，径解内帑。',
    body:
      `奴才谨奏：月港关税，现由福建布政司征收，解户部。\n\n` +
      `奴才在闽三年，见税关之弊：商船报关，胥吏索费，一船之税，` +
      `入官者不过六成，余四成尽入私囊。此非独闽中，天下税关皆然。\n\n` +
      `奴才请将此项改归内监征收，岁解内帑。奴才不敢多取，` +
      `只照旧额征足，则一年可多解银八千两 —— 这八千两，是胥吏吞掉的那些。\n\n` +
      `伏乞圣裁。`,
    piaoni: '着户部与福建抚按会议。',
    secret:
      '他说「不敢多取」，可内监办税从没有只取旧额的。' +
      '这八千两是饵，钓的是往后每年十几万。',
    patience: 5,
    yiEffect: { ledger: { taicang: 4 } },
    ignoredEffect: {},
    options: [
      {
        key: 'give',
        label: '准归内监',
        note: '内帑多，户部少，外廷要闹',
        effect: {
          ledger: { neitang: 14, taicang: -10 },
          metric: { guanfeng: -4, chaoshi: -3 },
          flags: { tax_to_eunuch: 1 },
        },
      },
      {
        key: 'keep',
        label: '照旧归布政司',
        note: '胥吏吞四成，但账在户部',
        effect: { metric: { chaoshi: 2 }, flags: { tax_to_eunuch: 0 } },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-kh2',
    when: (s) => on(s, 'kaihai') && s.turn >= 26,
  },
)

/* ══════════════════════════ 宗禄折色之后 ══════════════════════════ */

export const zlPrince = def(
  'zl-prince',
  'urgent',
  () => ({
    from: '襄王（藩府）',
    title: '为宗禄折色、王府用度不敷、乞赐矜悯事',
    summary: '宗禄改折银后，襄王府岁入减三成，王上疏泣诉。',
    body:
      `臣（襄王）谨奏：臣府岁支禄米二万一千石，自改折银之后，` +
      `每石折银五钱，是岁得银一万零五百两。\n\n` +
      `往时本色，米价每石七钱，是臣府岁入实一万四千七百两；` +
      `今折五钱，是每岁少了四千二百两。此四千二百两者，` +
      `是臣府三百余口人的口粮、府中仪仗、祭祀、修缮之费。\n\n` +
      `臣不敢怨朝廷。然臣闻河南一省岁入二百八十万石，宗禄需二百四十万石 —— ` +
      `朝廷亦有朝廷的难处。\n\n` +
      `臣只求一事：臣府禄米，仍支本色，其余各府照折。臣愿以身当这个不是。`,
    piaoni: '着宗人府、户部会议。',
    secret:
      '襄王这一本写得极聪明：他不争「都别折」，只争「我除外」。' +
      '若准了他，其余二十几个王府明天就都递本子。',
    patience: 3,
    yiEffect: { ledger: { taicang: 5 }, metric: { chaoshi: -2 } },
    ignoredEffect: { metric: { chaoshi: -6 } },
    options: [
      {
        key: 'exception',
        label: '准襄府支本色',
        note: '一个人开了口子，二十几个人跟着来',
        effect: {
          ledger: { taicang: -10 },
          metric: { chaoshi: 3 },
          flags: { zonglu_exception: 1 },
        },
      },
      {
        key: 'refuse',
        label: '不许。法一立，王与庶人同',
        note: '硬顶，宗室要记恨',
        effect: {
          metric: { chaoshi: -5, guanfeng: 3 },
          flags: { zonglu_refused: 1 },
        },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-zl',
    when: (s) => on(s, 'zonglu') && s.turn >= 16,
  },
)

/* ══════════════════════════ 矿税之后 ══════════════════════════ */

export const ksRiot = def(
  'ks-riot',
  'urgent',
  () => ({
    from: '湖广巡抚',
    title: '为矿徒聚众、地方汹汹事',
    summary: '内监开矿，掘及民田庐墓，武昌、汉阳聚众数千。',
    body:
      `臣谨奏：内官监奉旨开矿，于武昌、汉阳二府掘矿三十七处。\n\n` +
      `初时尚可，所掘多在荒山。至五月，掘及民田，` +
      `又掘及民坟 —— 江夏县民某氏祖坟被掘，棺已见，其族聚二百人持械相拒，` +
      `内监随行之人伤者七。\n\n` +
      `今两府聚众已数千，有「逐矿使」之谣。臣调兵三百弹压，` +
      `兵亦不肯前 —— 那些兵，也是本地人。\n\n` +
      `臣请暂罢矿税，以息众怒。若必开，乞先禁掘坟、禁占田。`,
    piaoni: '着内官监严饬，毋得扰民。',
    secret:
      '这道票拟是司礼监代批的。陈矩写「严饬」二字时，' +
      '笔尖顿了一下——他知道这两个字对矿使毫无约束。',
    patience: 2,
    yiEffect: { metric: { minxin: -3 }, ledger: { neitang: 3 } },
    ignoredEffect: { metric: { minxin: -12, chaoshi: -6 }, ledger: { neitang: 5 } },
    options: [
      {
        key: 'stop',
        label: '罢矿税',
        note: '内帑断了一项进项，民心回来一些',
        effect: {
          statutes: { kuangshui: false },
          metric: { minxin: 8, chaoshi: 2 },
          flags: { mine_stopped: 1 },
        },
      },
      {
        key: 'restrict',
        label: '只许掘荒山，禁及田墓',
        note: '折中。矿使照旧有借口',
        effect: {
          metric: { minxin: 3 },
          ledger: { neitang: -4 },
          flags: { mine_restricted: 1 },
        },
      },
      {
        key: 'suppress',
        label: '调兵弹压，矿税照旧',
        note: '压得下去。压下去之后呢',
        effect: {
          metric: { minxin: -10, chaoshi: -4, guanfeng: -3 },
          ledger: { neitang: 8 },
          flags: { mine_suppressed: 1 },
        },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-ks',
    when: (s) => on(s, 'kuangshui') && s.turn >= 24,
  },
)

/* ══════════════════════════ 廷杖之后 ══════════════════════════ */

export const tzSilence = def(
  'tz-silence',
  'routine',
  () => ({
    from: '吏部尚书',
    title: '为言路壅塞、科道缺员、乞赐简补事',
    summary: '廷杖之后，六科给事中缺员过半，无人敢补。',
    body:
      `臣谨奏：六科给事中额设五十八员，今在任者二十四员。\n\n` +
      `缺员之故，非无才可选 —— 是无人肯来。` +
      `前月廷杖三人，一人死于杖下，二人削籍为民。` +
      `科道之职，本是「言事」；今言事者死，谁还肯做这个官？\n\n` +
      `臣曾以三人名上，三人皆辞。内一人回书曰：「家有老母，不敢以身试杖。」\n\n` +
      `言路无人，则天下之弊，无人上闻。此非臣之私忧。`,
    piaoni: '着吏部另行拣选。',
    secret:
      '这本是谁递的？——是司礼监让吏部递的。' +
      '张诚想让皇上知道：杖打完，没人说话了，连坏事也没人报了。',
    patience: 5,
    yiEffect: { metric: { chaoshi: -2 } },
    ignoredEffect: { metric: { chaoshi: -5, guanfeng: -3 }, backlog: 6 },
    options: [
      {
        key: 'pardon',
        label: '起复被杖诸臣',
        note: '认个错。士林会记这一笔',
        effect: {
          metric: { chaoshi: 9, guanfeng: 4 },
          flags: { tz_pardoned: 1 },
        },
      },
      {
        key: 'fill',
        label: '另择温顺者补足',
        note: '有人说话了，说的都是好话',
        effect: {
          metric: { chaoshi: -3 },
          backlog: -4,
          flags: { tz_filled: 1 },
        },
      },
    ],
  }),
  {
    weight: 0,
    cooldown: 999,
    line: 'st-tz',
    when: (s) => on(s, 'tingzhang') && s.turn >= 12,
  },
)
