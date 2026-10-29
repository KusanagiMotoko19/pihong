import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/** 四夷。这一类的本子少，但一本能改十年的局面 */

export const tributeArrive = def(
  'tribute-arrive',
  'routine',
  (s: WorldState) => {
    const p = s.powers.find((x) => x.id === 'joseon') ?? s.powers[0]
    return {
      from: '礼部主客司郎中',
      title: '为朝鲜国遣使入贡事',
      summary: '朝鲜国王李昖遣陪臣入贡，贡方物，并请赐《大明会典》一部。',
      body:
        `臣谨奏：朝鲜的陪臣到了，一行四十七人，在会同馆住下。\n\n` +
        `贡的方物：良马二十匹、貂皮五百张、人参二百斤、白苎布三十匹。` +
        `照例，该赏赉的赏赉，该回赐的回赐。臣已经拟了单子。\n\n` +
        `他们另外递了一个呈子，请赐《大明会典》一部。说本国礼制，多仿中朝，` +
        `没有这部书，办事没有凭据。臣查旧例，成化年间给过一次。\n\n` +
        `伏乞圣裁。`,
      piaoni: '依例赏赉，并准给《会典》一部。',
      secret: '礼部拟得很爽快。因为赏赉的银子从太仓出，人情却是礼部做的。',
      yiEffect: {
        power: { id: p.id, attitude: 4 },
        metrics: { chaoshi: 1 },
        log: '朝鲜入贡，依例赏赉，赐《会典》一部。',
      },
      patience: 8,
      options: [
        {
          key: 'yi',
          label: '依拟',
          effect: { power: { id: p.id, attitude: 4 }, metrics: { chaoshi: 1 }, log: '朝鲜入贡，依例赏赉。' },
        },
        {
          key: 'hou',
          label: '加厚赏赉，并赐敕褒奖',
          needsReading: true,
          note: '属国是要养的。养得贵，但它替你挡着东边',
          effect: {
            taicang: -1,
            power: { id: p.id, attitude: 10 },
            metrics: { chaoshi: 2 },
            energy: -1,
            log: '厚赏朝鲜，赐敕褒奖。陪臣叩谢，说本国世世为大明藩篱。',
          },
        },
        {
          key: 'jian',
          label: '减其赏，贡物折价入内库',
          needsReading: true,
          note: '省一笔。但属国的心，是用钱买的',
          effect: {
            taicang: 6,
            power: { id: p.id, attitude: -12 },
            metrics: { chaoshi: -1 },
            energy: -1,
            log: '减朝鲜赏赉，贡物折价入内库。陪臣辞行时，礼数一分不差。',
          },
        },
      ],
    }
  },
  { weight: 1, cooldown: 24 },
)

export const marketAsk = def(
  'market-ask',
  'routine',
  (s: WorldState) => {
    const p = s.powers.find((x) => x.id === 'tumed')!
    return {
      from: '宣大总督',
      title: '为虏王请增马市事',
      summary: '顺义王俺答请于大同、宣府增开马市三处，并乞加赏赉。',
      body:
        `臣谨奏：顺义王俺答那边递了话，说想多开三处马市。\n\n` +
        `如今的市，一年两回，一回半月。他们的马、皮、盐，换我们的布、锅、茶。` +
        `换得好，边墙上的草就长得高；换得不好，就有人越墙。\n\n` +
        `俺答今年六十多了。他活着，这边就太平；他死了，他那几个儿子谁服谁，` +
        `臣不敢想。\n\n` +
        `臣请许他开市，再给他加一点赏。花几万两，买几年安生。这笔账，臣算得过来。`,
      piaoni: '兵部看议。',
      secret: '兵部里分两派。一派说该给，一派说给了就是示弱。这道票拟两边都没得罪——所以什么也没说。',
      yiEffect: {
        taicang: -1,
        power: { id: p.id, attitude: 8, threat: -3 },
        metrics: { bianfang: 2, chaoshi: 1 },
        log: '许土默特增开马市三处，加赏赉。',
      },
      patience: 6,
      ignoredEffect: {
        power: { id: p.id, attitude: -8, threat: 3 },
        metrics: { bianfang: -1 },
        log: '请开马市的疏留中。俺答那边等了两个月，没有回话。',
      },
      options: [
        {
          key: 'yi',
          label: '依拟',
          effect: {
            taicang: -1,
            power: { id: p.id, attitude: 8, threat: -3 },
            metrics: { bianfang: 2 },
            log: '许增马市。',
          },
        },
        {
          key: 'ju',
          label: '不许：马市一开，边备就弛',
          needsReading: true,
          note: '这话有一半道理。另一半是：不打仗，兵就不会打仗',
          effect: {
            power: { id: p.id, attitude: -14, threat: 6 },
            metrics: { bianfang: -1, chaoshi: 1 },
            energy: -1,
            log: '诏不许增市。宣大总督回奏：虏使去时，一句话没说。',
          },
        },
        {
          key: 'huan',
          label: '许市，但要他们交出逃人',
          needsReading: true,
          note: '换点实在的。面上也好看',
          effect: {
            taicang: -1,
            power: { id: p.id, attitude: 2 },
            metrics: { bianfang: 3, chaoshi: 1 },
            energy: -1,
            log: '许开马市，令其交出边民逃人二百余口。俺答照办了。',
          },
        },
      ],
    }
  },
  { weight: 1, cooldown: 18 },
)

export const vassalPlea = def(
  'vassal-plea',
  'urgent',
  () => ({
    from: '礼部主客司',
    title: '为属国告急、乞发兵援救事',
    summary: '日本关白丰臣秀吉调兵十万，声言假道朝鲜入犯。朝鲜遣使哭诉求援。',
    body:
      `臣谨奏：朝鲜的使臣跪在礼部门外，不肯起来。\n\n` +
      `他说：日本的本多、小西这些将，已经在対马岛上聚兵。关白丰臣秀吉发的话是` +
      `「假道入明」。朝鲜不肯借道，日本就要打过来。\n\n` +
      `臣问他，日本有多少兵。他说，十万。\n\n` +
      `臣当时没有说话。我朝在辽东的兵，额八万，实六万。\n\n` +
      `朝鲜是我朝二百年的藩篱。藩篱破了，门就露出来了。\n\n` +
      `臣不敢拟。此事关乎东陲大局，伏乞圣断。`,
    piaoni: '兵部会同辽东巡抚议。',
    yiEffect: {
      metrics: { chaoshi: -1, bianfang: -1 },
      power: { id: 'japan', threat: 8 },
      flags: { korea_crisis: 1 },
      log: '朝鲜告急，命兵部议。议了半个月，议出一个「相机行事」。',
    },
    patience: 3,
    ignoredEffect: {
      metrics: { bianfang: -4, chaoshi: -2 },
      power: { id: 'japan', threat: 15, attitude: -20 },
      log: '朝鲜的求救留中。使臣在会同馆又住了一个月，最后是哭着走的。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: {
          metrics: { chaoshi: -1, bianfang: -1 },
          power: { id: 'japan', threat: 6 },
          flags: { korea_crisis: 1 },
          log: '命兵部议朝鲜事。',
        },
      },
      {
        key: 'yuan',
        label: '先发辽东兵五千，助其守御',
        needsReading: true,
        note: '先给一点。让日本人知道这边不是不管',
        effect: {
          taicang: -6,
          metrics: { bianfang: 3, chaoshi: 2 },
          power: { id: 'japan', threat: -6, attitude: -10 },
          flags: { korea_help: 1 },
          energy: -1,
          log: '发辽东兵五千往援朝鲜。渡江那日，朝鲜百姓跪在道边。',
        },
      },
      {
        key: 'guan',
        label: '严守辽东，不发兵',
        needsReading: true,
        note: '道理上讲得通。可藩篱破了，门就露出来',
        effect: {
          taicang: -2,
          metrics: { bianfang: 1, chaoshi: -2 },
          power: { id: 'japan', threat: 10 },
          energy: -1,
          log: '诏严守辽东，不发援兵。朝鲜的使臣在礼部大堂上哭出了声。',
        },
      },
    ],
  }),
  { when: (s) => s.date.year >= 1588 && s.flags.korea_crisis !== 1, cooldown: 999 },
)

export const tusiRebel = def(
  'tusi-rebel',
  'urgent',
  (s: WorldState) => {
    const p = s.powers.find((x) => x.id === 'bozhou')!
    return {
      from: '四川巡抚',
      title: '为播州杨应龙骄蹇不法、请旨剿抚事',
      summary: '播州宣慰使杨应龙杀妻屠妾，蓄甲练兵，贵州抚臣请讨之。',
      body:
        `臣谨奏：播州的杨应龙，越来越不像话了。\n\n` +
        `他在州里修海龙屯，九关九门，比卫城的墙还高。养苗兵上万，` +
        `打造军器，日夜不息。前年他杀了自己的妻子，连妾一起，` +
        `手段之惨，臣不忍写。\n\n` +
        `贵州的抚臣上了疏，请讨。四川的官员多半说不要讨——` +
        `播州八百年，从唐朝就是杨家的，一讨，西南就乱了。\n\n` +
        `臣在四川三年。臣以为：他不是要反，他是在等。等一个我们顾不上他的时候。`,
      piaoni: '着四川、贵州抚臣会同勘议。',
      yiEffect: {
        metrics: { chaoshi: -1 },
        power: { id: p.id, threat: 4 },
        log: '播州事着川贵会勘。勘了一年，勘出一份「别无逆迹」的奏报。',
      },
      patience: 4,
      ignoredEffect: {
        power: { id: p.id, threat: 8, strength: 3 },
        metrics: { chaoshi: -1 },
        log: '播州的疏留中。杨应龙那边，又多修了两道关。',
      },
      options: [
        {
          key: 'yi',
          label: '依拟（会勘）',
          effect: {
            metrics: { chaoshi: -1 },
            power: { id: p.id, threat: 3 },
            log: '着川贵会勘。',
          },
        },
        {
          key: 'kan',
          label: '令其献地、质子、纳赎',
          needsReading: true,
          note: '先礼后兵。给他一个台阶，也给自己一个准备的时间',
          effect: {
            taicang: 8,
            power: { id: p.id, attitude: 6, threat: -4 },
            metrics: { chaoshi: 1 },
            energy: -1,
            log: '令杨应龙献地、质子、纳赎银八万两。他都照办了，办得极恭顺。',
          },
        },
        {
          key: 'jiao',
          label: '即调兵进剿',
          needsReading: true,
          note: '打。可西南的山，进去容易出来难',
          effect: {
            taicang: -10,
            power: { id: p.id, attitude: -30, threat: -10, strength: -8 },
            metrics: { chaoshi: -1, minxin: -1 },
            flags: { bozhou_war: 1 },
            energy: -1,
            log: '调川贵兵进剿播州。三个月，破了两个囤，折了三千人。',
          },
        },
      ],
    }
  },
  { when: (s) => s.date.year >= 1585, cooldown: 30 },
)

export const FOREIGN_TEMPLATES = [tributeArrive, marketAsk, vassalPlea, tusiRebel]
