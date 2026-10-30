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

/* ══════════════════════════════════════════════════════════════════ *
 * 法是怎么被提出来的
 *
 * 律令不是菜单上随便点的一道菜。得先有人吃亏、有人看不过去，
 * 把这件事写成本子递上来 —— 然后你才知道有这么一条路可以走。
 * 没有这几本，律令页上看不见那条法。
 * ══════════════════════════════════════════════════════════════════ */

export const openYitiao = def(
  'open-ytb',
  'routine',
  () => ({
    from: '应天巡抚',
    title: '为赋役繁杂、里甲赔累、乞行归并事',
    summary: '南直隶一州县赋役名目三十余种，里甲赔累，请归并计亩征银。',
    body:
      `臣谨奏：南直隶赋役之弊，至今而极。\n\n` +
      `一州县之内，赋有本色、折色、存留、起运；役有里甲、均徭、杂泛、驿传。` +
      `名目三十余种，而小民所知者，只有「交多少」一句。\n\n` +
      `胥吏因缘为奸：飞洒者，以己之田分寄他人；诡寄者，以田寄于举人、生员名下；` +
      `包揽者，代纳而倍取其息。里甲十年一轮，轮到的倾家；轮不到的，出银买免。\n\n` +
      `臣查苏州一府，额田九万顷，册上完粮者不过六万顷。其余三万顷，` +
      `不在水，不在沙，在乡绅的「优免」两个字里。\n\n` +
      `若将一州县赋役，量地计丁，并为一条，概以银输官，则胥吏无所措手。` +
      `此法江西、浙江已有行者，臣请于南直隶试行。\n\n` +
      `伏乞圣裁。`,
    piaoni: '着户部覆议，令抚按详具条目以闻。',
    secret:
      '这本是应天巡抚自己写的，也是他自己想推的。' +
      '推成之后，江南的钱粮从他手里过，说话的分量就不一样了。',
    patience: 5,
    yiEffect: { metric: { chaoshi: 1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，令抚按详具条目',
        note: '把「一条鞭」三个字摆到朝上',
        effect: {
          metric: { chaoshi: 2 },
          flags: { open_yitiaobian: 1 },
          log: '诏下部议一条鞭法。江南士绅闻之，多有异言。',
        },
      },
      {
        key: 'slow',
        label: '姑缓之，待清丈告竣再说',
        note: '地亩还没核清，改赋役是白改',
        effect: { metric: { chaoshi: -1 }, log: '一条鞭之议，暂缓。' },
      },
    ],
  }),
  {
    // 走日常进本，不占叙事线的名额：这是议题，不是剧本
    weight: 3,
    cooldown: 55,
    when: (s) => !on(s, 'yitiaobian') && s.turn >= 3,
    forbids: ['open_yitiaobian'],
  },
)

export const openKaihai = def(
  'open-kh',
  'routine',
  () => ({
    from: '福建巡抚',
    title: '为海禁日久、私贩公行、乞开月港事',
    summary: '海禁禁了二百年，禁出的是私贩，不是海船。请开月港，给引抽税。',
    body:
      `臣谨奏：闽中海禁，行二百年矣。然海未尝一日无人。\n\n` +
      `漳州月港，私贩之船，岁不下三百。贩东西两洋，一船之利，可抵中人之产十家。` +
      `禁之而不得禁，徒使奸民持官府之短，胥吏分其利。\n\n` +
      `前年海道副使捕得私贩二十七船，尽没人官。船主皆漳泉大姓，` +
      `其族人现在朝中为官者，有四。捕而未办，拖至今。\n\n` +
      `臣请于月港开关：商民造船出海，官给引，抽其税。税入岁可得数万，` +
      `而私贩之利，转在官。卫所不得擅拦，违者以枉法论。\n\n` +
      `此事关祖宗之法，臣不敢专，伏乞圣裁。`,
    piaoni: '着户部、兵部会议。',
    secret:
      '福建的卫所军官，一半的进项来自「查私」——查一条船，收一份钱。' +
      '开了关，这笔钱就断了。所以第一个反对开海的，不会是言官，是水寨里的把总。',
    patience: 4,
    yiEffect: { metric: { chaoshi: -1 } },
    options: [
      {
        key: 'open',
        label: '着会议，许其开',
        note: '祖宗之法，也要吃饭',
        effect: {
          metric: { bianfang: -1, minxin: 2 },
          flags: { open_kaihai: 1 },
          log: '诏议开月港。福建水寨把总联名上书，言「海防自此坏矣」。',
        },
      },
      {
        key: 'close',
        label: '仍旧禁海，严拿私贩',
        note: '守住祖制，也守住那三百条船的利',
        effect: { metric: { bianfang: 1, minxin: -2 }, log: '诏仍旧禁海。私贩如故。' },
      },
    ],
  }),
  {
    // 走日常进本，不占叙事线的名额：这是议题，不是剧本
    weight: 3,
    cooldown: 55,
    when: (s) => !on(s, 'kaihai') && s.turn >= 4,
    forbids: ['open_kaihai'],
  },
)

export const openZonglu = def(
  'open-zl',
  'routine',
  () => ({
    from: '山西巡抚',
    title: '为宗禄不给、岁支不敷、乞议折色事',
    summary: '山西一省钱粮，宗禄占其大半；各王府禄米仍支本色，州县无以为继。',
    body:
      `臣谨奏：山西一省钱粮，岁入二百八十万石，宗禄一项，需二百四十万石。\n\n` +
      `晋府、代府、沈府三王，岁支禄米各以万石计；郡王、将军、中尉以下，` +
      `在册者三千余人，其支本色者，尚有一千二百。\n\n` +
      `臣到任三年，藩司库中，常不能给。前月代府以禄米不至，遣人至布政司坐索，` +
      `吏不敢出。此事若传至京，臣不敢料其终。\n\n` +
      `今各王府禄米，若一律改折银两，每石折银五钱，则一岁所省，不下十万。` +
      `然此非臣所敢议 —— 宗室之禄，是太祖高皇帝定的。\n\n` +
      `伏乞圣裁。`,
    piaoni: '着宗人府、户部会议具奏。',
    secret:
      '山西巡抚这一本，是替户部递的。' +
      '户部这些年替宗禄填了不知多少窟窿，只是没人敢把「改折」两个字写在纸上。',
    patience: 4,
    yiEffect: { ledger: { taicang: 3 }, metric: { chaoshi: -2 } },
    options: [
      {
        key: 'discuss',
        label: '着会议，准改折',
        note: '动了太祖的旧例，等于动了半个皇族',
        effect: {
          metric: { chaoshi: -3, guanfeng: 2 },
          flags: { open_zonglu: 1 },
          log: '诏议宗禄折色。宗人府奏：「祖制不可轻改。」',
        },
      },
      {
        key: 'hold',
        label: '暂缓。宗室的事，不能由外臣议',
        note: '省一笔麻烦，留一笔账',
        effect: { ledger: { taicang: -4 }, log: '宗禄之议，暂缓。藩司库中又空了一次。' },
      },
    ],
  }),
  {
    // 走日常进本，不占叙事线的名额：这是议题，不是剧本
    weight: 3,
    cooldown: 55,
    when: (s) => !on(s, 'zonglu') && s.turn >= 6,
    forbids: ['open_zonglu'],
  },
)

export const openKuangshui = def(
  'open-ks',
  'routine',
  (s) => ({
    from: '内官监太监',
    title: '为帑藏告匮、乞开矿抽税事',
    summary: `太仓见底、内帑不足，奴才请开天下矿脉，抽分径解内帑。`,
    body:
      `奴才谨奏：今太仓所存，不过${Math.round(s.taicang)}万；内帑${Math.round(s.neitang)}万。` +
      `九边的年例，下半年的一文未发；百官俸禄，已经欠了两个月。\n\n` +
      `奴才查得：天下矿脉，山西、陕西、河南、湖广、云南皆有。` +
      `往年禁民私采，而私采者未尝绝 —— 与其听奸民窃取，不若官为抽分。\n\n` +
      `若遣内官分赴各省监矿，岁可得银数十万，径解内帑，不经户部。` +
      `户部那些人不肯办，奴才肯办。\n\n` +
      `只是有一节：矿脉所在，多在山田之间；开掘所至，必及民间田墓。` +
      `地方官必不肯，生员必鼓噪，百姓未必肯让。此事奴才不敢欺瞒。\n\n` +
      `伏乞圣裁。`,
    piaoni: '开矿一事，祖宗朝屡有言者，然未见其利，先见其害。请旨裁夺。',
    secret:
      '这本是内官监递的，说话的却是司礼监。' +
      '「径解内帑」四个字，是他们真正想要的东西 —— 钱不进户部的账，就不入外廷的眼。',
    patience: 3,
    yiEffect: { metric: { guanfeng: -2, minxin: -2 } },
    options: [
      {
        key: 'open',
        label: '着内官分赴各省监矿',
        note: '内帑有进项了，地方要出人命',
        effect: {
          ledger: { neitang: 8 },
          metric: { minxin: -6, guanfeng: -4, chaoshi: -3 },
          flags: { open_kuangshui: 1 },
          log: '诏遣内官监矿。各省抚按即时上疏，言「矿使所至，鸡犬不宁」。',
        },
      },
      {
        key: 'hold',
        label: '不许。另议节用',
        note: '宁可穷一点，不要这条口子',
        effect: { metric: { chaoshi: 2, minxin: 2 }, log: '开矿之议，不许。' },
      },
    ],
  }),
  {
    // 走日常进本，不占叙事线的名额：这是议题，不是剧本
    weight: 3,
    cooldown: 55,
    when: (s) => !on(s, 'kuangshui') && s.turn >= 10 && (s.taicang < 160 || s.neitang < 130),
    forbids: ['open_kuangshui'],
  },
)

export const openTingzhang = def(
  'open-tz',
  'routine',
  () => ({
    from: '都察院左都御史',
    title: '为言路纷争、纲纪不肃、乞赐处分事',
    summary: '科道连章攻讦，一事十疏，朝堂之上已无议事之序。',
    body:
      `臣谨奏：近者科道诸臣，一事而十疏，一疏而十辩。\n\n` +
      `攻人者曰「大奸」，辩者曰「诬枉」；攻者再疏，辩者亦再疏。` +
      `所论者，多非国事，而是彼此的门户。\n\n` +
      `臣为都御史，不能弹压。盖言官有言责，臣若抑之，是臣塞言路；` +
      `臣若不抑，是臣纵其相攻。两难之中，谨以实闻。\n\n` +
      `祖宗朝有「廷杖」之例：言事失当者，锦衣卫于午门外杖之。用之者少，而人皆震惧。` +
      `臣不敢请用，亦不敢不奏。\n\n` +
      `伏乞圣裁。`,
    piaoni: '言官论事，自有其责。若以杖责之，恐塞忠谏之路。',
    secret:
      '都御史这本，写得极小心。他不请用杖，只说「不敢不奏」——' +
      '把刀递到你手上，日后若士林有怨，他可以说：臣只是奏闻。',
    patience: 4,
    yiEffect: { metric: { chaoshi: -1 } },
    options: [
      {
        key: 'ready',
        label: '着锦衣卫备杖，以待旨',
        note: '不必真打，让人知道午门有这根杖',
        effect: {
          metric: { chaoshi: 3, guanfeng: -2 },
          flags: { open_tingzhang: 1 },
          log: '诏锦衣卫备杖午门。科道诸臣，一时都安静了不少。',
        },
      },
      {
        key: 'calm',
        label: '降旨戒谕，勿问其人',
        note: '先讲道理，道理讲不通再说',
        effect: { metric: { chaoshi: 1, guanfeng: 1 }, log: '降旨戒谕科道，令其各守职掌。' },
      },
    ],
  }),
  {
    // 走日常进本，不占叙事线的名额：这是议题，不是剧本
    weight: 3,
    cooldown: 55,
    when: (s) => !on(s, 'tingzhang') && s.turn >= 8 && (s.backlog >= 10 || s.truth.chaoshi < 60),
    forbids: ['open_tingzhang'],
  },
)

/* ══════════════════════════════════════════════════════════════════ *
 * 法立之后，得有人办，办完得有回话
 *
 * 这六本不是「反弹」，是「执行」。每一个都带着数目 —— 数目是真的
 * （从 statutes.ts 记的账上取），但说话的人未必老实。
 * ══════════════════════════════════════════════════════════════════ */

export const repKaocheng = def(
  'rep-kaocheng',
  'routine',
  (s) => {
    const runs = Math.round(s.flags['runs_kaocheng'] ?? 0)
    const demoted = Math.max(3, Math.round(runs / 2))
    const cleared = Math.round(runs * 0.4)
    return {
      from: '吏部尚书',
      title: '为考成岁报、分别举劾事',
      summary: `考成行至今日，京官降黜${demoted}员，案牍清出${cleared}件。`,
      body:
        `臣谨奏：考成一法，行至今日，计${runs}旬。\n\n` +
        `本年京察、外察，以「征赋不足九成」降级者${demoted}员，` +
        `其中知县十之七，推官十之二，同知以下十之一。\n\n` +
        `各省逋欠，追解者已清${cleared}件。然臣有一言：` +
        `降级的这些人里，有真怠惰的，也有真收不上来的。` +
        `山东、河南连岁旱蝗，粮无从出；州县官不敢报灾，只敢报「未完」。\n\n` +
        `臣请：凡灾伤之地，乞准展限；其余照旧考成。`,
      piaoni: '着吏部照例举行。',
      secret:
        '吏部尚书这本，一半是替州县求情，一半是替自己表功 ——' +
        '考成是他衙门里办的，降级的人越多，他的功劳越大，士林的怨也越深。',
      patience: 5,
      yiEffect: { metric: { chaoshi: 1, guanfeng: -1 } },
      options: [
        {
          key: 'strict',
          label: '不许展限。法一立，不容例外',
          note: '考成之所以有用，就在不容例外',
          effect: {
            ledger: { taicang: 8 },
            metric: { minxin: -4, guanfeng: 2, chaoshi: -3 },
          },
        },
        {
          key: 'relief',
          label: '灾伤之地，准其展限',
          note: '少收一笔，少逼反一批',
          effect: {
            ledger: { taicang: -4 },
            metric: { minxin: 5, chaoshi: 2, guanfeng: -2 },
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'kaocheng') && (s.flags['runs_kaocheng'] ?? 0) >= 6,
  },
)

export const repYitiao = def(
  'rep-ytb',
  'routine',
  (s) => {
    const y = Math.round((s.flags['yield_yitiaobian'] ?? 0) * 10) / 10
    const runs = Math.round(s.flags['runs_yitiaobian'] ?? 0)
    return {
      from: '户部尚书',
      title: '为条鞭岁入、类报完欠事',
      summary: `一条鞭行至今日，折银解到太仓共${Math.round(y)}万两。`,
      body:
        `臣谨奏：一条鞭法行于南直隶、浙江、江西诸处，计${runs}旬。\n\n` +
        `凡赋役归并、计亩征银者，共一百零七州县。` +
        `折银解到太仓者，前后共${Math.round(y)}万两；` +
        `较之旧额，岁增约${Math.max(1, Math.round((y / Math.max(1, runs)) * 36))}万两。\n\n` +
        `然臣不能不奏者三事：\n` +
        `一、秋成卖谷换银，谷贱银贵，苏松常三府，每两多折一钱，民用苦之；\n` +
        `二、里甲归并之后，胥吏无从包揽，改在「秤头」「火耗」上取；\n` +
        `三、江北诸府，田瘠而赋重，折银之后，逃亡者渐多。\n\n` +
        `法未尝不善，行之者不善耳。`,
      piaoni: '着户部查核，务使小民不受加耗之累。',
      secret:
        '「火耗」两个字，是这本的关键。' +
        '归并之弊去了，加耗之弊来了 —— 换一个名目，还是那一份钱。户部自己也抽这一份。',
      patience: 5,
      yiEffect: { ledger: { taicang: 2 }, metric: { minxin: -1 } },
      options: [
        {
          key: 'chase',
          label: '严追未完，火耗一并清查',
          note: '钱要收到位，但州县又要敲一回',
          effect: {
            ledger: { taicang: 9 },
            metric: { minxin: -5, guanfeng: 2 },
          },
        },
        {
          key: 'cap',
          label: '定火耗之数，不得多取',
          note: '给州县留一条活路，也给自己留个名',
          effect: {
            ledger: { taicang: -3 },
            metric: { minxin: 4, guanfeng: 1, chaoshi: -1 },
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'yitiaobian') && (s.flags['runs_yitiaobian'] ?? 0) >= 6,
  },
)

export const repKaihai = def(
  'rep-kh',
  'routine',
  (s) => {
    const y = Math.round((s.flags['yield_kaihai'] ?? 0) * 10) / 10
    const runs = Math.round(s.flags['runs_kaihai'] ?? 0)
    const ships = Math.max(12, Math.round(runs * 6))
    return {
      from: '福建巡抚',
      title: '为月港税课、类报船货事',
      summary: `月港开关至今，商船${ships}艘，关税解到${Math.round(y)}万两。`,
      body:
        `臣谨奏：月港开关，计${runs}旬。\n\n` +
        `出海商船，前后${ships}艘，往吕宋、往暹罗、往日本者皆有。` +
        `关税所入，解太仓者共${Math.round(y)}万两；` +
        `另有市舶司存留，供本省水寨之用。\n\n` +
        `有一事臣不敢不奏：商船既众，其中夹带者亦众。` +
        `前月查得三船，舱底藏铁器、硝黄，问之，曰「往吕宋市磺」。` +
        `此物出洋，回来就是倭人的炮。\n\n` +
        `臣请于月港设盘验之法：出海验货，回港验船。` +
        `然盘验需人，需饷，岁约六万两 —— 这笔钱，从关税里出，还是从太仓出？`,
      piaoni: '着福建抚按议奏。',
      secret:
        '「往吕宋市磺」这一句，福建巡抚写了又划掉，划了又写上。' +
        '他知道报上去会被人拿来做文章 —— 但他也知道，不报，日后出事是他的。',
      patience: 4,
      yiEffect: { ledger: { taicang: 3 } },
      options: [
        {
          key: 'patrol',
          label: '设盘验，岁费六万，从关税出',
          note: '关税少解一点，海防稳一点',
          effect: {
            metric: { bianfang: 6, chaoshi: 2 },
            flags: { kh_patrol: 1 },
          },
        },
        {
          key: 'loose',
          label: '不必盘验，只照旧抽税',
          note: '钱先收着，将来的事将来再说',
          effect: {
            ledger: { taicang: 6 },
            metric: { bianfang: -3 },
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'kaihai') && (s.flags['runs_kaihai'] ?? 0) >= 6,
  },
)

export const repZonglu = def(
  'rep-zl',
  'routine',
  (s) => {
    const y = Math.round((s.flags['yield_zonglu'] ?? 0) * 10) / 10
    const runs = Math.round(s.flags['runs_zonglu'] ?? 0)
    return {
      from: '山西巡抚',
      title: '为宗禄折色岁报、王府怨望事',
      summary: `宗禄改折${runs}旬，省下${Math.round(y)}万两；各王府怨言渐起。`,
      body:
        `臣谨奏：宗禄改折，行于山西、河南、湖广，计${runs}旬。\n\n` +
        `折色所省，解太仓者共${Math.round(y)}万两。藩司库中，` +
        `自臣到任以来，第一次没有向户部告匮。\n\n` +
        `然各王府怨望日深。晋王遣人至臣衙门，言「祖宗之法，非外臣所得议」；` +
        `代府则以禄米不至，闭门不纳地方官。更有宗室数十人，` +
        `聚于藩司门前，言「饿死也是死，不如死在布政司」。\n\n` +
        `臣请：于折色之外，量为周恤 —— 贫宗无禄者，岁给米若干，` +
        `庶几不至于生变。此项岁需不过二万两。`,
      piaoni: '着宗人府议奏。',
      secret:
        '「饿死也是死」这句话，是宗室说的，也是山西巡抚想让你听见的。' +
        '他知道这笔省下来的钱最后要落到哪里 —— 落不到贫宗身上。',
      patience: 4,
      yiEffect: { ledger: { taicang: 2 }, metric: { chaoshi: -1 } },
      options: [
        {
          key: 'relief',
          label: '准周恤贫宗，岁给二万',
          note: '花小钱，压住一个可能炸的地方',
          effect: {
            ledger: { taicang: -2 },
            metric: { chaoshi: 5, minxin: 1 },
            flags: { zl_relief: 1 },
          },
        },
        {
          key: 'hard',
          label: '不许。宗禄已定，哭穷者削其禄',
          note: '硬到底。宗室会记很久',
          effect: {
            metric: { chaoshi: -6, guanfeng: 2 },
            ledger: { taicang: 4 },
            flags: { zl_hard: 1 },
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'zonglu') && (s.flags['runs_zonglu'] ?? 0) >= 6,
  },
)

export const repKuang = def(
  'rep-ks',
  'routine',
  (s) => {
    const real = Math.round((s.flags['yield_kuangshui'] ?? 0) * 10) / 10
    // 内监报上来的数，比实解的多两成 —— 这一成半，是他们自己的
    const claimed = Math.round(real * 1.2)
    const runs = Math.round(s.flags['runs_kuangshui'] ?? 0)
    return {
      from: '内官监太监',
      title: '为矿课解进、恭报数目事',
      summary: `各省矿使解进内帑，前后共${claimed}万两。`,
      body:
        `奴才谨奏：矿税之行，计${runs}旬。\n\n` +
        `山西、陕西、河南、湖广、云南五省，设矿使二十七处，` +
        `解进内帑者，前后共${claimed}万两。此皆不经户部，径解内库，` +
        `账目清楚，可备查考。\n\n` +
        `各省抚按，屡有奏称「矿使扰民」者。奴才不敢辩，只奏一事：` +
        `所解之数，奴才一文未敢私留。若皇上不信，可遣人查库。\n\n` +
        `再，湖广、江西矿脉渐薄，往后所入，恐不及此数。奴才预为奏闻。`,
      piaoni: '知道了。',
      secret:
        `实解内帑的数是${real}万两。多出来的那一截，` +
        '内官监说是「耗羡」，其实是各矿使按季孝敬的例规。' +
        '你若不查，账永远是平的；你一查，账也是平的 —— 只是数字会变小。',
      patience: 3,
      yiEffect: { ledger: { neitang: 3 }, metric: { minxin: -2, guanfeng: -1 } },
      options: [
        {
          key: 'audit',
          label: '遣锦衣卫核库',
          note: '查得出来，也得罪人',
          effect: {
            ledger: { neitang: -6 },
            metric: { guanfeng: 3, minxin: 3, chaoshi: -2 },
            flags: { ks_audited: 1 },
          },
        },
        {
          key: 'accept',
          label: '知道了，照旧解进',
          note: '账是平的，人心不是',
          effect: {
            ledger: { neitang: 5 },
            metric: { guanfeng: -2, minxin: -3 },
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'kuangshui') && (s.flags['runs_kuangshui'] ?? 0) >= 6,
  },
)

export const repTingzhang = def(
  'rep-tz',
  'routine',
  (s) => {
    const runs = Math.round(s.flags['runs_tingzhang'] ?? 0)
    const beaten = Math.max(2, Math.round(runs / 4))
    const vacant = Math.min(34, 8 + Math.round(runs / 3))
    return {
      from: '都察院左都御史',
      title: '为杖责人数、科道缺员事',
      summary: `前后杖责${beaten}人，六科给事中缺员${vacant}员，言事者日少。`,
      body:
        `臣谨奏：廷杖之例行，前后杖责${beaten}人。\n\n` +
        `六科给事中，额设五十八员，今在任者三十四员，缺员${vacant}员。` +
        `都察院十三道御史，缺员亦半。\n\n` +
        `缺员之故，臣不敢隐：非无才可选，是无敢来。` +
        `前月吏部以六人名上，五人辞。内一人回书曰：「臣有老母在堂，` +
        `不敢以一身试杖。」\n\n` +
        `言路无人，则天下之弊，无人上闻。今日之患，不在言官太横，` +
        `在言官太静。太静的时候，坏事就不出声了。`,
      piaoni: '着吏部另行拣选。',
      secret:
        '都御史这本，是替言路求活。他自己也在怕 ——' +
        '上一回杖责的名单，是司礼监拟的，他是看着名单才知道要打谁。',
      patience: 4,
      yiEffect: { metric: { chaoshi: -2 } },
      options: [
        {
          key: 'pardon',
          label: '起复被杖诸臣，补足科道',
          note: '认个错。士林会记这一笔',
          effect: {
            metric: { chaoshi: 8, guanfeng: 4 },
            backlog: -3,
            flags: { tz_restored: 1 },
          },
        },
        {
          key: 'more',
          label: '再杖二人，以正纲纪',
          note: '压得更狠，静得更彻底',
          effect: {
            metric: { chaoshi: -6, guanfeng: -3 },
            backlog: -5,
          },
        },
      ],
    }
  },
  {
    weight: 1,
    cooldown: 14,
    when: (s) => on(s, 'tingzhang') && (s.flags['runs_tingzhang'] ?? 0) >= 6,
  },
)

/** 解锁法度的奏疏（未出，则律令页上不显示那条法） */
export const OPEN_TEMPLATES = [openYitiao, openKaihai, openZonglu, openKuangshui, openTingzhang]

/** 各法施行之后的执行汇报（带真数） */
export const REPORT_TEMPLATES = [
  repKaocheng,
  repYitiao,
  repKaihai,
  repZonglu,
  repKuang,
  repTingzhang,
]
