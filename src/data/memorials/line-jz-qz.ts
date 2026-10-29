import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 建州线。万历十一年起兵，到十五年已成气候。
 *
 * 这条线的用意：朝中没有一个人把它当回事，包括你。
 * 每一本奏疏都说「一部酋耳」「不足虑」，每一本都比上一本更严重一点。
 * 你要到很久以后才知道，那几句话是这五年里最要紧的。
 */

/* ══════════════════ 万历十三年：兼并 ══════════════════ */

export const jzMerge = def(
  'jz-merge',
  'routine',
  (s: WorldState) => {
    const watched = !!s.flags.jianzhou_watched || !!s.flags.jianzhou_divide
    return {
      from: '辽东巡抚 顾养谦',
      title: '为建州夷酋兼并诸部、势渐猖獗事',
      summary: '努尔哈赤已并苏克素护、哲陈、董鄂三部，部众三千。',
      body:
        `臣谨奏：建州左卫都指挥使努尔哈赤，两年之间并苏克素护、哲陈、董鄂三部。\n\n` +
        `今其部众三千，马五百。所居费阿拉，筑城三层。\n\n` +
        (watched
          ? `臣前年遣人往探，得其情：此人善用人，所得之地，不掠不杀，` +
            `旧部酋长皆留其位，只令纳贡。故诸部多愿归之。\n\n`
          : `臣未得其详。边外之事，往时只凭哨探一言，此亦如常年。\n\n`) +
        `臣以为：此人非王杲、王台之比。王杲暴，故诸部叛之；此人宽，故诸部附之。\n\n` +
        `今其势尚小，然若再并数部，恐非辽东一镇之力所能制。\n\n` +
        `臣请早为之所。`,
      piaoni: '着辽东巡抚相机抚剿，毋使滋蔓。',
      secret:
        '「相机」二字，就是没有定策。辽东的兵册上八万，实有四万；' +
        '四万里能战的三千。这三千，还要留着防西虏。',
      patience: 6,
      yiEffect: { metric: { bianfang: -1 } },
      ignoredEffect: { metric: { bianfang: -4 }, flags: { jz_ignored: 1 } },
      options: [
        {
          key: 'pacify',
          label: '抚之。给敕书、开马市',
          note: '花钱买平安。他会不会拿这笔钱养兵，看你赌不赌',
          effect: {
            ledger: { taicang: -6 },
            metric: { bianfang: 3 },
            flags: { jz_pacified: 1 },
          },
        },
        {
          key: 'strike',
          label: '调兵三千，趁其未大先剿',
          note: '打得赢一时。打不赢，就是给他送名声',
          effect: {
            ledger: { taicang: -26 },
            metric: { bianfang: -2, chaoshi: -2 },
            flags: { jz_struck: 1 },
          },
        },
        {
          key: 'ignore',
          label: '边外小夷，不必理会',
          note: '省下的钱，六年后要用十倍还',
          effect: { metric: { bianfang: -6 }, flags: { jz_ignored2: 1 } },
        },
      ],
    }
  },
  { weight: 0, cooldown: 999, line: 'jz', when: (s) => s.turn >= 100 },
)

/* ══════════════════ 万历十五年：筑城称王 ══════════════════ */

export const jzCity = def(
  'jz-city',
  'urgent',
  (s: WorldState) => {
    const strong = !s.flags.jz_pacified && !s.flags.jz_struck
    const pacified = !!s.flags.jz_pacified

    return {
      from: '辽东巡抚 顾养谦',
      title: '为建州夷酋筑城称王、边患已成事',
      summary: strong
        ? '努尔哈赤筑费阿拉城，部众逾万，诸部皆听其令。'
        : pacified
          ? '努尔哈赤受敕书后，仍筑城练兵，马市之利尽以养兵。'
          : '官军一剿之后，努尔哈赤反并数部，兵逾五千。',
      body:
        `臣谨奏：建州之势，四年之间，已非复当年。\n\n` +
        (strong
          ? `今其部众逾万，马三千。筑费阿拉城，内城三层，外城五里。` +
            `建州五部，皆听其号令。又招抚东海诸部，得貂皮、人参之利。\n\n` +
            `其自称「淑勒贝勒」，用兵有法，赏罚分明。叶赫部来告：` +
            `「此人志不在建州。」\n\n`
          : pacified
            ? `臣查其马市所得，尽以市铁、市布、市火药。其部虽受敕书，` +
              `然筑城练兵不辍。今年春，又并鸭绿江一部。\n\n` +
              `臣前年请抚，是不得已 —— 彼时辽东无可用之兵。今则不然。\n\n`
            : `臣前年请剿，调兵三千，斩首二百，焚其寨三。\n\n` +
              `然此人未死。反而以「官军杀我父祖，今又杀我部众」为辞，` +
              `诸部皆愤，归之者愈众。今其兵逾五千，比前年更盛。\n\n`) +
        `臣不敢再言「相机」二字。请皇上明示：是战，是和，是守？`,
      piaoni: '着兵部会同辽东总督，详议具奏。',
      secret:
        '兵部会拖。拖到明年，这个人会自己给出答案 —— ' +
        '只是那个答案，要由下一任辽东巡抚来报。',
      patience: 3,
      yiEffect: { metric: { bianfang: -3 } },
      ignoredEffect: { metric: { bianfang: -8, chaoshi: -3 } },
      options: [
        {
          key: 'war',
          label: '战。调九边精兵，一举荡平',
          note: '花钱如流水，赢了是万历武功，输了是萨尔浒的前身',
          effect: {
            ledger: { taicang: -60 },
            metric: { bianfang: 4, minxin: -4, chaoshi: -4 },
            flags: { jz_war: 1 },
          },
        },
        {
          key: 'divide2',
          label: '分而治之。厚叶赫，使其相攻',
          note: '老办法。管用二十年',
          effect: {
            ledger: { taicang: -14 },
            metric: { bianfang: 6 },
            flags: { jz_divided: 1 },
          },
        },
        {
          key: 'guard',
          label: '守。修边墙、练火器，不主动出兵',
          note: '认了这个邻居。守住现有边界',
          effect: {
            ledger: { taicang: -22 },
            metric: { bianfang: 3, chaoshi: 2 },
            flags: { jz_guarded: 1 },
          },
        },
      ],
    }
  },
  { weight: 0, cooldown: 999, line: 'jz2', when: (s) => s.turn >= 168 },
)

/* ══════════════════ 清丈收尾 ══════════════════ */

export const qzFinal = def(
  'qz-final',
  'project',
  (s: WorldState) => {
    const p = s.projects.find((x) => x.id === 'qingzhang')
    const rep = Math.round(p?.reported ?? 0)
    return {
      from: '户部尚书',
      title: '为清丈告竣、天下田额已定、请旨遵行事',
      summary: `天下田土丈过${rep}分，新额七百零一万顷，请旨：永为定制，还是留有馀地。`,
      body:
        `臣谨奏：清丈之役，自万历八年始，至今五年。\n\n` +
        `各省报册齐至，天下田土共七百零一万三千九百七十六顷。` +
        `比之万历六年，增一百八十余万顷 —— 此皆隐占之数，今尽入册。\n\n` +
        `臣请二事：\n\n` +
        `一、此额永为定制，刊入《赋役全书》，各省不得增减。\n\n` +
        `二、新额既定，请即以新额编派一条鞭法，赋役归一，计亩征银。\n\n` +
        `臣知此事体大。田额一刊定，则天下田赋，自此有账可查；` +
        `有账可查，则隐占者无所遁形。然亦自此不可再改 —— ` +
        `改一次，天下震动一次。`,
      piaoni: '着户部刊定《赋役全书》，颁行天下。',
      secret:
        '这本是王国光写的，写完他就上疏乞休了。' +
        '他说：「臣办此五年，得罪人无数。今事已竣，请归。」' +
        '他知道：账一刊定，他就是那个把账做出来的人，往后所有的怨，都记在他名下。',
      patience: 4,
      yiEffect: { ledger: { taicang: 20 }, metric: { minxin: -3 } },
      ignoredEffect: { metric: { guanfeng: -4 }, ledger: { taicang: -10 } },
      options: [
        {
          key: 'fix',
          label: '永为定制，即编一条鞭',
          note: '账定死了，赋役归一。得罪的人在暗处等着',
          effect: {
            ledger: { taicang: 30 },
            metric: { minxin: -5, guanfeng: -2, chaoshi: 3 },
            statutes: { yitiaobian: true },
            flags: { qz_fixed: 1 },
          },
        },
        {
          key: 'loose',
          label: '刊定而不即编，各省酌行',
          note: '留个口子。各省会按对自己有利的办法来',
          effect: {
            ledger: { taicang: 12 },
            metric: { chaoshi: 2 },
            flags: { qz_loose: 1 },
          },
        },
        {
          key: 'pause',
          label: '暂缓。此事待考成之后再议',
          note: '拖。五年之功，悬在半空',
          effect: { metric: { guanfeng: -5, minxin: 2 }, flags: { qz_paused: 1 } },
        },
      ],
    }
  },
  { weight: 0, cooldown: 999, line: 'qz2', when: (s) => s.turn >= 90 },
)

export const LINE_JZ_QZ = [jzMerge, jzCity, qzFinal]
