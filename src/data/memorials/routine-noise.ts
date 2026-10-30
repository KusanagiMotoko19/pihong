import { def } from '../../engine/events'

/**
 * 例行公文（底噪）。
 *
 * 皇帝案上堆着的本子，绝大多数不是军国大事，是这些：
 * 某府报雨泽、某部报月粮、某镇报马倒毙。
 * 它们不需要你费心，但你不看，就不知道哪一条底下藏着事。
 *
 * 为什么要有这一组：玩家反馈「一旬只有三四本，看得完，不觉其难」。
 * 真实的一旬是几十本、上百本。有了这些底噪，精力才真的不够用 ——
 * 十点精力，读六本，剩下的只能依拟或留中。
 *
 * 这几本的冷却极短（二三旬），所以会反复来 —— 但内容本来就一样，
 * 它们不是剧情，是天气。真的天气。
 */

/* ══════════════════════════ 雨泽 ══════════════════════════ */

export const noRain = def(
  'no-rain',
  'routine',
  (s) => {
    const prov = ['山东', '河南', '北直隶', '山西', '陕西', '湖广'][s.turn % 6]
    return {
      from: '户部',
      title: '为旬报雨泽、以慰圣怀事',
      summary: `${prov}各府报雨泽沾足，二麦可望。`,
      body:
        `臣谨奏：${prov}各府州县，旬报雨泽。\n\n` +
        `自本月初至中旬，${prov}得雨二寸、三寸不等，土脉滋润，二麦可望。` +
        `间有一二县报旱，已令有司查勘，尚未成灾。\n\n` +
        `谨具奏闻。`,
      piaoni: '知道了。',
      patience: 2,
      yiEffect: { metric: { minxin: 0.05 } },
      ignoredEffect: { metric: { minxin: -0.3 } },
      options: [
        { key: 'yi', label: '知道了', effect: { metric: { minxin: 0.3 } } },
        {
          key: 'cha',
          label: '仍令查勘旱处',
          needsReading: true,
          note: '一句话的事，但也许有别的',
          effect: { metric: { minxin: 1 }, energy: -1 },
        },
      ],
    }
  },
  { weight: 2.5, cooldown: 2 },
)

/* ══════════════════════════ 月粮 ══════════════════════════ */

export const noGrain = def(
  'no-grain',
  'routine',
  () => ({
    from: '户部',
    title: '为恭报月粮解到、乞赐查验事',
    summary: '南直隶、浙江月粮解到太仓，数已足额。',
    body:
      `臣谨奏：南直隶、浙江解到月粮，计粟十二万石，已入太仓。\n\n` +
      `各仓盘验无短少，斗斛亦平。谨具奏闻。`,
    piaoni: '知道了。',
    patience: 2,
    yiEffect: { taicang: 0.15 },
    ignoredEffect: { taicang: -0.4 },
    options: [
      { key: 'yi', label: '知道了', effect: { taicang: 0.6 } },
      {
        key: 'pan',
        label: '令户部盘库',
        needsReading: true,
        note: '盘一次，费一次',
        effect: { taicang: 1.5, metric: { guanfeng: 0.5 }, energy: -1 },
      },
    ],
  }),
  { weight: 2.5, cooldown: 2 },
)

/* ══════════════════════════ 军器 ══════════════════════════ */

export const noHorse = def(
  'no-horse',
  'routine',
  () => ({
    from: '太仆寺卿',
    title: '为奏报马匹倒毙、请旨买补事',
    summary: '各苑马匹倒毙三十七匹，请动支马价银买补。',
    body:
      `臣谨奏：各苑牧马，本月倒毙三十七匹。\n\n` +
      `查系时疫，非牧养之失。臣请动支马价银，照数买补。`,
    piaoni: '着照数买补。',
    patience: 2,
    yiEffect: { taipu: -0.15, metric: { bianfang: 0.05 } },
    ignoredEffect: { metric: { bianfang: -0.25 } },
    options: [
      { key: 'yi', label: '照数买补', effect: { taipu: -0.5, metric: { bianfang: 0.2 } } },
      {
        key: 'cha',
        label: '令查是否牧养失职',
        needsReading: true,
        note: '马死了，总要有人担',
        effect: { metric: { guanfeng: 1, bianfang: -0.2 }, energy: -1 },
      },
    ],
  }),
  { weight: 2.5, cooldown: 2 },
)

/* ══════════════════════════ 河工 ══════════════════════════ */

export const noRiver = def(
  'no-river',
  'routine',
  () => ({
    from: '总理河道',
    title: '为岁修河工、请银估销事',
    summary: '高家堰岁修，估银二万三千两，请动支河银。',
    body:
      `臣谨奏：高家堰岁修，估银二万三千两。\n\n` +
      `工程系旧例：帮堤、培土、植柳，每年一次。若不修，秋汛必决。`,
    piaoni: '着动支河银，照估兴修。',
    patience: 2,
    yiEffect: { taicang: -0.2, metric: { minxin: 0.05 } },
    ignoredEffect: { metric: { minxin: -0.4 } },
    options: [
      {
        key: 'yi',
        label: '照估兴修',
        effect: { taicang: -0.6, metric: { minxin: 0.2 } },
      },
      {
        key: 'jian',
        label: '令减半估修',
        needsReading: true,
        note: '省下的钱，秋汛来时要还',
        effect: { taicang: 0.3, metric: { minxin: -0.4 }, energy: -1 },
      },
    ],
  }),
  { weight: 2.5, cooldown: 2 },
)

/* ══════════════════════════ 朝贡 ══════════════════════════ */

export const noTribute = def(
  'no-tribute',
  'routine',
  (s) => {
    const who = ['朝鲜', '安南', '琉球', '暹罗'][s.turn % 4]
    return {
      from: '礼部尚书',
      title: '为属国遣使入贡、乞赐宴赏事',
      summary: `${who}遣使入贡，方物已验，请照例宴赏。`,
      body:
        `臣谨奏：${who}遣使入贡，方物已验。\n\n` +
        `使者三人，从人二十七。照例应宴一次、赏一次。` +
        `所费不过千金，而宾服之意在此。`,
      piaoni: '着照例宴赏。',
      patience: 2,
      yiEffect: { metric: { chaoshi: 0.05 } },
      ignoredEffect: { metric: { chaoshi: -0.2 } },
      options: [
        { key: 'yi', label: '照例宴赏', effect: { metric: { chaoshi: 0.3 } } },
        {
          key: 'hou',
          label: '厚赐之',
          needsReading: true,
          note: '多花一点，属国记情',
          effect: { taicang: -1, metric: { chaoshi: 0.8 }, energy: -1 },
        },
      ],
    }
  },
  { weight: 2, cooldown: 2 },
)

/* ══════════════════════════ 考语 ══════════════════════════ */

export const noAppraisal = def(
  'no-appraisal',
  'routine',
  () => ({
    from: '吏部尚书',
    title: '为月报官员考语、乞赐存案事',
    summary: '本月各省送到考语一百二十四员，已存案。',
    body:
      `臣谨奏：本月各省送到考语，计一百二十四员。\n\n` +
      `内称职者九十七，平常者二十一，不称职者六。` +
      `俱已存案，备三年考察之用。`,
    piaoni: '知道了。',
    patience: 2,
    yiEffect: { metric: { guanfeng: 0.05 } },
    ignoredEffect: { metric: { guanfeng: -0.2 } },
    options: [
      { key: 'yi', label: '知道了', effect: { metric: { guanfeng: 0.2 } } },
      {
        key: 'kan',
        label: '取不称职六人的考语来看',
        needsReading: true,
        note: '六个名字，也许有一个该罢',
        effect: { metric: { guanfeng: 1, chaoshi: -0.5 }, energy: -1 },
      },
    ],
  }),
  { weight: 2.5, cooldown: 2 },
)

/* ══════════════════════════ 刑名 ══════════════════════════ */

export const noJustice = def(
  'no-justice',
  'routine',
  () => ({
    from: '刑部尚书',
    title: '为具报重囚勾决、请旨定夺事',
    summary: '秋审重囚四十七人，情实者十九，请旨勾决。',
    body:
      `臣谨奏：本年秋审重囚四十七人。\n\n` +
      `情实者十九，缓决者二十一，可矜者七。` +
      `情实十九人，例应勾决。伏乞圣裁。`,
    piaoni: '着三法司再议。',
    patience: 2,
    yiEffect: { metric: { guanfeng: 0.05, minxin: -0.05 } },
    ignoredEffect: { metric: { guanfeng: -0.25 } },
    options: [
      {
        key: 'yi',
        label: '照拟勾决',
        effect: { metric: { guanfeng: 0.3, minxin: -0.3 } },
      },
      {
        key: 'huan',
        label: '勾其半，余缓决',
        needsReading: true,
        note: '少杀九个，多关九个',
        effect: { metric: { minxin: 0.6, guanfeng: -0.3 }, energy: -1 },
      },
    ],
  }),
  { weight: 2, cooldown: 2 },
)

/* ══════════════════════════ 织造 ══════════════════════════ */

export const noWeaving = def(
  'no-weaving',
  'routine',
  () => ({
    from: '苏杭织造太监',
    title: '为例进上用缎匹、乞赐验收事',
    summary: '上用缎匹一千二百匹织完，解进内库。',
    body:
      `奴才谨奏：上用缎匹一千二百匹，已织完，解进内库。\n\n` +
      `机户三百家，织了七个月。工价已给，不敢拖欠。`,
    piaoni: '知道了。',
    patience: 2,
    yiEffect: { metric: { chaoshi: 0.05 }, taicang: -0.05 },
    ignoredEffect: { metric: { chaoshi: -0.2 } },
    options: [
      { key: 'yi', label: '知道了', effect: { metric: { chaoshi: 0.2 }, taicang: -0.2 } },
      {
        key: 'jian',
        label: '减织三成，以省机户',
        needsReading: true,
        note: '宫里的用度，也不是不能减',
        effect: { metric: { minxin: 0.6, chaoshi: -0.3 }, energy: -1 },
      },
    ],
  }),
  { weight: 2, cooldown: 2 },
)

/** 例行公文：用来把案头填满，让「看不完」变成真的 */
export const NOISE_TEMPLATES = [
  noRain,
  noGrain,
  noHorse,
  noRiver,
  noTribute,
  noAppraisal,
  noJustice,
  noWeaving,
]
