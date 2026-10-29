import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 日常政务。这一类不推动主线，但撑起「一个皇帝每天在批什么」的实感。
 * 每条都写死一个具体的数字、一个具体的人、一句具体的话 —— 不重复靠细节。
 */

export const saltTax = def(
  'salt-tax',
  'routine',
  (s: WorldState) => {
    const r = s.turn % 3
    const place = ['两淮', '长芦', '山东', '两浙'][r]
    return {
      from: `巡盐御史`,
      title: '为盐引壅积、课银亏欠事',
      summary: `${place}盐场积引一百二十万，商人不肯中，课银欠三万两。`,
      body:
        `臣谨奏：${place}的盐，卖不动了。\n\n` +
        `盐引积了一百二十万道，堆在运司的库里。商人为什么不肯中？因为中一引，` +
        `要交六钱银子的课，可运到口岸，官盐卖不过私盐——私盐一斤三文，官盐一斤七文。\n\n` +
        `私盐从哪来？从灶户来。灶户煮了盐，官不收，他就卖给私贩。禁不绝。\n\n` +
        `臣请减课二钱，先让官盐卖得动。课虽减，总比收不上来强。`,
      piaoni: '户部看议。',
      secret: '盐运司的库房里，那一百二十万引是假的——真正的引早就被盐商大户低价吃进，等着减课。这道疏，是替他们递的。',
      yiEffect: { taicang: 4, metrics: { minxin: 1 } },
      patience: 6,
      ignoredEffect: { taicang: -3, metrics: { guanfeng: -1 } },
      options: [
        { key: 'yi', label: '依拟（减课二钱）', effect: { taicang: 4, metrics: { minxin: 1 } } },
        {
          key: 'bu',
          label: '不减课，严缉私盐',
          needsReading: true,
          note: '私盐禁不绝，但禁一禁，总比什么都不做强',
          effect: {
            taicang: 9,
            metrics: { minxin: -3, guanfeng: 1 },
            energy: -1,
            log: '不减盐课，严缉私盐。缉私兵丁下乡，灶户有被逼死者。',
          },
        },
        {
          key: 'cha',
          label: '遣御史查盐运司的库',
          needsReading: true,
          note: '那一百二十万引，你怀疑是假的',
          effect: {
            taicang: 14,
            metrics: { guanfeng: 3, chaoshi: -1 },
            energy: -1,
            log: '遣御史查盐运司库。查出一百二十万引中，实存不足四十万，余皆虚报。',
          },
        },
      ],
    }
  },
  { weight: 2, cooldown: 12 },
)

export const weaving = def(
  'weaving',
  'routine',
  () => ({
    from: '苏杭织造太监',
    title: '为织造缎匹、请增额本事',
    summary: '上用缎匹原额一万匹，请增五千匹。工料银须加四万两。',
    body:
      `奴才谨奏：上用缎匹的额，是一万匹。今年不够用。\n\n` +
      `宫中赏赐、册封、年节，都要用。奴才算了，还差五千匹。\n\n` +
      `奴才也知道江南的机户苦。可这是上用，不敢将就。请加额五千匹，工料银四万两。`,
    piaoni: '工部看议。',
    secret: '织造太监的账，从来不给人看。这五千匹里，有一半是拿去卖到海外去的——打着「上用」的名。',
    yiEffect: { taicang: -4, metrics: { minxin: -1 } },
    patience: 8,
    options: [
      { key: 'yi', label: '依拟', effect: { taicang: -4, metrics: { minxin: -1 } } },
      {
        key: 'jian',
        label: '减为三千匹，工料自内帑出',
        needsReading: true,
        note: '少织一点，也别让江南的机户白干',
        effect: {
          neitang: -2,
          metrics: { minxin: 2, guanfeng: 1 },
          energy: -1,
          log: '减织造为三千匹，工料自内帑出。江南机户，喘息稍定。',
        },
      },
      {
        key: 'ting',
        label: '停织一年',
        needsReading: true,
        note: '宫里少几件衣裳。江南少几百个破产的机户',
        effect: {
          metrics: { minxin: 4, chaoshi: -1 },
          flags: { weaving_stop: 1 },
          energy: -1,
          log: '诏停织造一年。织造太监奉旨时，脸色不好看。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 20 },
)

export const exam = def(
  'exam',
  'routine',
  () => ({
    from: '礼部',
    title: '为会试事竣、请殿试事',
    summary: `本科会试取中三百五十名。请于下月殿试，钦定甲第。`,
    body:
      `臣谨奏：本科会试，今日放榜。\n\n` +
      `天下举人四千六百人入场，取中三百五十名。头场四书题是「君子喻于义」，` +
      `有考生当场晕倒，抬出去了。\n\n` +
      `请于下月殿试。殿试只定甲第，不落一人——三百五十名，都是进士。\n\n` +
      `伏乞圣裁。`,
    piaoni: '依议。着礼部具仪注。',
    secret: '会试的房师名录，已经送到张四维案上了。三百五十个门生，谁是谁的人，他心里有一本账。',
    yiEffect: { metrics: { chaoshi: 2, guanfeng: 1 } },
    patience: 8,
    options: [
      { key: 'yi', label: '依拟', effect: { metrics: { chaoshi: 2, guanfeng: 1 } } },
      {
        key: 'qin',
        label: '亲策问，加试时务策',
        needsReading: true,
        note: '不考八股，考他们会不会办事',
        effect: {
          metrics: { guanfeng: 3, chaoshi: 1 },
          flags: { exam_reform: 1 },
          energy: -2,
          log: '亲策于廷，加试时务策。有考生交了白卷，卷上写「臣不知」。你看了一遍，把这张卷子留下了。',
        },
      },
      {
        key: 'jian',
        label: '减额至二百名',
        needsReading: true,
        note: '官太多了，位子不够分',
        effect: {
          taicang: 2,
          metrics: { chaoshi: -3, guanfeng: -1 },
          energy: -1,
          log: '减会试取中为二百名。落第的举人，有在礼部门前哭的。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 24 },
)

export const clanStipend = def(
  'clan-stipend',
  'routine',
  () => ({
    from: '河南巡抚',
    title: '为宗禄不敷、恳乞区处事',
    summary: '河南一省岁入二百八十万石，宗禄需二百四十万石。请减折或改给钞。',
    body:
      `臣谨奏：河南的宗禄，快把一省的粮吃光了。\n\n` +
      `河南岁入二百八十万石。宗室禄米，需二百四十万石。剩下四十万石，` +
      `要养官、养兵、修河、赈灾。\n\n` +
      `臣算不出来。臣只能把数报上来。\n\n` +
      `请减宗禄三成，或改给宝钞。宗室们一定不愿意，可臣实在没别的法子。`,
    piaoni: '户部会同宗人府议。',
    secret: '减宗禄的话，谁提谁挨骂。这道疏在户部压了两个月——尚书不敢往上递，是巡抚自己递的。',
    yiEffect: { taicang: 6, metrics: { chaoshi: -3 } },
    patience: 5,
    ignoredEffect: { taicang: -4, metrics: { minxin: -2 } },
    options: [
      {
        key: 'yi',
        label: '依拟（户部会议）',
        effect: { taicang: 6, metrics: { chaoshi: -3 }, log: '宗禄事交户部会议。议了半年，议不出结果。' },
      },
      {
        key: 'jian',
        label: '减宗禄三成',
        needsReading: true,
        note: '动了祖宗的规矩。可不动，河南就完了',
        effect: {
          taicang: 18,
          metrics: { chaoshi: -8, minxin: 3 },
          flags: { clan_cut: 1 },
          energy: -1,
          log: '诏减河南宗禄三成。宗人府上疏力争，言辞甚激。',
        },
      },
      {
        key: 'chao',
        label: '改折宝钞',
        needsReading: true,
        note: '宝钞不值钱。这等于变相赖账，但面子上过得去',
        effect: {
          taicang: 12,
          metrics: { chaoshi: -4, guanfeng: -2 },
          energy: -1,
          log: '诏宗禄改折宝钞。宗室们拿着成捆的钞，在开封街上换不到一斗米。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 20 },
)

export const vagrant = def(
  'vagrant',
  'urgent',
  () => ({
    from: '湖广巡抚',
    title: '为荆襄流民复聚、恐生变故事',
    summary: `荆襄山中聚流民二十余万，垦荒自给。有司请驱还本籍，臣以为不可。`,
    body:
      `臣谨奏：荆襄的山里，又聚了二十几万人。\n\n` +
      `他们是从陕西、河南逃荒来的。在山里开荒，搭棚住，种一点玉米薯蓣。` +
      `有司说该驱还本籍——本籍要是有饭吃，他们何必进山。\n\n` +
      `臣在郧阳待过。这些人不是盗，是民。可二十万人聚在一处，没有编户，没有里甲，` +
      `一旦有个挑头的，就是大乱。\n\n` +
      `臣请就地附籍，设官管理。`,
    piaoni: '户部看议。',
    secret: '这一点，成化年间就闹过一次，杀了十几万人。写这道疏的巡抚，案头就摆着那一次的旧档。',
    yiEffect: { minxin: 2 } as never,
    patience: 3,
    ignoredEffect: {
      metrics: { minxin: -6, chaoshi: -4 },
      log: '荆襄流民的事没人管。半年后，山中有聚众数千，掠州县仓。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（就地附籍）',
        effect: {
          metrics: { minxin: 6, chaoshi: 2 },
          taicang: -3,
          flags: { vagrant_ok: 1 },
          log: '许荆襄流民就地附籍，设郧阳巡抚领之。二十万人，从此有了籍。',
        },
      },
      {
        key: 'qu',
        label: '驱还本籍',
        needsReading: true,
        note: '把他们赶回去。成化年间就是这么办的',
        effect: {
          metrics: { minxin: -8, chaoshi: -5 },
          taicang: -2,
          flags: { vagrant_drive: 1 },
          energy: -1,
          log: '驱荆襄流民还籍。沿途死者甚众，山中有拒捕者，杀伤兵丁。',
        },
      },
      {
        key: 'bian',
        label: '编为军屯，就近守御',
        needsReading: true,
        note: '给地、给身份，还多一支兵',
        effect: {
          metrics: { bianfang: 4, minxin: 3 },
          taicang: -5,
          flags: { vagrant_army: 1 },
          energy: -1,
          log: '编荆襄流民为军屯，授田守御。得壮丁三万，屯田十二万亩。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 22 },
)

export const armory = def(
  'armory',
  'routine',
  () => ({
    from: '工部',
    title: '为军器朽坏、请旨修造事',
    summary: '京营盔甲弓箭，十之六七朽坏不堪。请发银八万两修造。',
    body:
      `臣谨奏：臣奉命查京营军器。\n\n` +
      `盔甲三千副，可用者九百。弓箭五万支，可用者一万二。火器二百门，` +
      `炸过三门，剩下的不敢试。\n\n` +
      `臣问管库的，为什么烂成这样。他说：库里潮，十年没晒过。\n\n` +
      `臣请发银八万两修造。可臣也说一句：修好了没人管，还是要烂。`,
    piaoni: '工部知道。着动支节慎库银修造。',
    secret: '「十年没晒过」是假话。真正的窟窿是每年领的修造银，都进了营官的口袋——这批军器报的是「已修」。',
    yiEffect: { taicang: -6, metrics: { bianfang: 1 } },
    patience: 6,
    options: [
      { key: 'yi', label: '依拟', effect: { taicang: -6, metrics: { bianfang: 1 } } },
      {
        key: 'cha',
        label: '先查历年修造银的去向',
        needsReading: true,
        note: '修一次烂一次，钱到哪去了',
        effect: {
          taicang: 5,
          metrics: { guanfeng: 4, chaoshi: -2 },
          energy: -1,
          log: '查京营修造银。查出营官冒领四万两，下狱二人。',
        },
      },
      {
        key: 'xiu',
        label: '发银十万，并定三年一晒的规矩',
        needsReading: true,
        note: '多花两万，买个不再烂',
        effect: {
          taicang: -10,
          metrics: { bianfang: 4, guanfeng: 2 },
          flags: { armory_fixed: 1 },
          energy: -1,
          log: '发银十万修造军器，定三年一晒之例。',
        },
      },
    ],
  }),
  { weight: 2, cooldown: 14 },
)

export const recommend = def(
  'recommend',
  'personnel',
  (s: WorldState) => {
    const pool = s.officers.filter((o) => o.officeId === null)
    const pick = pool[(s.turn * 7) % Math.max(1, pool.length)]
    return {
      from: '礼部尚书',
      title: '为荐举贤才、以备任使事',
      summary: `臣荐${pick?.name ?? '某人'}，谓其才堪大用。伏乞擢用。`,
      body:
        `臣谨荐一人：${pick?.name ?? '某人'}，${pick?.origin ?? ''}人，${pick?.jinshi ?? ''}。\n\n` +
        `臣与他同乡，不敢说没有私心。可臣确实见过他办事。他在县里修过一条渠，` +
        `三年没有水患；断过一桩拖了十年的田产案，两造都服。\n\n` +
        `臣的考语是：${pick?.appraisal ?? ''}\n\n` +
        `用不用，皇上自己看。臣只是把这个人摆在这儿。`,
      piaoni: '着吏部查议。',
      secret: `${pick?.name ?? '此人'}是这位尚书的门生。荐举的规矩，本来就是拿人情换位置——只是这一次，这个人也许真的可用。`,
      yiEffect: { metrics: { guanfeng: 1 } },
      patience: 8,
      options: [
        { key: 'yi', label: '依拟（吏部查议）', effect: { metrics: { guanfeng: 1 } } },
        {
          key: 'yong',
          label: `即召见${pick?.name ?? '此人'}`,
          needsReading: true,
          note: '见一面再定。这一面不花什么，但你会记住他',
          effect: {
            energy: -2,
            flags: { [`met_${pick?.id}`]: 1 },
            log: `召见${pick?.name ?? '其人'}。问了半个时辰，问的是渠怎么修、案怎么断。`,
          },
        },
        {
          key: 'bo',
          label: '驳回，且责其市恩',
          needsReading: true,
          note: '荐举就是结党。这么骂一句，以后没人敢荐人了',
          effect: {
            metrics: { chaoshi: 2, guanfeng: -3 },
            flags: { recommend_stop: 1 },
            energy: -1,
            log: '驳回荐举，切责其市恩。此后半年，无人荐人。',
          },
        },
      ],
    }
  },
  { weight: 2, cooldown: 13 },
)

export const auspice = def(
  'auspice',
  'routine',
  () => ({
    from: '河南巡抚',
    title: '为恭进嘉禾、以彰圣德事',
    summary: '祥符县产嘉禾，一茎九穗。臣谨绘图进呈。',
    body:
      `臣谨奏：祥符县民田内，产嘉禾一茎九穗，高二尺余。父老以为未有之瑞。\n\n` +
      `臣已命画工图之，谨呈御览。此皆皇上敬天勤民之所致也。\n\n` +
      `伏乞宣付史馆，以昭盛美。`,
    piaoni: '知道了。图留中。',
    secret: '一茎九穗的禾，是县官从三株禾上绑起来的。这种事，每一朝都有，每一朝都有人信。',
    yiEffect: { metrics: { chaoshi: 1 } },
    patience: 8,
    options: [
      {
        key: 'yi',
        label: '依拟（留中）',
        effect: { metrics: { chaoshi: 1 }, log: '嘉禾图留中。' },
      },
      {
        key: 'xuan',
        label: '宣付史馆，赏进瑞者',
        needsReading: true,
        note: '祥瑞是政治。信不信是另一回事',
        effect: {
          metrics: { chaoshi: 3, minxin: 2, guanfeng: -1 },
          log: '嘉禾宣付史馆，赏巡抚银币。此后一月，各省进瑞者七起。',
        },
      },
      {
        key: 'chi',
        label: '斥其虚妄，戒各省勿进祥瑞',
        needsReading: true,
        note: '一句话堵死这条路。会有人不高兴',
        effect: {
          metrics: { guanfeng: 3, chaoshi: -2 },
          flags: { no_auspice: 1 },
          energy: -1,
          log: '斥祥瑞虚妄，诏各省勿进。礼部侍郎面色不佳。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 18 },
)

export const MISC_TEMPLATES = [
  saltTax,
  weaving,
  exam,
  clanStipend,
  vagrant,
  armory,
  recommend,
  auspice,
]
