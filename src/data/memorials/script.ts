import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 主线叙事。三条线在这里：清丈、冯保、考成。
 *
 * 规矩：每条线用 flag 串起来，上一个节点的选择决定下一个节点出不出、出哪个。
 *   qz_open → qz_known → { qz_reset | qz_ask | qz_cover } → qz_end
 *   fb_charged → { fb_dead | fb_exiled | fb_alive } → …
 *   kc_debated → { kc_loose | kc_harsh | kc_mid }
 *
 * 每条本子都有一个 secret —— 细看才看得见：这道票拟是谁拟的、护的谁、坑的谁。
 */

const P = 'qingzhang'

/* ══════════════════════════════════════════ 清丈线 · 一 ══════════════════════════════════════════ */

export const qzOpen = def(
  'qz-open',
  'project',
  (s: WorldState) => {
    const p = s.projects.find((x) => x.id === P)!
    const rep = Math.round(p.reported)
    return {
      from: '户部尚书 王国光',
      title: '为清丈田亩、续报完竣事',
      summary: `各省报到，天下田土已丈过${rep}分。`,
      body:
        `臣王国光谨奏：清丈的事，到今春已满两年。\n\n` +
        `北直隶、山东、河南、湖广、江西这几处，报册陆续到部，合着算，天下的田已经丈过${rep}分了。` +
        `剩下的川、陕、云贵，山多路远，还要些时候。\n\n` +
        `臣有一句话，不敢不说。州县官办这差事，白天下乡，夜里造册，一年到头没有一天安生。` +
        `胥吏又从中做手脚，把好田写成荒地、把一户拆作三户的，臣抓了几个，抓不完。\n\n` +
        `臣请皇上再申一道严旨，叫各抚按用心。这差事办到八分上撒手，前头两年的工夫就白费了。\n\n` +
        `伏乞圣裁。`,
      piaoni: '依议。着各抚按用心查核，毋得虚应故事。',
      secret: '这道票拟是张四维拟的。他批「毋得虚应故事」六个字，可他山西老家的田，正是丈得最慢的一处。',
      yiEffect: { project: { id: P, progress: 1.6, reported: 3.4 } },
      patience: 5,
      ignoredEffect: {
        project: { id: P, progress: -1.2, resistance: 3 },
        log: '清丈题本压在案上没动。各省等不到回话，丈量的渐渐停了。',
      },
      options: [
        { key: 'yi', label: '依拟', effect: { project: { id: P, progress: 1.6, reported: 3.4 } } },
        {
          key: 'qian',
          label: '再发工食银十五万两',
          needsReading: true,
          note: '丈量要人、要纸、要饭。不给钱，州县只能摊派到百姓头上',
          effect: {
            taicang: -5,
            project: { id: P, progress: 4, reported: 5, resistance: -6 },
            metrics: { minxin: 2 },
            energy: -1,
            log: '发太仓银十五万两充清丈工食。州县不必再摊派，怨声稍息。',
          },
        },
        {
          key: 'cui',
          label: '限三月报竣，逾期者参奏',
          needsReading: true,
          note: '张居正的路子。快，但会逼出假账',
          effect: {
            project: { id: P, progress: 5, reported: 11, resistance: 7 },
            metrics: { guanfeng: 2, minxin: -2 },
            flags: { qingzhang_harsh: 1, qz_known: 1 },
            energy: -1,
            log: '严旨切责清丈，限三月报竣。报册如雪片一般飞进通政司。',
          },
        },
        {
          key: 'ba',
          label: '罢了这差事，照旧额征收',
          needsReading: true,
          note: '张四维想听的就是这句。说了，清丈就废了',
          effect: {
            project: { id: P, status: 'failed', resistance: 20 },
            metrics: { minxin: 4, guanfeng: -4, chaoshi: 2 },
            flags: { qingzhang_abandoned: 1 },
            energy: -1,
            log: '诏令清丈照旧额征收，不必苛求。天下州县，如释重负。',
          },
        },
      ],
    }
  },
  { line: 'qingzhang', weight: 3, cooldown: 8, sets: ['qz_open'], when: (s) => !s.flags.qz_open },
)

export const qzSecret = def(
  'qz-secret',
  'urgent',
  (s: WorldState) => {
    const p = s.projects.find((x) => x.id === P)
    const real = Math.round(p?.progress ?? 0)
    const rep = Math.round(p?.reported ?? 0)
    return {
      from: '巡按直隶监察御史（密奏）',
      title: '为密陈清丈虚饰事',
      summary: '臣亲验田册三十七处，真数视所报不及四成。此系密封，乞御览后焚之。',
      body:
        `臣谨密奏。这一本，臣不敢发抄，不敢叫人看见。\n\n` +
        `臣走了大名、广平、顺德三府，亲手抽丈了三十七处。看到三样东西，叫臣心里发凉：\n\n` +
        `一、各县报的顷亩，多半是照旧额抄一遍，末了加个零头，凑个好看。\n` +
        `二、有些册子上田连阡陌，臣照着去量，荒草没人，连牛都进不去。\n` +
        `三、臣问一个知县，为什么不上实报。他跪下来，说：「老爷，报了实，小的立刻革职；` +
        `报个虚的，将来查出来，也不过是革职。左右是个革职，小的总想多捱两年。」\n\n` +
        `臣算了一遍：如今户部题报的是${rep}分，臣抽验下来，实不过${real}分。\n\n` +
        `臣不敢说这是哪一个人的罪。这是法的毛病，不是人的毛病。太急，就假。\n\n` +
        `伏乞圣明裁察。`,
      piaoni: '密奏留中，不必发抄。',
      secret: '这本疏没有经过内阁。是巡按直封进宫的——也就是说，写这本的人没打算升官。',
      yiEffect: {
        project: { id: P, expose: true },
        flags: { mizou_seen: 1 },
        log: '密奏留中。你现在知道那个数是假的了。',
      },
      patience: 8,
      ignoredEffect: {
        project: { id: P, resistance: 5 },
        flags: { mizou_seen: 1, qz_cover: 1 },
        log: '密奏压在案头没看。那位御史后来调走了，走之前没再说一句话。',
      },
      options: [
        {
          key: 'yi',
          label: '依拟（留中不发）',
          effect: {
            project: { id: P, expose: true },
            flags: { mizou_seen: 1, qz_cover: 1 },
            metrics: { guanfeng: -2 },
            log: '密奏留中。你知道了这个数，然后什么也没做。',
          },
        },
        {
          key: 'cha',
          label: '密令各省巡按据实覆核',
          needsReading: true,
          note: '把假的推倒重来。清丈要再拖一年',
          effect: {
            taicang: -10,
            project: {
              id: P,
              expose: true,
              // 重核不是把事推倒，是把假账抹平：报的数回到真实附近，进度一分不少
              reported: -Math.max(0, Math.round((p?.reported ?? 40) - (p?.progress ?? 0) - 6)),
              resistance: 9,
            },
            metrics: { guanfeng: 4, minxin: -2 },
            flags: { mizou_seen: 1, qz_reset: 1 },
            energy: -1,
            log: '密令各省巡按据实覆核。三个月后报册回到案头，数字少了近一半——这一回大概是真的。',
          },
        },
        {
          key: 'zhao',
          label: '召王国光来问',
          needsReading: true,
          note: '他是承办的人。你要看看他的脸',
          effect: {
            project: { id: P, expose: true, resistance: 3 },
            flags: { mizou_seen: 1, qz_ask: 1 },
            energy: -3,
            log:
              '召户部尚书王国光问清丈的事。他跪了很久，才开口：「臣也知道。' +
              '可皇上，臣要是一句一句往上报，这差事当天就办不下去。」',
          },
        },
      ],
    }
  },
  { line: 'qingzhang', requires: ['qz_open'], cooldown: 999, forbids: ['mizou_seen'] },
)

export const qzReset = def(
  'qz-reset',
  'project',
  () => ({
    from: '南直隶巡按御史',
    title: '为清丈激变、士民鼓噪事',
    summary: '覆核田亩，触动乡绅。徽州、宁国二府士绅闭城罢市，呈文告御状。',
    body:
      `臣谨奏：覆核的令一下来，出了事。\n\n` +
      `徽州、宁国两府，乡绅聚了三百多人，把府衙围了。他们说：田是祖宗传下来的，` +
      `凭什么重新丈？有的把田契烧在衙门口，有的把大门锁了，罢市三天。\n\n` +
      `带头的几个人，臣查了，两个是举人，一个是退休的知府。他们不是乱民，他们是有功名的。\n\n` +
      `臣若拿人，就是与士林为敌；臣若不拿，摊子就散在这两府。\n\n` +
      `伏乞圣裁。`,
    piaoni: '着抚臣抚谕，不必深究。',
    secret: '「不必深究」四个字，是申时行加的。他怕的是激出大乱子——可他也知道，这一让，覆核就覆不下去了。',
    yiEffect: {
      project: { id: P, progress: -3, resistance: 6 },
      metrics: { minxin: 2, guanfeng: -3 },
      log: '诏抚谕徽宁士绅，不必深究。覆核之事，缓了下来。',
    },
    patience: 4,
    ignoredEffect: {
      metrics: { chaoshi: -3, minxin: -4 },
      project: { id: P, progress: -5 },
      log: '徽宁士绅的事没人管。两府的田册，原样封存，再没人动过。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（抚谕，不深究）',
        effect: {
          project: { id: P, progress: -3, resistance: 6 },
          metrics: { minxin: 2, guanfeng: -3 },
          log: '抚谕徽宁士绅。覆核缓了下来。',
        },
      },
      {
        key: 'na',
        label: '拿为首的三人，解京问罪',
        needsReading: true,
        note: '一刀切下去。切得断，也切得疼',
        effect: {
          project: { id: P, progress: 4, resistance: 10 },
          metrics: { guanfeng: 4, chaoshi: -5, minxin: -3 },
          flags: { scholar_anger: 1 },
          energy: -1,
          log: '拿徽宁士绅为首三人解京。天下士人哗然，说朝廷与读书人为难。',
        },
      },
      {
        key: 'fen',
        label: '分而治之：只查大户，免小户',
        needsReading: true,
        note: '把多数人摘出来，只跟最富的几家过不去',
        effect: {
          project: { id: P, progress: 2, resistance: -4 },
          metrics: { minxin: 4, guanfeng: 1 },
          energy: -1,
          log: '令只查田过千亩者，小户免丈。徽宁的围解了，几家大族的田册被抬进了衙门。',
        },
      },
    ],
  }),
  { line: 'qingzhang', requires: ['qz_reset'], cooldown: 999 },
)

export const qzAsk = def(
  'qz-ask',
  'personnel',
  () => ({
    from: '户部尚书 王国光',
    title: '为奉职无状、乞赐罢黜事',
    summary: '臣办清丈二年，不能使下无虚饰，此臣之罪。乞罢臣职，以谢天下。',
    body:
      `臣王国光谨奏：臣请辞。\n\n` +
      `清丈办了两年，报上来的是八成，实数是四成。臣是承办的人，臣不能推给别人。\n\n` +
      `臣不是不知道底下作假。臣知道。可臣若一个个查，这差事十年也办不完；` +
      `臣若不查，就是欺君。臣夹在中间，两年了。\n\n` +
      `臣今年七十一。臣想歇了。\n\n` +
      `伏乞皇上允臣致仕。`,
    piaoni: '王国光老成练达，着慰留，不必再辞。',
    secret: '拟这道票拟的是张四维。他一边慰留王国光，一边已经在物色接任的人——户部这个位子，他想要。',
    yiEffect: {
      metrics: { chaoshi: 1 },
      log: '慰留王国光。他没再辞。',
    },
    patience: 5,
    options: [
      {
        key: 'yi',
        label: '依拟（慰留）',
        effect: {
          metrics: { chaoshi: 1 },
          flags: { wang_stay: 1 },
          log: '慰留王国光。他叩了头，没再说话。',
        },
      },
      {
        key: 'fang',
        label: '准其致仕，另简能员',
        needsReading: true,
        note: '放他走。户部换个主，清丈也就换个命',
        effect: {
          appoint: { officerId: 'wangguanguang', officeId: null },
          project: { id: P, progress: -6, resistance: 4 },
          metrics: { guanfeng: -2, chaoshi: -2 },
          energy: -1,
          log: '准王国光致仕。他出京那天，户部的属吏送到城外。',
        },
      },
      {
        key: 'ze',
        label: '不准辞，且责其二年之欺',
        needsReading: true,
        note: '骂他一顿，让他戴罪办事。他会记住这一刻',
        effect: {
          project: { id: P, progress: 6, resistance: 8 },
          metrics: { guanfeng: 3, chaoshi: -3 },
          flags: { wang_ashamed: 1 },
          energy: -1,
          log:
            '不准辞，切责其二年虚饰之罪。王国光免冠叩首，额上见了血。' +
            '此后三个月，他亲自下到顺天府抽丈。',
        },
      },
    ],
  }),
  { line: 'qingzhang', requires: ['qz_ask'], cooldown: 999 },
)

/* ══════════════════════════════════════════ 冯保线 ══════════════════════════════════════════ */

export const fbImpeach = def(
  'fb-impeach',
  'impeach',
  () => ({
    from: '江西道监察御史 李植',
    title: '为劾奏权珰不法、恳乞乾断事',
    summary: '劾司礼监掌印太监冯保十二大罪，请下法司逮问、籍没家产。',
    body:
      `臣李植谨奏：臣要参一个人。\n\n` +
      `司礼监掌印太监冯保，伺候过三朝，掌着批红的笔，掌着东厂的缉事。二十年了。` +
      `臣说他十二桩罪，桩桩都有实据：一、私藏御用之物；二、家里金银过百万；` +
      `三、卖官；四、侵盗内帑；五、假传旨意害人；六、结党；七、纵容家奴占人田产；` +
      `八、蒙蔽圣聪；九、紊乱朝纲；十、交通边镇；十一、怨望君父；十二、欺凌百官。\n\n` +
      `臣是个七品官。臣说这些话，是拿这条命在说。\n\n` +
      `臣请皇上大奋乾断，将冯保下法司逮问，籍没家产，以正国法。`,
    piaoni: '冯保是先帝留下来的人，伺候多年。说办就办，怕伤了先帝知人的明。拟交部院议处。',
    secret: '这道票拟是张四维的手笔。他恨冯保很久了——但更要紧的是，他知道冯保一倒，司礼监的位子就空出来了。',
    yiEffect: {
      metrics: { chaoshi: -3, guanfeng: -2 },
      flags: { fb_alive: 1 },
      log: '李植劾冯保，交部院议处。议了三个月，没议出结果。',
    },
    patience: 2,
    ignoredEffect: {
      metrics: { chaoshi: -5, guanfeng: -3 },
      flags: { fb_alive: 1 },
      log: '劾冯保的疏留中不发。冯保照旧掌印，李植被罚俸三月。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（下部院议处）',
        effect: {
          metrics: { chaoshi: -3, guanfeng: -2 },
          flags: { fb_alive: 1 },
          log: '交部院议处。天下人都在等，等来等去，等到一道温旨。',
        },
      },
      {
        key: 'ji',
        label: '即下诏逮问，籍其家',
        needsReading: true,
        note: '这本疏，你等了很久了',
        effect: {
          taicang: 105,
          metrics: { chaoshi: -7, guanfeng: 5, minxin: 3 },
          flags: { fb_dead: 1 },
          energy: -1,
          log:
            '诏逮冯保，籍其家。金银一百余万两，珠宝堆了一院子。发南京孝陵种菜。' +
            '内廷上下，一夜之间都老实了。',
        },
      },
      {
        key: 'jiang',
        label: '降为奉御，发南京闲住',
        needsReading: true,
        note: '留他一条命。宦官会记住这份恩，也会记住这份怕',
        effect: {
          taicang: 38,
          metrics: { chaoshi: 2, guanfeng: 1 },
          flags: { fb_exiled: 1 },
          energy: -1,
          log: '降冯保为奉御，发南京闲住。家产籍没三分之一。',
        },
      },
    ],
  }),
  {
    line: 'eunuch',
    when: (s) => s.date.year === 1582 && s.date.month >= 11,
    cooldown: 999,
    // 抄冯保只有一次。史书上这一笔，也只记了一次
    once: true,
    sets: ['fb_charged'],
    forbids: ['fb_charged'],
  },
)

export const fbPanic = def(
  'fb-panic',
  'routine',
  () => ({
    from: '司礼监秉笔太监 张诚',
    title: '为内廷惊惧、乞示宽旨事',
    summary: '冯保既籍，内臣人人自危。掌印以下，多有称病不出者。',
    body:
      `奴才张诚谨奏：冯公公的事办完，内廷就乱了。\n\n` +
      `十二监四司八局，这几天称病告假的，有三十多人。不是真病，是怕。` +
      `他们想，冯公公掌印二十年都办了，我们算什么。\n\n` +
      `奴才不敢替他们求情。奴才是想说一句：这些人里头，有的是冯公公的党，` +
      `有的是跟了冯公公三十年、端过他茶碗的。可也有的，什么都没干过，就是怕。\n\n` +
      `请皇上下一道旨，说一句宽心的话。这一句，比发多少银子都管用。`,
    piaoni: '着司礼监晓谕，安心供职，不必惊疑。',
    secret: '张诚自己就是最怕的那一个。他上这道疏，一半是为别人，一半是为自己探口风。',
    yiEffect: {
      metrics: { chaoshi: 3 },
      log: '晓谕内廷安心供职。称病的陆续都回来了。',
    },
    patience: 6,
    options: [
      {
        key: 'yi',
        label: '依拟（晓谕安心）',
        effect: { metrics: { chaoshi: 3 }, log: '晓谕内廷安心供职。' },
      },
      {
        key: 'cha',
        label: '趁势清查：凡冯保党羽，尽数革退',
        needsReading: true,
        note: '斩草除根。可内廷一空，谁替你批红',
        effect: {
          taicang: 18,
          metrics: { chaoshi: -6, guanfeng: 2 },
          flags: { eunuch_purge: 1 },
          energy: -1,
          log:
            '清查冯保党羽，革退内臣一百四十余人。内廷一时无人办事，' +
            '批红积压了半个月。',
        },
      },
      {
        key: 'liu',
        label: '留几个能办事的，其余不问',
        needsReading: true,
        note: '内廷是个手艺活，换一批生手，你这个皇帝先受不了',
        effect: {
          metrics: { chaoshi: 5, guanfeng: -2 },
          flags: { eunuch_kept: 1 },
          energy: -1,
          log: '只黜首恶数人，其余安心供职。内廷三日就恢复了旧样。',
        },
      },
    ],
  }),
  { line: 'eunuch', requires: ['fb_dead'], cooldown: 999 },
)

export const fbPlot = def(
  'fb-plot',
  'impeach',
  () => ({
    from: '东厂提督太监',
    title: '为密陈外廷交通内臣事',
    summary: '访得若干廷臣与南京闲住之冯保书信往来，谨密陈姓名。',
    body:
      `奴才谨密奏：冯保到南京之后，还有人来往。\n\n` +
      `东厂访得，这两个月给他递过信的，有七个人。三个是外省的知府，` +
      `一个是通政司的参议，两个是内官监的旧人。还有一个——奴才不敢写在这里，` +
      `请皇上自己看附的名单。\n\n` +
      `奴才不是说他们要反。人倒了，还有人肯问候一句，这是人情。\n\n` +
      `可奴才的差事，是把这些事报上来。报上来，皇上心里有数；不报，奴才就是失职。`,
    piaoni: '知道了。名单留中。',
    secret: '这份名单里，有一个是张四维的门生。东厂敢报，说明东厂背后有人撑腰——撑腰的人，正想动张四维。',
    yiEffect: {
      metrics: { chaoshi: -1 },
      log: '东厂密陈名单，留中。',
    },
    patience: 6,
    options: [
      { key: 'yi', label: '依拟（留中）', effect: { metrics: { chaoshi: -1 } } },
      {
        key: 'cha',
        label: '按名单查办',
        needsReading: true,
        note: '顺藤摸下去。摸到谁，谁就倒霉',
        effect: {
          metrics: { chaoshi: -6, guanfeng: 3 },
          flags: { eunuch_terror: 1 },
          energy: -1,
          log:
            '按东厂名单查办，革职五人，下狱二人。朝中一时人人自危，' +
            '连内阁的票拟都变得极谨慎——凡有风险的事，一律拟「再议」。',
        },
      },
      {
        key: 'shao',
        label: '烧了名单，只诫东厂勿再缉访外廷',
        needsReading: true,
        note: '把刀收起来。可刀收起来，别人就会以为你不敢用',
        effect: {
          metrics: { chaoshi: 4, guanfeng: -2 },
          flags: { factory_restrained: 1 },
          energy: -1,
          log: '焚东厂名单，戒其勿再缉访外廷。外廷闻之，颇有颂圣德者。',
        },
      },
    ],
  }),
  { line: 'eunuch', requires: ['fb_exiled'], weight: 2, cooldown: 999 },
)

/* ══════════════════════════════════════════ 考成线 ══════════════════════════════════════════ */

export const kcDebate = def(
  'kc-debate',
  'personnel',
  () => ({
    from: '内阁首辅 张四维',
    title: '为陈时政、乞宽考成事',
    summary: '请将考成之法量从宽假：征赋以八分为率，违限者罚俸，勿遽降黜。',
    body:
      `臣张四维谨奏：先太师当国十年，法度修明，这是他的功，臣不敢抹。\n\n` +
      `可是考成这一条，臣以为太急了些。如今是什么光景？州县官怕考成，怕到不敢报灾。` +
      `报了灾就要蠲，蠲了就不够数，不够数就要降级。所以他宁可让百姓饿着，也要把数凑齐。\n\n` +
      `臣在下面待过，见过这样的县官：催科催到半夜，回到后堂，坐着哭。第二天接着催。\n\n` +
      `臣请把考成的规矩松一松：征赋以八分为率，违限的罚俸，不要动不动就降级调任。\n\n` +
      `法太紧，人就会说谎。这是臣这几十年看下来的。`,
    piaoni: '所奏深切时弊。着吏部、户部会看具奏。',
    secret: '张四维要宽考成，一半是政见，一半是买人心。他刚接首辅，需要人说他好——而考成法，是最好的一份人情。',
    yiEffect: {
      policy: { quota: 80, severity: 1 },
      flags: { kc_loose: 1 },
      log: '诏宽考成：征赋以八分为率，违限罚俸。天下有司，如释重负。',
    },
    patience: 6,
    ignoredEffect: {
      metrics: { chaoshi: -3, guanfeng: -1 },
      flags: { kc_mid: 1 },
      log: '请宽考成的疏留中。张四维等了十天，没有再问。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（宽考成）',
        effect: {
          policy: { quota: 80, severity: 1 },
          flags: { kc_loose: 1 },
          log: '诏宽考成。天下有司如释重负，而考成之法，自此名存实亡。',
        },
      },
      {
        key: 'bu',
        label: '不许：先太师的法，不可轻改',
        needsReading: true,
        note: '你保住了这台机器。可是推这台机器的人，刚死了',
        effect: {
          policy: { quota: 90, severity: 3 },
          metrics: { chaoshi: -3, guanfeng: 4, minxin: -3 },
          flags: { kc_harsh: 1 },
          energy: -1,
          log: '诏：考成之法，祖宗成宪，不可轻改。张四维顿首称善，退朝时脚步很慢。',
        },
      },
      {
        key: 'zhe',
        label: '折中：九分为率，降黜改罚俸',
        needsReading: true,
        note: '谁都不得罪，也就谁都不满意',
        effect: {
          policy: { quota: 90, severity: 2 },
          metrics: { minxin: 2, guanfeng: -1 },
          flags: { kc_mid: 1 },
          energy: -1,
          log: '诏：考成以九分为率，违限者罚俸，不必遽降。',
        },
      },
    ],
  }),
  {
    line: 'kaocheng',
    when: (s) => s.turn >= 6 && !s.flags.kc_loose && !s.flags.kc_harsh && !s.flags.kc_mid,
    cooldown: 999,
  },
)

export const kcLoose = def(
  'kc-loose',
  'urgent',
  (s: WorldState) => ({
    from: '户部尚书',
    title: '为逋欠骤增、国用告急事',
    summary: `考成既宽，各省拖欠银两激增。太仓见存${Math.round(s.taicang)}万两，不足以支边饷。`,
    body:
      `臣谨奏：宽考成的诏下去三个月，天下的逋欠就涨了。\n\n` +
      `各省报来，拖欠的银子，比去年多了六十万两。不是百姓不交，是州县不催了。` +
      `州县为什么不催？因为催了也没人罚他。\n\n` +
      `臣不是说宽考成不好。臣是说：宽了之后，得有别的法子。\n\n` +
      `如今太仓见存${Math.round(s.taicang)}万两。下个月的九边年例，发不出去。`,
    piaoni: '着户部议措处之法。',
    secret: '这道疏送到内阁，压了六天——张四维不想让它在你看到宽考成的坏处之前送到。',
    yiEffect: {
      taicang: 6,
      metrics: { minxin: -2 },
      log: '户部议措处，加派六万两。',
    },
    patience: 3,
    ignoredEffect: {
      taicang: -10,
      metrics: { bianfang: -4, chaoshi: -3 },
      log: '逋欠的事没人管。边饷发不出，三个镇同时告急。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（户部议措处）',
        effect: { taicang: 6, metrics: { minxin: -2 }, log: '户部措处，加派六万。' },
      },
      {
        key: 'jia',
        label: '加派天下田赋，每亩三厘',
        needsReading: true,
        note: '钱能收上来。可你刚宽了考成，又加派，等于把好处收回去了',
        effect: {
          taicang: 24,
          metrics: { minxin: -8, chaoshi: -2 },
          flags: { surtax: 1 },
          energy: -1,
          log: '加派天下田赋，每亩三厘，岁入增二十四万两。民间谓之「宽了考成，紧了口袋」。',
        },
      },
      {
        key: 'nei',
        label: '发内帑二十万两补边饷',
        needsReading: true,
        note: '你自己的钱。用了，就没有退路了',
        effect: {
          neitang: -20,
          metrics: { guanfeng: 4, chaoshi: 3 },
          flags: { neitang_used: 1 },
          energy: -1,
          log: '发内帑二十万两补边饷。户部尚书在文华门外跪谢，说「圣德」。',
        },
      },
      {
        key: 'fu',
        label: '恢复考成旧法',
        needsReading: true,
        note: '三个月前你刚宽了它。现在收回来，等于承认那道旨错了',
        effect: {
          policy: { quota: 92, severity: 3 },
          taicang: 18,
          metrics: { guanfeng: 6, minxin: -5, chaoshi: -4 },
          flags: { kc_reversed: 1 },
          energy: -1,
          log: '诏复考成旧法。天下州县，一夜之间又变回了原来的样子。',
        },
      },
    ],
  }),
  { line: 'kaocheng', requires: ['kc_loose'], cooldown: 999 },
)

export const kcHarsh = def(
  'kc-harsh',
  'urgent',
  () => ({
    from: '吏部尚书',
    title: '为县令自尽、士论沸腾事',
    summary: '山东费县知县以征赋不足九分，闻将降黜，自缢于县衙。士林哗然。',
    body:
      `臣谨奏：出了人命。\n\n` +
      `山东费县的知县，姓王，今年四十。考成核下来，他那一县征赋只完了八分六厘，` +
      `差四厘。按新例，降三级调用。\n\n` +
      `他知道的那天晚上，把印挂在梁上，人吊在旁边。\n\n` +
      `他留下一张字条，说：费县今年旱，他蠲了三百户的税。蠲了就不够数。` +
      `他说他不敢报灾，报了灾是「规避」，罪更重。\n\n` +
      `臣不敢说这道法不对。臣只是把这件事报上来。`,
    piaoni: '着有司优恤。其蠲免之事，查明具奏。',
    secret: '吏部这道票拟写得很小心。他们不敢说「法太苛」，只敢说「优恤」——因为说前者，就是议你的政。',
    yiEffect: {
      metrics: { guanfeng: -3, minxin: 2, chaoshi: -2 },
      log: '优恤费县知县。士论稍平。',
    },
    patience: 4,
    ignoredEffect: {
      metrics: { guanfeng: -5, chaoshi: -4 },
      log: '费县知县的事没有下文。此后半年，山东有四个知县告病，两个挂印走了。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（优恤）',
        effect: { metrics: { guanfeng: -3, minxin: 2, chaoshi: -2 }, log: '优恤费县知县。' },
      },
      {
        key: 'gai',
        label: '改例：灾伤蠲免者，不入考成',
        needsReading: true,
        note: '把制度的漏洞补上。可这么一补，又有人要钻',
        effect: {
          policy: { quota: 88, severity: 2 },
          metrics: { guanfeng: 5, minxin: 3, chaoshi: 2 },
          flags: { kc_fixed: 1 },
          energy: -1,
          log: '改考成例：灾伤蠲免者不入考成。天下州县闻之，多有泣者。',
        },
      },
      {
        key: 'chi',
        label: '斥其规避，着追夺诰命',
        needsReading: true,
        note: '人死了还要罚。这样的事，史书上会记一笔',
        effect: {
          metrics: { guanfeng: -8, chaoshi: -5, minxin: -4 },
          flags: { cruel: 1 },
          energy: -1,
          log: '斥费县知县规避考成，追夺诰命。士林大哗，有翰林作诗讽之。',
        },
      },
    ],
  }),
  { line: 'kaocheng', requires: ['kc_harsh'], cooldown: 999 },
)

/* ══════════════════════════════════════════ 张居正身后 ══════════════════════════════════════════ */

export const settleZhang = def(
  'settle-zhang',
  'impeach',
  () => ({
    from: '云南道监察御史 羊可立',
    title: '为追论故辅罪状、乞正国法事',
    summary: '劾张居正夺辽王府第、侵占王产，请追夺官爵、籍没家产。',
    body:
      `臣羊可立谨奏：张居正死了快一年了。臣以为，有些账，该算了。\n\n` +
      `其一，他当国十年，威权震主。天下人只知道有首辅，不知道有皇上。\n` +
      `其二，他为了报私仇，把辽王废了，幽死在里头，辽王府的家产，进了张家的门。\n` +
      `其三，他三个儿子连科登第，占着高第，天下士人侧目而视，没有一个敢说话。\n` +
      `其四，他与冯保表里为奸，凡是要贬谁、要升谁，两个人关起门来就定了。\n\n` +
      `如今冯保已经伏罪。张居正的罪，难道就这么算了？\n\n` +
      `臣请追夺他的官爵，籍没他的家产，以正国法，以谢天下。`,
    piaoni: '张居正的功过，天下自有公论。这道疏说得过了，不准。',
    secret: '拟这道票拟的是申时行。他知道拦不住——他只是想让自己在史书上留一句「曾为张居正说过话」。',
    yiEffect: {
      metrics: { chaoshi: 2, guanfeng: 1 },
      log: '羊可立论张居正，不准。言官议论纷纷。',
    },
    patience: 4,
    ignoredEffect: {
      metrics: { chaoshi: -3, guanfeng: -2 },
      log: '追论张居正的疏留中。言官愈发不平，弹章一天几本往上递。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（不准）',
        effect: { metrics: { chaoshi: 2, guanfeng: 1 }, log: '追论张居正，不准。' },
      },
      {
        key: 'ji',
        label: '籍其家',
        needsReading: true,
        note: '抄一个死人的家。你会得到一些银子，和一段余生都要被提起的事',
        effect: {
          taicang: 22,
          metrics: { chaoshi: -9, guanfeng: -7, minxin: -2 },
          flags: { zhang_ruined: 1 },
          energy: -1,
          log:
            '诏籍张居正家。得黄金二千四百余两，白银十万七千余两——不及冯保的十分之一。' +
            '其长子敬修留血书自缢。家中老小封在府里，饿死十七口，中有婴儿三。消息传出，天下寒心。',
        },
      },
      {
        key: 'xue',
        label: '削其官爵、夺其谥，不籍家',
        needsReading: true,
        note: '罚他，但不砸他的家。这需要一点分寸，也需要一点胆',
        effect: {
          metrics: { chaoshi: -2, guanfeng: -1, minxin: 2 },
          flags: { zhang_stripped: 1 },
          energy: -1,
          log: '诏削张居正官爵，夺谥，不籍其家。他母亲八十岁了，得终天年。',
        },
      },
    ],
  }),
  {
    line: 'zhang',
    when: (s) => s.date.year >= 1583 && s.date.month >= 3,
    cooldown: 999,
    forbids: ['zhang_ruined', 'zhang_stripped'],
  },
)

/* ══════════════════════════════════════════ 清丈线 · 日常续报 ══════════════════════════════════════════ */

/** 清丈的旬报。不算叙事节点，只是把这件差事往前拱一拱 */
export const qzRoutine = def(
  'qz-routine',
  'project',
  (s: WorldState) => {
    const p = s.projects.find((x) => x.id === P)!
    const rep = Math.round(p.reported)
    return {
      from: '户部清吏司',
      title: '为清丈旬报事',
      summary: `各省续报丈量，合已丈过${rep}分。`,
      body:
        `臣谨奏：清丈的旬报。\n\n` +
        `各省续报，合已丈过${rep}分。河南、山东两处报得快，陕西、云贵报得慢——山路难走，` +
        `一县的册子要两个月才到府。\n\n` +
        `臣不多说。只报一个数，请皇上心里有数。`,
      piaoni: '知道了。',
      secret: '「知道了」三个字，是司礼监代批的。批了这两个字，这一旬就算过去了。',
      yiEffect: { project: { id: P, progress: 1.2, reported: 3 } },
      patience: 6,
      ignoredEffect: {
        project: { id: P, progress: -0.8, resistance: 2 },
        log: '清丈旬报压在案上。下一旬的报册，就不那么及时了。',
      },
      options: [
        { key: 'yi', label: '依拟', effect: { project: { id: P, progress: 1.2, reported: 3 } } },
        {
          key: 'cui',
          label: '催陕西、云贵两处',
          needsReading: true,
          note: '山路难走是真的。但你等不起',
          effect: {
            project: { id: P, progress: 2, reported: 3.5, resistance: 3 },
            metrics: { minxin: -1 },
            energy: -1,
            log: '严催陕云两省清丈。两省的报册，下月果然厚了些——至于实不实，另说。',
          },
        },
      ],
    }
  },
  { weight: 2, cooldown: 9, requires: ['qz_open'], forbids: ['qingzhang_abandoned'] },
)

/* ══════════════════════════════════════════ 清丈线 · 阶段节点 ══════════════════════════════════════════ */

/** 过半之后：藩府开始动了 */
export const qzM30 = def(
  'qz-m30',
  'personnel',
  () => ({
    from: '襄王（藩府）',
    title: '为恭进微仪、以备国用事',
    summary: '襄王遣使赍黄金千两、缎二百匹入京，称「愿为朝廷效力」。',
    body:
      `臣襄王谨启：臣闻朝廷清丈田亩，为国裕赋，此万世之利，臣不胜欣忭。\n\n` +
      `臣府中薄有蓄积，谨进黄金一千两、缎二百匹，以备国用。区区微仪，不敢称贡。\n\n` +
      `臣更有请者：臣府旧有庄田数处，皆祖宗所赐，册籍分明。清丈之日，` +
      `乞敕有司照旧额存留，不必重丈，以全亲亲之谊。\n\n` +
      `臣不胜战栗待罪之至。`,
    piaoni: '藩王进献，于礼不宜受。其所请，着户部查旧例具奏。',
    secret: '一千两黄金，换的是「不必重丈」四个字。这笔买卖他算得很清楚：藩府的庄田，隐占的何止十倍。',
    yiEffect: {
      metrics: { chaoshi: 1 },
      project: { id: P, resistance: 3 },
      log: '襄王进献，依拟却之。其所请，户部查例。',
    },
    patience: 4,
    ignoredEffect: {
      project: { id: P, resistance: 6 },
      log: '襄王的疏压在案上。别的王府看着，也都不说话了——他们在等这个头怎么开。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（却之）',
        effect: { metrics: { chaoshi: 1 }, project: { id: P, resistance: 3 }, log: '却襄王进献。' },
      },
      {
        key: 'shou',
        label: '受其献，许其庄田免丈',
        needsReading: true,
        note: '一千两黄金。可这一开口，全天下的王府都会来要',
        effect: {
          taicang: 8,
          metrics: { guanfeng: -5, minxin: -3 },
          project: { id: P, resistance: 14, progress: -4 },
          flags: { prifams_deal: 1 },
          energy: -1,
          log:
            '受襄王进献，许其庄田免丈。半月之内，另有六家王府上疏，' +
            '所请如出一辙。',
        },
      },
      {
        key: 'ji',
        label: '却其献，并令先丈襄府',
        needsReading: true,
        note: '拿最大的开刀。一刀下去，要么立威，要么结仇',
        effect: {
          project: { id: P, progress: 5, resistance: 12 },
          metrics: { guanfeng: 4, chaoshi: -4 },
          flags: { prifams_anger: 1 },
          energy: -1,
          log: '却襄王献，令有司先丈襄府庄田。襄王闭门不出，宗人府递了话。',
        },
      },
    ],
  }),
  {
    line: 'qingzhang',
    requires: ['qz_open'],
    cooldown: 999,
    when: (s) => (s.projects[0]?.progress ?? 0) >= 26 && !s.flags.qz_m30,
    sets: ['qz_m30'],
  },
)

/** 过半之后：乡绅联名 */
export const qzM55 = def(
  'qz-m55',
  'impeach',
  () => ({
    from: '南直隶乡绅 联名',
    title: '为清丈扰民、恳乞暂缓事',
    summary: '苏松常镇四府乡绅二百余人联名呈控，言清丈胥吏索贿、拆户飞洒，民不堪命。',
    body:
      `具呈南直隶苏州、松江、常州、镇江四府乡绅二百三十七人，为陈地方疾苦事。\n\n` +
      `朝廷清丈，本为均赋。然行之州县，胥吏辈借端勒索：有田一亩而丈作三亩者，` +
      `有缴银三钱而免丈者，有以坟茔祠堂逼作耕田者。小民典衣鬻子，犹不能给。\n\n` +
      `更有甚者，本县之田，丈至邻县；甲户之税，摊入乙户。此非清丈，是乱政也。\n\n` +
      `生等世受国恩，不敢言乱。惟乞暂缓丈量，先将胥吏治罪，别遣廉明官覆核。\n\n` +
      `伏乞圣裁。`,
    piaoni: '着抚按查究胥吏，丈量之事仍照原议行。',
    secret: '这二百三十七个人里，有四十一家是苏松最大的粮户。他们写的「民不堪命」，指的是自己。',
    yiEffect: {
      project: { id: P, progress: 2, resistance: 2 },
      metrics: { guanfeng: 2 },
      log: '着抚按查究胥吏，丈量照旧。',
    },
    patience: 5,
    ignoredEffect: {
      project: { id: P, resistance: 8, progress: -2 },
      metrics: { minxin: -3 },
      log: '乡绅联名的呈子没人理。苏松的丈量，从此推不动了。',
    },
    options: [
      {
        key: 'yi',
        label: '依拟（查胥吏，丈量照旧）',
        effect: {
          project: { id: P, progress: 2, resistance: 2 },
          metrics: { guanfeng: 2 },
          log: '查究胥吏，丈量照旧。',
        },
      },
      {
        key: 'huan',
        label: '暂缓苏松四府，先丈他处',
        needsReading: true,
        note: '让一步。可这一步让出去，别处也会来要',
        effect: {
          project: { id: P, progress: 3, resistance: -6 },
          metrics: { minxin: 3, guanfeng: -3 },
          flags: { susong_exempt: 1 },
          energy: -1,
          log: '暂缓苏松四府丈量。四府的乡绅，给巡抚送了万民伞。',
        },
      },
      {
        key: 'cha',
        label: '遣御史查这二百三十七人的田',
        needsReading: true,
        note: '他们喊冤，你就查他们的田。查出来，话就好说了',
        effect: {
          project: { id: P, progress: 6, resistance: 10 },
          metrics: { guanfeng: 5, chaoshi: -3, minxin: -2 },
          flags: { susong_checked: 1 },
          energy: -1,
          log:
            '遣御史查苏松乡绅田亩。查出隐占田十一万亩，应补税银四万余两。' +
            '为首的几家，从此闭门不出。',
        },
      },
    ],
  }),
  {
    line: 'qingzhang',
    requires: ['qz_open'],
    cooldown: 999,
    when: (s) => (s.projects[0]?.progress ?? 0) >= 50 && !s.flags.qz_m55,
    sets: ['qz_m55'],
  },
)

/** 收尾：验收 */
export const qzM90 = def(
  'qz-m90',
  'project',
  () => {
    return {
      from: '户部尚书',
      title: '为清丈告竣、请旨验收事',
      summary: `各省报竣，田册已齐。请旨遣官验收，或径行奏销。`,
      body:
        `臣谨奏：清丈的事，各省都报完了。\n\n` +
        `田册堆在户部，从地板堆到梁上。合天下计，田土比旧额增了八十余万顷。\n\n` +
        `按例，该遣官验收。验收的规矩是：抽丈、对册、勘界。一省抽三府，一府抽三县。\n\n` +
        `可臣也说一句实话：验收要钱，要人，要一年。若皇上要快，臣就把册子奏销了，` +
        `这件事就算了了。\n\n` +
        `奏销与验收，差在哪儿？差在这本册子是不是真的。`,
      piaoni: '着户部照例奏销，不必另遣官验收。',
      secret: '「不必另遣官验收」六个字，是户部自己拟的。他们不想被验——验出问题，第一个担责的是户部。',
      yiEffect: {
        project: { id: P, progress: 100, reported: 100, status: 'done' },
        metrics: { chaoshi: 2 },
        flags: { qz_fake_done: 1 },
        log: '清丈照例奏销，事竣。田册入库，无人再验。',
      },
      patience: 3,
      ignoredEffect: {
        project: { id: P, resistance: 4 },
        log: '验收的疏压在案上。田册在户部堆着，堆到发霉。',
      },
      options: [
        {
          key: 'yi',
          label: '依拟（照例奏销）',
          effect: {
            project: { id: P, progress: 100, reported: 100, status: 'done' },
            metrics: { chaoshi: 2 },
            flags: { qz_fake_done: 1 },
            log: '清丈照例奏销。天下田土，从此有了一本账——至于是不是真的，没人知道。',
          },
        },
        {
          key: 'yan',
          label: '遣官验收，抽丈三府',
          needsReading: true,
          note: '一年、一笔钱，换一个「真的」',
          effect: {
            taicang: -8,
            project: { id: P, expose: true, status: 'done', reported: -8 },
            metrics: { guanfeng: 5, minxin: 1 },
            flags: { qz_verified: 1 },
            energy: -2,
            log:
              '遣官验收清丈，抽丈三府。查出虚报二成，问罪知县十一人。' +
              '田册这一回是真的了——代价是又拖了一年，多花了八万两。',
          },
        },
        {
          key: 'qin',
          label: '亲自核一遍',
          needsReading: true,
          note: '皇帝自己看册子。看得完吗？看不完，但能看见一处',
          effect: {
            project: { id: P, expose: true, status: 'done' },
            metrics: { guanfeng: 3, chaoshi: -2 },
            flags: { qz_self_checked: 1 },
            energy: -4,
            log:
              '上亲核田册三日。三日的册子摞起来比人高，你看完了顺天府的一县。' +
              '那一县的数，是假的。别处的，你不知道。',
          },
        },
      ],
    }
  },
  {
    line: 'qingzhang',
    requires: ['qz_open'],
    cooldown: 999,
    when: (s) => (s.projects[0]?.progress ?? 0) >= 85 && !s.flags.qz_m90,
    sets: ['qz_m90'],
  },
)

export const SCRIPT_TEMPLATES = [qzOpen, qzSecret, qzReset, qzAsk, qzRoutine, qzM30, qzM55, qzM90, fbImpeach, fbPanic, fbPlot, kcDebate, kcLoose, kcHarsh, settleZhang]
