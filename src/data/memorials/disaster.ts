import { def } from '../../engine/events'

/** 天灾。老天爷不管你有没有钱，该来就来 */

export const drought = def(
  'drought',
  'urgent',
  () => ({
    from: '山东巡抚',
    title: '为东省大旱、民饥请赈事',
    summary: '济南、兖州、东昌三府自春不雨，麦禾尽枯，饥民流徙，请发帑金十万两。',
    body:
      `臣谨奏：山东今年，从三月到六月，一场雨没下。\n\n` +
      `臣从济南往南走，走了七个县。路边的树，皮都被剥光了。` +
      `有妇人抱着孩子坐在门口，孩子不哭，也不动。臣问了一句，她说不出来话。\n\n` +
      `斗米已经涨到一钱五分。仓里是空的。\n\n` +
      `臣请发帑金十万，并蠲免本年秋粮。臣也知道太仓紧。可臣若不说这一句，` +
      `明年这个时候，山东就没有人了。\n\n` +
      `臣不胜激切待命之至。`,
    piaoni: '户部看议。',
    secret: '户部拟「看议」二字，是等山东巡抚先报实数。可巡抚的实数，也在等户部的口风。',
    yiEffect: {
      taicang: -2,
      metrics: { minxin: -1 },
      log: '山东灾伤，户部看议，发银六万两。饥民没散，也没再闹。',
    },
    patience: 2,
    ignoredEffect: {
      taicang: -1,
      metrics: { minxin: -4, chaoshi: -2 },
      flags: { unrest: 1 },
      log: '山东请赈的疏留中。两个月后，沂州有饥民数千，掠富室，据山自保。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: { taicang: -2, metrics: { minxin: -1 }, log: '发银六万赈山东。' },
      },
      {
        key: 'da',
        label: '大发帑金十万，并蠲秋粮',
        needsReading: true,
        note: '钱从太仓出。你今年本来就亏',
        effect: {
          taicang: -5,
          metrics: { minxin: 7, chaoshi: 2 },
          flags: { shandong_ok: 1 },
          energy: -1,
          log: '大发帑金十万赈山东，并蠲本年秋粮。饥民渐渐归乡。',
        },
      },
      {
        key: 'cha',
        label: '先遣御史核实，再议',
        needsReading: true,
        note: '稳妥。可饥民等不了公文',
        effect: {
          metrics: { minxin: -2, guanfeng: 1 },
          energy: -1,
          log:
            '遣御史核实山东灾情。御史走到德州，饥民已经散了大半——' +
            '有的去了河南，有的上了山。',
        },
      },
    ],
  }),
{ weight: 1, cooldown: 45 },
)

export const flood = def(
  'flood',
  'urgent',
  () => ({
    from: '总理河道',
    title: '为河决高家堰、乞帑金修守事',
    summary: '伏秋大汛，高家堰冲决三处，共长一百二十丈。请发银十五万两及时兴工。',
    body:
      `臣谨奏：高家堰，决了。\n\n` +
      `伏秋的汛下来，堰身冲开三处，合起来一百二十丈。臣带了人在堤上守了七天七夜，` +
      `拿身子堵不住水。\n\n` +
      `现在的水，是从堰外灌进淮扬的。淮安、扬州、高邮、宝应，七个州县，` +
      `已经有一半泡在里面。\n\n` +
      `臣要十五万两。十月内兴工，还来得及。要是拖到明年汛期，就不是十五万的事了。\n\n` +
      `臣在河边干了二十年。臣说一句：这条河，你不给它钱，它就要你的城。`,
    piaoni: '工部看议。',
    yiEffect: {
      taicang: -3,
      metrics: { minxin: -1 },
      log: '河工请银，工部看议，发八万两。堤修了一半。',
    },
    patience: 2,
    ignoredEffect: {
      metrics: { minxin: -4 },
      taicang: -4,
      flags: { flood: 1 },
      log: '河工的疏留中。次年春汛，高家堰再决，淮扬数县被水。',
    },
    options: [
      { key: 'yi', label: '依拟', effect: { taicang: -3, metrics: { minxin: -1 } } },
      {
        key: 'quan',
        label: '全给十五万，限十月兴工',
        needsReading: true,
        note: '治河的人提的要求，通常是对的，也通常是贵的',
        effect: {
          taicang: -5,
          metrics: { minxin: 5, chaoshi: 2 },
          flags: { river_ok: 1 },
          energy: -1,
          log: '发银十五万修高家堰，限十月兴工。河道总督亲自督工。',
        },
      },
      {
        key: 'ba',
        label: '罢河道总督，另简能员',
        needsReading: true,
        note: '他是张居正用的人。换掉他，言官会高兴',
        effect: {
          metrics: { chaoshi: 3, minxin: -1, guanfeng: -1 },
          flags: { river_boss_out: 1 },
          energy: -1,
          log: '罢河道总督。新任的到任三个月，还没看完河图。',
        },
      },
    ],
  }),
{ weight: 1, cooldown: 50 },
)

export const locustPlague = def(
  'locust-plague',
  'urgent',
  () => ({
    from: '河南巡抚',
    title: '为飞蝗蔽天、疫气流行、请蠲赈事',
    summary: '河南八府蝗，食禾殆尽；继以疫，死者相枕。请蠲本年钱粮，发银赈济。',
    body:
      `臣谨奏：河南今年，先旱，后蝗，最后是疫。\n\n` +
      `蝗来的时候，遮了天。臣在开封城头站着，看见一片黄云从西边过来，落在田里，` +
      `一炷香的工夫，一亩地的禾就没了。\n\n` +
      `百姓打蝗，打不过来。有人跪在田里哭。\n\n` +
      `蝗过了，疫就来了。城里每天抬出去的，三十、五十。\n\n` +
      `臣请蠲免本年钱粮，再发银赈济。臣知道国库紧，臣不敢多要。可这一回，` +
      `河南是真的撑不住了。`,
    piaoni: '户部看议。',
    yiEffect: {
      taicang: -3,
      metrics: { minxin: -2 },
      log: '河南蝗疫，蠲免钱粮，发银八万。',
    },
    patience: 2,
    ignoredEffect: {
      metrics: { minxin: -4, chaoshi: -2 },
      log: '河南的疏留中。年底报上来，八府流民四十余万。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟',
        effect: { taicang: -3, metrics: { minxin: -2 }, log: '河南蠲赈。' },
      },
      {
        key: 'da',
        label: '尽蠲三年积欠，并遣官督赈',
        needsReading: true,
        note: '一笔勾销。河南百姓会记住，户部会肉疼',
        effect: {
          taicang: -6,
          metrics: { minxin: 8, chaoshi: 3, guanfeng: 1 },
          flags: { henan_ok: 1 },
          energy: -1,
          log: '尽蠲河南三年积欠，遣户部侍郎督赈。河南人立了生祠。',
        },
      },
      {
        key: 'bu',
        label: '只发银，不蠲',
        needsReading: true,
        note: '赈是救急，蠲是减收。你今年亏不起',
        effect: {
          taicang: -1,
          metrics: { minxin: -1, chaoshi: -1 },
          energy: -1,
          log: '只发银四万，不蠲钱粮。河南巡抚回奏，说「民有怨言」。',
        },
      },
    ],
  }),
{ weight: 1, cooldown: 65 },
)

export const earthquake = def(
  'earthquake',
  'routine',
  () => ({
    from: '钦天监监正',
    title: '为星变地震、乞修省事',
    summary: '京师地震，声如雷，自西北来。占曰：臣道太盛，宜修省。',
    body:
      `臣谨奏：本月十七日戌时，京师地震。声自西北来，如万马奔，屋瓦皆动。` +
      `臣在观象台上，站都站不稳。\n\n` +
      `臣查占书：地震，臣道太盛之象；西北来者，兵象。\n\n` +
      `臣不敢妄言祸福。可祖宗之制，遇灾异则修省，下诏罪己，广开言路。` +
      `这不是虚文。这是让天下人看见，皇上怕天。\n\n` +
      `臣请下诏修省。`,
    piaoni: '知道了。着礼部议。',
    yiEffect: {
      metrics: { chaoshi: 2, guanfeng: 1 },
      log: '地震，下诏修省。',
    },
    patience: 6,
    ignoredEffect: {
      metrics: { chaoshi: -1 },
      log: '星变的疏留中。钦天监没有再提。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（下诏修省）',
        effect: { metrics: { chaoshi: 2, guanfeng: 1 }, log: '下诏修省，广开言路。' },
      },
      {
        key: 'zui',
        label: '下罪己诏，并蠲免灾伤州县',
        needsReading: true,
        note: '皇帝的自我批评。说一次管用，说多了就不值钱',
        effect: {
          taicang: -2,
          metrics: { minxin: 5, chaoshi: 4, guanfeng: 2 },
          flags: { edict_blame: 1 },
          energy: -1,
          log: '下罪己诏，蠲免灾伤州县钱粮。诏书发到各省，有老儒读之而泣。',
        },
      },
      {
        key: 'chi',
        label: '斥其妄言，切责钦天监',
        needsReading: true,
        note: '天象归天象。可是天下人不这么想',
        effect: {
          metrics: { chaoshi: -2, guanfeng: -1 },
          flags: { silence_omen: 1 },
          energy: -1,
          log: '斥钦天监妄言，罚监正俸一年。此后三个月，没有人再报灾异。',
        },
      },
    ],
  }),
{ weight: 1, cooldown: 80 },
)

export const DISASTER_TEMPLATES = [drought, flood, locustPlague, earthquake]
