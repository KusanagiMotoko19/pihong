import { def } from '../../engine/events'
import { wan } from '../../engine/util'
import type { WorldState } from '../../engine/types'

/** 钱粮。这一类的本子最多，也最容易被依拟打发了 */

export const hubuRoutine = def(
  'hubu-routine',
  'routine',
  (s: WorldState) => ({
    from: '户部尚书',
    title: '为恭报旬月钱粮出纳事',
    summary: `太仓见存${wan(s.taicang)}，本旬入十一万一千两，出十一万七千两。`,
    body:
      `臣谨奏：本旬各处解到太仓的银，合十一万一千两挂零；放出去的，京官俸折、九边年例、` +
      `各衙门公费，合十一万七千两。库里现存${wan(s.taicang)}。\n\n` +
      `臣不多说。只把这一个数摆在这里：入的比出的少六千两。一旬少六千，一年就是二十万。\n\n` +
      `臣职在钱谷，看见这个数，夜里睡不着。可是臣能想的法子都想过了——` +
      `加派，百姓受不了；裁减，边军要闹。臣只能把这个数报上来，请皇上圣裁。`,
    piaoni: '户部知道。',
    secret: '「知道」二字是司礼监代批的。这三个字的意思是：皇上知道了，不必办。',
    yiEffect: {},
    patience: 4,
    ignoredEffect: {
      metrics: { guanfeng: -1 },
      log: '户部的旬报压在案上。尚书在文华门外站了半个时辰，没等到回话。',
    },
    options: [
      { key: 'yi', label: '依拟', effect: {} },
      {
        key: 'cha',
        label: '令户部开列九边年例细数',
        needsReading: true,
        note: '你想知道这三百多万两，究竟花在哪一处',
        effect: {
          metrics: { bianfang: 1 },
          flags: { edge_account: 1 },
          energy: -1,
          log: '命户部开列九边年例细数。几日后，一本厚册子送到案头，比奏疏厚十倍。',
        },
      },
      {
        key: 'jian',
        label: '令有司核实各省逋欠',
        needsReading: true,
        note: '考成压着，逋欠仍有一百几十万。你要看看是真欠，还是假的',
        effect: {
          taicang: 12,
          metrics: { guanfeng: -1, minxin: -1 },
          energy: -1,
          log: '命核实各省逋欠，追解旧欠十二万两。州县有因此敲扑致毙的，没人敢往上说。',
        },
      },
    ],
  }),
  { weight: 2, cooldown: 14 },
)

export const neifuAsk = def(
  'neifu-ask',
  'routine',
  () => ({
    from: '司礼监掌印太监',
    title: '为恭请内府用度事',
    summary: '慈宁宫修缮、册封典礼、内操马匹刍料，请发太仓银四十万两。',
    body:
      `奴才谨奏：有三笔钱，得请皇上的旨。\n\n` +
      `一、慈宁宫西配殿的梁朽了，工部估过，修要二十二万两。圣母住着，奴才不敢拖。\n` +
      `二、皇长子的册封礼，连赏赐，约十万两。这是国朝的大典，简不得。\n` +
      `三、内操的马，刍料一年加七万两。\n\n` +
      `合起来四十万。奴才也知道太仓紧，可这三笔，一笔也省不下来。\n\n` +
      `伏乞圣慈允行。`,
    piaoni: '着户部查议具奏。',
    secret: '这道票拟在户部压了三天。尚书在等圣母那边先开口——他知道这钱躲不掉，只想躲过这一次。',
    yiEffect: {
      taicang: -7,
      metrics: { chaoshi: 1, guanfeng: -1 },
      log: '内府请银四十万，户部覆奏太仓不足，请减半。遂发二十万。',
    },
    patience: 3,
    ignoredEffect: {
      metrics: { chaoshi: -1 },
      log: '内府请银的疏留中。慈宁宫的工匠，停了一半。圣母问了一句，没人敢答。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: { taicang: -7, metrics: { chaoshi: 1, guanfeng: -1 }, log: '发太仓银二十万两给内府。' },
      },
      {
        key: 'nei',
        label: '发内帑十万，不动太仓',
        needsReading: true,
        note: '你自己的钱袋。动了，就少一层退路',
        effect: {
          neitang: -4,
          metrics: { guanfeng: 2, chaoshi: 1 },
          flags: { frugal: 1 },
          energy: -1,
          log: '发内帑十万给内府，不动太仓。户部听说了，颇感圣德。',
        },
      },
      {
        key: 'jian',
        label: '减半，只给二十万',
        needsReading: true,
        note: '省钱。但圣母那里不好交代',
        effect: {
          taicang: -3,
          metrics: { chaoshi: -1, guanfeng: 1 },
          flags: { empress_dowager: -1 },
          energy: -1,
          log: '内府请银减半，只发八万。掌印领旨的时候，眼皮抬了一下。',
        },
      },
    ],
  }),
  { weight: 2, cooldown: 16 },
)

export const arrears = def(
  'arrears',
  'routine',
  () => ({
    from: '户科都给事中',
    title: '为各省逋欠数多、乞严核事',
    summary: '天下逋欠银一百四十七万两，其中三成为灾伤蠲免，余皆拖欠。',
    body:
      `臣谨奏：户部报上来的数，天下逋欠一百四十七万两。\n\n` +
      `臣把这个数拆开看了一遍。三成是灾伤蠲免，该蠲；剩下七成，一百万挂零，是拖欠。\n\n` +
      `拖欠的里头，又有两种：一种是真穷，县里连衙门都塌了；一种是假穷，` +
      `大户把田寄在举人名下，赋就免了，剩下的小户替他分摊，分不起，就欠着。\n\n` +
      `臣请严核。可臣也说一句实话：核的人若是本县知县，他核不出来；` +
      `若是本府知府，他不想核。得派别处的人去。`,
    piaoni: '着户部议。',
    yiEffect: {
      taicang: 8,
      metrics: { minxin: -1 },
      log: '户部议覆，追解逋欠八万两。',
    },
    patience: 4,
    options: [
      { key: 'yi', label: '依拟', effect: { taicang: 8, metrics: { minxin: -1 } } },
      {
        key: 'yan',
        label: '遣御史分道严核',
        needsReading: true,
        note: '派别处的人去。查得清楚，也得罪得干净',
        effect: {
          taicang: 22,
          metrics: { guanfeng: 2, minxin: -1, chaoshi: -1 },
          energy: -1,
          log: '遣御史八人分道核逋欠，追解二十二万两。有知县因此自尽的。',
        },
      },
      {
        key: 'mian',
        label: '尽行蠲免，以示宽大',
        needsReading: true,
        note: '一百万两，换一个「宽仁」的名声',
        effect: {
          metrics: { minxin: 6, guanfeng: -1, chaoshi: 2 },
          flags: { tax_forgiven: 1 },
          energy: -1,
          log: '诏蠲天下逋欠。百姓欢呼，户部尚书在衙门里坐了一夜。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 16 },
)

export const kaikuang = def(
  'kaikuang',
  'routine',
  () => ({
    from: '内官监太监',
    title: '为开采矿课、以佐国用事',
    summary: '请遣内臣分赴各省开采银矿，岁可得银数十万两。',
    body:
      `奴才谨奏：如今太仓紧，边饷欠，奴才看着心里急。\n\n` +
      `天下的山里头，有银矿。江西、浙江、福建、云南，都有。前朝开过，本朝也有开的。` +
      `若是遣内臣分头去办，一年弄个几十万两，不算难事。\n\n` +
      `奴才也知道，这事有人要说闲话。可奴才想，银子是死的，人是活的。` +
      `矿在那里，不开，它也不会自己长出来。`,
    piaoni: '着户部、工部会议。',
    secret: '拟这道票拟的是内官监的秉笔。开矿的话，是他自己在朝会上先递的话头。',
    yiEffect: {
      taicang: 15,
      metrics: { minxin: -3, guanfeng: -1 },
      flags: { mining: 1 },
      log: '遣内臣开采矿课。第一年解进银十五万两，地方上闹了几场。',
    },
    patience: 5,
    ignoredEffect: {
      metrics: { chaoshi: -1 },
      log: '矿课的疏留中。内官监没有再提。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: {
          taicang: 15,
          metrics: { minxin: -3, guanfeng: -1 },
          flags: { mining: 1 },
          log: '遣内臣开矿。',
        },
      },
      {
        key: 'bu',
        label: '不许：矿使一出，天下骚然',
        needsReading: true,
        note: '你听过前朝矿使的事。那些人下去，不是去开矿的',
        effect: {
          metrics: { minxin: 4, guanfeng: 2, chaoshi: 1 },
          flags: { mining_refused: 1 },
          energy: -1,
          log: '诏不许开矿。内官监的太监退下时，脸色不太好看。',
        },
      },
      {
        key: 'xian',
        label: '限定三处，由抚按监之',
        needsReading: true,
        note: '开一点，但不由内臣独办。折中，也未必管得住',
        effect: {
          taicang: 6,
          metrics: { minxin: -1, guanfeng: -1 },
          flags: { mining: 1 },
          energy: -1,
          log: '许开矿三处，命抚按监之。内臣和地方官互相看着，谁也不肯多干。',
        },
      },
    ],
  }),
  { weight: 1, cooldown: 20 },
)

export const caoliang = def(
  'caoliang',
  'routine',
  () => ({
    from: '漕运总督',
    title: '为漕粮改折、仓廪不足事',
    summary: `漕河浅涩，粮船阻滞。请改折漕粮三十万石，每石折银五钱，计十五万两。`,
    body:
      `臣谨奏：今岁漕河的水浅，济宁以北，粮船过不去，堵了一千二百只。\n\n` +
      `臣在河上守了二十天，看着船一天一天往下沉。船上的米，再放就霉了。\n\n` +
      `臣请改折三十万石，每石折银五钱，共十五万两，解太仓。剩下的七十万石，` +
      `想法子从陆路接运。陆路贵，一石要多花二钱。\n\n` +
      `臣不敢瞒皇上：这一改折，京师的仓就薄了。明年青黄不接的时候，怕是要紧。`,
    piaoni: '户部看议。',
    yiEffect: {
      taicang: 15,
      metrics: { minxin: -1 },
      log: '漕粮改折三十万石，解银十五万两入太仓。',
    },
    patience: 4,
    ignoredEffect: {
      taicang: -2,
      metrics: { minxin: -1 },
      log: '漕粮改折的疏留中。一千二百只粮船在河上又等了半月，米霉了三成。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: { taicang: 15, metrics: { minxin: -1 }, log: '漕粮改折，解银入太仓。' },
      },
      {
        key: 'lu',
        label: '不许改折，令陆路接运',
        needsReading: true,
        note: '仓廪是京师的命。可陆路一石多花二钱，这钱谁出',
        effect: {
          taicang: -3,
          metrics: { minxin: 1, chaoshi: 2 },
          flags: { grain_ok: 1 },
          energy: -1,
          log: '不许改折，令陆路接运。多花了八万两，京仓的米一粒没少。',
        },
      },
    ],
  }),
  { weight: 2, cooldown: 12 },
)

export const FINANCE_TEMPLATES = [hubuRoutine, neifuAsk, arrears, kaikuang, caoliang]
