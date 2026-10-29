import { def } from '../../engine/events'

/**
 * 两条线的收口：冯保、考成。
 *
 * 这两条线在剧本里都有开头，没有下文。可下文才是真正有分量的部分 ——
 * 你处置了一个人，制度上留下一个空；你废了一条法，州县上松了一根弦。
 * 空缺和松弛，都会自己长出东西来。
 */

/* ══════════════════ 冯保之后：司礼监空了 ══════════════════ */

export const fbAfter = def(
  'fb-after',
  'personnel',
  () => ({
    from: '司礼监秉笔太监 张诚',
    title: '为司礼监掌印缺员、请旨简用事',
    summary: '冯保去后，司礼监掌印空悬。谁来掌批红的笔。',
    body:
      `奴才张诚谨奏：司礼监掌印太监一缺，自冯保去后，空悬至今。\n\n` +
      `司礼监所掌者，批红也。内外章奏，经内阁票拟，送司礼监批红，` +
      `然后发下。此笔一日无人执，则章奏一日不得行。\n\n` +
      `今司礼监有秉笔八人，皆可充此任。奴才不敢自荐，然有一言：\n\n` +
      `冯保之初，亦不过一秉笔耳。其所以能专权二十年者，非其才，` +
      `是批红之权久在一人之手。此权久则生势，势生则难制。\n\n` +
      `奴才请：此后批红，不必专归掌印，可分与秉笔轮值。庶几可免前辙。\n\n` +
      `然此事关涉内廷体制，奴才不敢擅议。`,
    piaoni: '着张诚掌司礼监印。',
    secret:
      '这本是张诚自己写的，也自己拟了「分与秉笔轮值」的话。' +
      '他知道这话很好听，也知道你不会真让他分权 —— 他要的只是这个位子。',
    patience: 4,
    yiEffect: { metric: { chaoshi: 3 } },
    ignoredEffect: { metric: { chaoshi: -4 }, backlog: 4 },
    options: [
      {
        key: 'zhangcheng',
        label: '着张诚掌印',
        note: '他等了很久。他贪，但他是你的人',
        effect: {
          metric: { chaoshi: 2, guanfeng: -2 },
          flags: { siliji_zhangcheng: 1 },
        },
      },
      {
        key: 'chenju',
        label: '着陈矩掌印',
        note: '陈矩持重，不结党，也不肯替你办脏事',
        effect: {
          metric: { chaoshi: 5, guanfeng: 3 },
          flags: { siliji_chenju: 1 },
        },
      },
      {
        key: 'split',
        label: '准其议：批红分与秉笔轮值',
        note: '内廷权力从此分散。省你的心，也散你的手',
        effect: {
          metric: { chaoshi: 6, guanfeng: 4 },
          backlog: 5,
          flags: { siliji_split: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'fb3', requires: ['fb_dead'] },
)

export const fbCorrupt = def(
  'fb-corrupt',
  'impeach',
  () => ({
    from: '户科给事中',
    title: '为劾司礼监掌印侵盗内帑、乞赐查究事',
    summary: '新掌印上任一年，内帑账目短少十一万两。',
    body:
      `臣谨奏：司礼监掌印张诚，掌印一年。\n\n` +
      `臣查内帑旧例：每年进项、支用，皆有簿籍，年终奏报。` +
      `今年奏报的簿籍，比去年少了十一万两，而支用项下并无新增。\n\n` +
      `臣请查内帑簿籍。\n\n` +
      `臣知内帑之事，外臣不当问。然内帑者，天下之财也，非一人之私。` +
      `冯保之败，正败在此 —— 若今日不问，明日又是一冯保。`,
    piaoni: '内帑之事，自有内官管理。该科不必多言。',
    secret:
      '这道票拟是张诚自己拟的——他现在掌着批红的笔。' +
      '被劾的人拟旨驳回劾自己的疏，这就是冯保当年干的事。',
    patience: 3,
    yiEffect: { metric: { guanfeng: -4, chaoshi: -2 } },
    ignoredEffect: { metric: { guanfeng: -6 } },
    options: [
      {
        key: 'audit',
        label: '命户部会同内官监清查内帑',
        note: '把内廷的账摊给外廷看。这是先例',
        effect: {
          ledger: { neitang: -6, taicang: 8 },
          metric: { guanfeng: 8, chaoshi: -4 },
          flags: { neitang_audited: 1 },
        },
      },
      {
        key: 'warn',
        label: '私下谕之，令其自补',
        note: '给个脸面。他补不补，看他自己',
        effect: {
          ledger: { neitang: 4 },
          metric: { chaoshi: 3, guanfeng: -2 },
          flags: { neitang_warned: 1 },
        },
      },
      {
        key: 'cover',
        label: '驳回，不必再言',
        note: '',
        effect: { metric: { guanfeng: -5, chaoshi: -2 }, flags: { neitang_covered: 1 } },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'fb4', requires: ['siliji_zhangcheng'] },
)

/* ══════════════════ 考成之后：两条路各自长出东西 ══════════════════ */

export const kcLooseEnd = def(
  'kc-loose-end',
  'urgent',
  () => ({
    from: '户部尚书',
    title: '为各省钱粮尽欠、京仓不足三月事',
    summary: '宽考一年，各省逋欠二百三十万，京仓只够三个月。',
    body:
      `臣谨奏：自宽考之诏下，今一年矣。\n\n` +
      `各省逋欠，合而计之二百三十一万两。去年此时，是七十六万。\n\n` +
      `臣不敢请复考成。然有一事，请皇上垂听：\n\n` +
      `州县官不催科，非其不愿，是不敢。为何不敢？因催科则民怨，` +
      `民怨则上控，上控则考语不佳。宽考之后，考语看的是「民情」，` +
      `不是「钱粮」。\n\n` +
      `于是州县皆以「抚字」为名，以「催科」为讳。皇上宽一分，` +
      `州县宽十分；州县宽十分，百姓未必得一分 —— 那一分，在中间的吏手里。\n\n` +
      `今京仓不足三月之支。臣请于三事中择一：加派、借支、裁饷。`,
    piaoni: '着户部议加派之数。',
    secret:
      '「加派」两个字一出口，这事就收不住了。万历末年辽饷加派，' +
      '加到每亩九厘，天下由此大乱 —— 而第一步，就是今天这本疏。',
    patience: 2,
    yiEffect: { ledger: { taicang: 10 }, metric: { minxin: -6, guanfeng: -3 } },
    ignoredEffect: { ledger: { taicang: -12 }, metric: { minxin: -3, bianfang: -4 } },
    options: [
      {
        key: 'levy',
        label: '加派。每亩加银三厘',
        note: '一年可得四十万。这是条不归路',
        effect: {
          ledger: { taicang: 22 },
          metric: { minxin: -10, guanfeng: -4 },
          flags: { tax_surcharge: 1 },
        },
      },
      {
        key: 'borrow2',
        label: '借太仆寺马价银',
        note: '太仆的钱是备边的。借了要还',
        effect: {
          ledger: { taicang: 18, taipu: -30 },
          metric: { bianfang: -3 },
          flags: { borrow_taipu: 1 },
        },
      },
      {
        key: 'cut',
        label: '裁九边年例一成',
        note: '省钱。边军会记账的',
        effect: {
          ledger: { taicang: 12 },
          metric: { bianfang: -8 },
          flags: { cut_frontier_pay: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'kc3', requires: ['kc_loose'] },
)

export const kcHarshEnd = def(
  'kc-harsh-end',
  'urgent',
  () => ({
    from: '山东巡抚',
    title: '为州县催科激变、民聚山林事',
    summary: '考成严责，沂州民因催科聚众三千，据山自守。',
    body:
      `臣谨奏：沂州、费县一带，民聚三千，据山自守。\n\n` +
      `其起之由：今年春，沂州知州以考成限期将至，遣胥吏下鄉催科，` +
      `凡欠粮者，锁拿追比，枷号于市。有王姓者，欠银四钱，` +
      `枷三日，死于枷下。\n\n` +
      `其族聚二百人，焚胥吏之屋。知县往弹压，民不散。` +
      `至今两月，聚者三千，有「免粮」之号。\n\n` +
      `臣查：沂州今年报完九成一 —— 恰好够考成的数。` +
      `可那九成一里，有三成是从别处挪借的，一成是胥吏垫的，` +
      `真正出于民者，不过五成。\n\n` +
      `臣请暂缓考成，先抚此民。`,
    piaoni: '着山东巡抚抚剿，务期速靖。',
    secret:
      '这本疏最难的地方在于：它不是「民变」，它是「考成」考出来的。' +
      '你若因此缓考成，等于承认这法害民；若不缓，下一个沂州在哪里？',
    patience: 2,
    yiEffect: { metric: { minxin: -6, chaoshi: -3 } },
    ignoredEffect: { metric: { minxin: -12, chaoshi: -6, guanfeng: -4 } },
    options: [
      {
        key: 'relax',
        label: '暂缓山东考成一年，先抚民',
        note: '承认这法有毛病。别处会跟着要',
        effect: {
          metric: { minxin: 9, chaoshi: -3, guanfeng: 2 },
          flags: { kc_relaxed_shandong: 1 },
        },
      },
      {
        key: 'suppress2',
        label: '调兵剿之，考成照旧',
        note: '压下去。压住的是这一处',
        effect: {
          ledger: { taicang: -8 },
          metric: { minxin: -8, guanfeng: -5, bianfang: -2 },
          flags: { kc_suppressed: 1 },
        },
      },
      {
        key: 'punish2',
        label: '罢沂州知州，抚民，考成不动',
        note: '找一个替罪的。州县官会看懂',
        effect: {
          metric: { minxin: 5, guanfeng: 3, chaoshi: -2 },
          flags: { kc_scapegoat: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'kc4', requires: ['kc_harsh'] },
)

export const LINE_ENDINGS = [fbAfter, fbCorrupt, kcLooseEnd, kcHarshEnd]
