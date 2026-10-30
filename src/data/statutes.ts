import type { MetricKey, WorldState } from '../engine/types'
import { clamp } from '../engine/util'

/**
 * 律令。
 *
 * 皇帝管国家，靠三样东西：批一本折子（个案）、用一个人（人事）、
 * 立一条法（制度）。前两样是一时的，只有第三条能改国家的走向。
 *
 * 四条规矩：
 *   一、法不是想立就立的 —— 得先有人把这件事提到你面前（need.flag 由奏疏置位）。
 *      没人提，这条法在界面上根本不出现（只报一句「另有几件，尚无人提及」）。
 *   二、每旬效果写在 effect 里，是唯一数据源：结算用它，界面说明也由它生成。
 *      免得「说明写得好听、代码里其实是另一回事」。
 *   三、每条法都有得有失。没有只赚不赔的法 —— 有的话，史书上早就办成了。
 *      effect 里的正负号就是得失，界面直接分两栏列出来。
 *   四、有些法彼此不能并存（漕折与海运、讲学与禁讲学）。立了一条，
 *      另一条自动罢 —— 制度之间也打架。
 */

export type StatuteGroup = '财政' | '吏治' | '军务' | '士林' | '宗室'

export const GROUP_ORDER: StatuteGroup[] = ['财政', '吏治', '军务', '士林', '宗室']

export interface StatuteEffect {
  /** 每旬案头积压变化（负数为清） */
  backlog?: number
  /** 每旬太仓进项（万两） */
  taicang?: number
  /** 每旬内帑进项（万两） */
  neitang?: number
  /** 每旬太仆寺进项（万两） */
  taipu?: number
  /** 每旬四维变化 */
  metric?: Partial<Record<MetricKey, number>>
}

export interface Statute {
  id: string
  name: string
  group: StatuteGroup
  /** 一句话说清这条法在做什么 */
  brief: string
  /** 条文，白话 */
  text: string
  /** 谁不乐意，为什么不乐意 */
  against: string
  /** 颁行或废止要花的精力 */
  cost: number
  /** 开局是否已经在施行 */
  on: boolean
  /** 最早可以动它的旬数（有些法要等时机） */
  fromTurn?: number
  /**
   * 前置：需要某个 flag 已置位（由奏疏事件触发）。
   * 未置位时这条法是隐藏的 —— 天下的毛病还没人说到你面前。
   */
  need?: { flag: string; hint: string }
  /** 每旬效果（结算与说明共用这一份） */
  effect: StatuteEffect
  /** 颁行当旬的一次性效果（赏、赈、裁员的盘缠这类） */
  immediate?: StatuteEffect
  /** 与哪几条法不能并存：立了这条，那几条自动罢 */
  exclusive?: string[]
  /** 得（人话，写清玩家拿到什么） */
  gains: string[]
  /** 失（人话，写清玩家付什么） */
  costs: string[]
  /** 立了之后会长出什么麻烦（写给玩家看，不做数值） */
  aftermath: string
}

export const STATUTES: Statute[] = [
  /* ══════════════════════════════════════════════ 财政 */
  {
    id: 'kaocheng',
    name: '考成法',
    group: '财政',
    brief: '立程限、三簿查考，征赋不足九成者降级',
    text:
      '凡诏令及征赋，皆立程限，置三簿：一存本部，一存六科，一存内阁。' +
      '逐月查考，年终稽核。抚按官征赋不足九成者，降三级；不完者，不许升转。',
    against: '州县官、吏部考功司，以及所有怕被追着要结果的人',
    cost: 2,
    on: true,
    // 开局就在墙上挂着。张居正留下的唯一一件还活着的遗产
    effect: {
      backlog: -0.4,
      metric: { guanfeng: -0.18, minxin: -0.12, chaoshi: 0.05 },
    },
    gains: ['政令下到州县，不至于中途烂掉', '案头积压每年清掉十几件', '朝局稍稳：百官知道有程限'],
    costs: ['官风年降六分：州县只求数字', '民心年降四分：催科敲扑'],
    aftermath: '州县为凑够九成，敲扑小民；亏空者挪新补旧，账越捂越烂。',
  },
  {
    id: 'yitiaobian',
    name: '一条鞭法',
    group: '财政',
    brief: '赋役合并、计亩征银、官收官解',
    text:
      '总括一州县之赋役，量地计丁，丁粮毕输于官。岁役亦编为银，' +
      '归于一条。凡额办、派办、京库岁需与存留供亿诸费，以及土贡方物，' +
      '悉并为一条，皆计亩征银，折办于官。',
    against: '江南乡绅、大户，以及靠包揽、飞洒、诡寄吃饭的胥吏',
    cost: 3,
    on: false,
    need: { flag: 'open_yitiaobian', hint: '尚无人把赋役归并的事提到你面前' },
    effect: {
      taicang: 0.55,
      metric: { minxin: -0.16, guanfeng: -0.1 },
    },
    gains: ['太仓年增约 20 万两', '胥吏包揽之弊去了大半'],
    costs: ['民心年降六分：卖谷换银，谷贱银贵', '官风年降四分：火耗成了新的名目'],
    aftermath: '秋成卖谷换银，谷贱银贵；江南士绅联名请减，署名者二百四十七人。',
  },
  {
    id: 'yanfa',
    name: '纲运盐法',
    group: '财政',
    brief: '盐课改由官商纲运，径解户部，不再召商开中',
    text:
      '两淮、长芦、山东盐课，改行纲运：商纳银于运司，领引支盐，' +
      '岁课定额解部。边镇开中之例，暂停。',
    against: '边镇将官（他们吃的是开中商人的粮），以及原来的边商',
    cost: 3,
    on: false,
    fromTurn: 5,
    need: { flag: 'open_yanfa', hint: '尚无人把盐课与边储的事提到你面前' },
    effect: {
      taicang: 0.45,
      metric: { guanfeng: -0.12, bianfang: -0.06 },
    },
    gains: ['太仓年增约 16 万两', '盐课不必再由商人转手，账目清楚'],
    costs: ['官风年降四分：运司与纲商分利', '边防年降二分：边镇粮储改由太仓出，常不到位'],
    aftermath: '边商散去，边镇的粮仓空了一半。辽东的军士开始有逃的。',
  },
  {
    id: 'caozhe',
    name: '漕粮改折',
    group: '财政',
    brief: '漕粮改折银两解京，省运军与耗米',
    text:
      '南直隶、浙江、江西应运漕粮，准其改折银两，每石折银七钱，' +
      '解太仓，听京仓采买。运军月粮，减半支给。',
    against: '漕运总督、运军十二万、沿河州县',
    cost: 4,
    on: false,
    fromTurn: 8,
    need: { flag: 'open_caozhe', hint: '尚无人把漕运之弊提到你面前' },
    effect: {
      taicang: 0.6,
      metric: { minxin: -0.2, guanfeng: -0.05 },
      backlog: -0.1,
    },
    gains: ['太仓年增约 22 万两：省的耗米与运军月粮', '河工、闸座的压力一并轻了'],
    costs: ['民心年降七分：京师米价渐贵，运军失业', '官风年降二分：京仓采买，又是一道手脚'],
    aftermath: '运军十二万失了月粮，沿河的州县多了几万闲人。',
  },
  {
    id: 'haiyun',
    name: '漕粮海运',
    group: '财政',
    brief: '漕粮自淮安出海，由天津入京，不经运河',
    text:
      '岁漕四百万石，改由淮安出海，经登莱至天津，转输入京。' +
      '沿途设沙船三百，募水手，岁给工食。运河仍留一半，以备不虞。',
    against: '漕运衙门、沿河纤夫、闸官（整条运河上的人）',
    cost: 4,
    on: false,
    fromTurn: 14,
    need: { flag: 'open_haiyun', hint: '尚无人把运河淤塞的事提到你面前' },
    exclusive: ['caozhe'],
    effect: {
      taicang: 0.35,
      metric: { chaoshi: -0.15, bianfang: 0.05 },
    },
    gains: ['太仓年增约 13 万两：省闸座、浅夫、过淮之费', '海船养水手，海防顺带有了人'],
    costs: ['朝局年降五分：漕运一系的官全成了对头', '漂没不可控：一船沉了，就是几百条命'],
    aftermath: '运河上的纤夫、闸官、浅夫，一夜之间没了差事。海运漂没的折子，一年会来几回。',
  },
  {
    id: 'mazheng',
    name: '马政折银',
    group: '财政',
    brief: '民养马改折银，太仆寺收银买马',
    text:
      '北直隶、山东、河南民牧马匹，自今改折银两，每匹折银十两，解太仆寺。' +
      '边镇用马，由太仆寺发银采买。',
    against: '养马的民户（这本来是他们的苦役，如今变成银）、边镇将领',
    cost: 3,
    on: false,
    fromTurn: 6,
    need: { flag: 'open_mazheng', hint: '尚无人把马政之累提到你面前' },
    effect: {
      taipu: 0.5,
      metric: { bianfang: -0.1 },
    },
    gains: ['太仆寺年增约 18 万两', '民户免了养马之苦'],
    costs: ['边防年降四分：边镇战马渐少，临时买马价倍'],
    aftermath: '太仆寺的银子堆着，边镇的马却少了。真打起来，银子买不到马。',
  },
  {
    id: 'juanmian',
    name: '蠲免逋赋',
    group: '财政',
    brief: '免万历十年以前各省积欠，与民休息',
    text: '各省自万历十年以前逋欠钱粮，除已征在官者，余皆蠲免。' +
      '州县不得再行追比，违者论罪。',
    against: '户部（这笔账他们记了十年）、州县官（追比是他们的进项）',
    cost: 3,
    on: false,
    need: { flag: 'open_juanmian', hint: '尚无人把积欠的事提到你面前' },
    effect: {
      taicang: -0.5,
      metric: { minxin: 0.35, guanfeng: 0.05 },
    },
    immediate: { taicang: -12 },
    gains: ['民心年升十二分：民力稍苏，逃亡者归', '官风年升二分：追比之弊暂息'],
    costs: ['太仓年减 18 万两，另有一笔 12 万的旧账一笔勾销'],
    aftermath: '蠲免的诏书下了，州县照样在收 —— 收上来的，进了自己的库。',
  },
  {
    id: 'jiapai',
    name: '亩加三厘',
    group: '财政',
    brief: '天下田亩，每亩加征三厘，专备边饷',
    text: '天下田亩，每亩加银三厘，名曰「辽饷预征」，专解太仓，以备边用。' +
      '不得挪作他用。',
    against: '天下有田的人；以及所有知道「加派一开，就收不回去」的人',
    cost: 3,
    on: false,
    fromTurn: 10,
    need: { flag: 'open_jiapai', hint: '尚无人敢把加派两个字写在纸上' },
    effect: {
      taicang: 0.8,
      metric: { minxin: -0.5, chaoshi: -0.1 },
    },
    gains: ['太仓年增约 29 万两：这是最快的一笔钱'],
    costs: ['民心年降 18 分：民力大困', '朝局年降四分：清议鼎沸'],
    aftermath: '加派一开，就收不回去。三年之后，「三厘」变成「一分」，再变成「三分」。',
  },
  {
    id: 'kaihai',
    name: '开海通商',
    group: '财政',
    brief: '月港开关，商民出海贩运，抽税以佐国用',
    text:
      '准福建月港通商，商民造船出海，贩运东西两洋。' +
      '凡出海者，给引抽税，岁有定额。卫所不得擅拦，违者论罪。',
    against: '沿海卫所、言官，以及所有靠「海禁」二字吃饭的人',
    cost: 3,
    on: false,
    need: { flag: 'open_kaihai', hint: '尚无人把海禁之弊提到你面前' },
    effect: {
      taicang: 0.4,
      metric: { bianfang: -0.14, minxin: 0.06 },
    },
    gains: ['太仓年增约 14 万两', '闽广之民有了生路，民心年升二分'],
    costs: ['边防年降五分：卫所失了稽查，海寇混迹商船'],
    aftermath: '商船既多，海寇亦混杂其中。真倭已少，多是漳泉之人，挟倭为名。',
  },
  {
    id: 'kuangshui',
    name: '开采矿税',
    group: '财政',
    brief: '遣内官监矿，抽分纳税，径解内帑',
    text: '天下矿脉，听民开采，官为抽分。遣内官监税，径解内帑，不经户部。',
    against: '地方官、生员、百姓——开矿这件事，历来是要出人命的',
    cost: 3,
    on: false,
    fromTurn: 9,
    // 只有真到了没钱的时候，才有人敢提这一条
    need: { flag: 'open_kuangshui', hint: '帑藏未到山穷水尽，尚无人敢提开矿' },
    effect: {
      neitang: 0.9,
      metric: { minxin: -0.4, guanfeng: -0.24 },
    },
    gains: ['内帑年增约 32 万两（不进户部的账）'],
    costs: ['民心年降 14 分：掘及田墓', '官风年降 9 分：矿使与地方分赃'],
    aftermath: '矿使四出，掘及民田庐墓。湖广聚众数千，喊的是「逐矿使」。',
  },

  /* ══════════════════════════════════════════════ 吏治 */
  {
    id: 'rongyuan',
    name: '汰冗员',
    group: '吏治',
    brief: '裁革冗官冗役，省俸省役',
    text:
      '两京各衙门，凡添设、冗滥、闲住之官，尽行裁革。' +
      '各省佐贰、首领官，量事之繁简，去其三之一。',
    against: '被裁的人、以及所有怕下一个被裁的人',
    cost: 3,
    on: false,
    fromTurn: 7,
    need: { flag: 'open_rongyuan', hint: '尚无人把冗官之弊提到你面前' },
    effect: {
      taicang: 0.35,
      metric: { guanfeng: 0.1, chaoshi: -0.2 },
    },
    gains: ['太仓年增约 13 万两（省下的俸禄与役银）', '官风年升四分：少了几个吃闲饭的'],
    costs: ['朝局年降七分：被裁的人，门生故吏遍天下'],
    aftermath: '裁下去的人回乡，写信给同年；同年在京，开始给你递不好看的本子。',
  },
  {
    id: 'caiyi',
    name: '裁驿',
    group: '吏治',
    brief: '裁并驿站，核减夫马，禁止滥支',
    text:
      '天下驿站，量道里之冲僻，裁并十之三。凡无勘合而支应者，' +
      '一概禁绝。驿递银两，岁解户部。',
    against: '驿卒、沿途州县，以及所有靠勘合白吃白住的人',
    cost: 3,
    on: false,
    fromTurn: 9,
    need: { flag: 'open_caiyi', hint: '尚无人把驿递之滥提到你面前' },
    effect: {
      taicang: 0.3,
      metric: { minxin: -0.25, guanfeng: 0.05 },
    },
    gains: ['太仓年增约 11 万两', '驿递肃清，冒支的少了'],
    costs: ['民心年降九分：驿卒数万失业'],
    aftermath: '驿卒失了差事，流为盗。二十年后，有一个叫李自成的，就是驿卒出身。',
  },
  {
    id: 'qingjun',
    name: '清军',
    group: '吏治',
    brief: '清查卫所军籍，勾补逃亡，核实兵额',
    text:
      '各都司卫所，清查军籍：凡逃亡者，勾其户丁补伍；冒名顶替者，革。' +
      '每年一造册，送兵部备查。',
    against: '卫所军官（空额是他们的进项）、被勾军的民户',
    cost: 3,
    on: false,
    fromTurn: 10,
    need: { flag: 'open_qingjun', hint: '尚无人把卫所空额的事提到你面前' },
    effect: {
      taicang: 0.15,
      metric: { bianfang: 0.15, minxin: -0.15 },
    },
    gains: ['边防年升五分：兵额实了', '太仓年增约 5 万两：少了空饷'],
    costs: ['民心年降五分：勾军勾到人家破人亡'],
    aftermath: '勾军的差役下了乡，一县哭的比征兵还多。卫所的册子，照样是假的。',
  },
  {
    id: 'shangtun',
    name: '商屯开中',
    group: '吏治',
    brief: '召商纳粮边镇，给盐引偿之，恢复开中旧制',
    text: '九边缺粮之处，召商纳粟，官给盐引，听其自运自卖。' +
      '边地荒田，许商人开垦，三年不起科。',
    against: '运司（盐利要分出去）、地方官（边地开垦，管不着了）',
    cost: 3,
    on: false,
    fromTurn: 8,
    need: { flag: 'open_shangtun', hint: '尚无人把边储不足提到你面前' },
    effect: {
      taicang: 0.1,
      metric: { bianfang: 0.12, minxin: -0.05, guanfeng: -0.05 },
    },
    gains: ['边防年升四分：边镇有粮了', '太仓年增约 4 万两'],
    costs: ['民心年降二分；官风年降二分：商人借边地营私'],
    aftermath: '边商在关外置了田，养了家丁。这些人后来既不像民，也不像兵。',
  },

  /* ══════════════════════════════════════════════ 军务 */
  {
    id: 'jingying',
    name: '京营募兵',
    group: '军务',
    brief: '京营改世袭军户为募兵，厚给粮饷，选锋操练',
    text: '京营疲敝，改行募兵：选民间壮丁，月给银一两五钱，' +
      '另设选锋三千，专习火器。卫所军户，渐次改募。',
    against: '卫所军官（军户是他们的私产）、户部（这笔钱谁出）',
    cost: 4,
    on: false,
    fromTurn: 10,
    need: { flag: 'open_jingying', hint: '尚无人把京营疲敝的事提到你面前' },
    effect: {
      taicang: -0.5,
      metric: { bianfang: 0.25, guanfeng: 0.05 },
    },
    gains: ['边防年升九分：京营真的能打了'],
    costs: ['太仓年减 18 万两：募兵最贵的就是这一笔'],
    aftermath: '募来的兵，饷一断就散。这笔钱一旦开了头，就再也停不下来。',
  },
  {
    id: 'neicao',
    name: '内操',
    group: '军务',
    brief: '简选内臣习武于宫中，京营提督归内监',
    text: '简选内臣年少者三千，习弓马火器于内教场，号「内操」。' +
      '京营提督，以内臣兼领。',
    against: '外廷、兵部、京营将领',
    cost: 3,
    on: false,
    fromTurn: 12,
    need: { flag: 'open_neicao', hint: '尚无人敢提内臣典兵' },
    effect: {
      metric: { bianfang: 0.1, chaoshi: -0.25, guanfeng: -0.1 },
    },
    gains: ['边防年升四分：宫里有一支能用的兵', '内廷对你更死心塌地'],
    costs: ['朝局年降九分：外廷视为宦官掌兵之始', '官风年降四分'],
    aftermath: '内操的鼓声每夜从宫里传出来。外廷听着，谁也不说话。',
  },

  /* ══════════════════════════════════════════════ 士林 */
  {
    id: 'jiangxue',
    name: '弛讲学之禁',
    group: '士林',
    brief: '开书院，许士人讲学议政',
    text: '各省书院，许其复设。士人讲学，不必先报有司。' +
      '但有聚众干政、诽谤朝政者，仍以律论。',
    against: '保守的阁臣、地方官（书院一开，士论就不受管了）',
    cost: 2,
    on: false,
    fromTurn: 9,
    need: { flag: 'open_jiangxue', hint: '尚无人把书院的事提到你面前' },
    exclusive: ['jinjiangxue'],
    effect: {
      metric: { guanfeng: 0.15, minxin: 0.1, chaoshi: -0.12 },
    },
    gains: ['官风年升五分：士论能说话，吏治有人盯着', '民心年升四分'],
    costs: ['朝局年降四分：书院议政，议到后来就议到朝廷头上'],
    aftermath: '书院里讲学，讲的是「君心」「民生」。讲了几年，讲出几个敢上书骂你的人。',
  },
  {
    id: 'jinjiangxue',
    name: '禁书院讲学',
    group: '士林',
    brief: '尽毁天下书院，禁士人聚讲',
    text: '天下书院，除先贤祠宇外，尽行拆毁。士人聚众讲学，' +
      '以违制论。有司查报，岁终具奏。',
    against: '士林、讲学诸生；连张居正当年办这事，也被骂了十年',
    cost: 3,
    on: false,
    fromTurn: 9,
    need: { flag: 'open_jinjiangxue', hint: '尚无人把讲学之风提到你面前' },
    exclusive: ['jiangxue'],
    effect: {
      metric: { chaoshi: 0.2, guanfeng: -0.15, minxin: -0.1 },
    },
    gains: ['朝局年升七分：没人聚众议政了'],
    costs: ['官风年降五分：没了清议，贪的更大胆', '民心年降四分'],
    aftermath: '书院拆了，讲学的人散了。十年后重开，回来的人第一件事是写你的本纪。',
  },
  {
    id: 'tingzhang',
    name: '廷杖言官',
    group: '士林',
    brief: '言事忤旨者，于午门杖之，以警其余',
    text: '凡言官论事失当、讪上卖直者，锦衣卫于午门外杖之。',
    against: '士林、言路。这一条不打人，是打读书人的脸',
    cost: 2,
    on: false,
    fromTurn: 8,
    need: { flag: 'open_tingzhang', hint: '言路尚未闹到要动杖的地步' },
    effect: {
      backlog: -0.25,
      metric: { chaoshi: -0.3, guanfeng: -0.1 },
    },
    gains: ['案头清静：没人天天上疏骂你了'],
    costs: ['朝局年降 11 分：士林离心', '官风年降四分；连坏消息也没人报了'],
    aftermath: '打完之后没人说话了 —— 连坏消息也没人报了，科道缺员过半无人肯补。',
  },

  /* ══════════════════════════════════════════════ 宗室 */
  {
    id: 'zonglu',
    name: '宗禄折色',
    group: '宗室',
    brief: '宗室俸禄改折银两，减本色，定额永为定制',
    text:
      '宗室禄米，自今改折银两，每石折银五钱。' +
      '其有逾额多支者，驳回。各王府不得再请增额。',
    against: '各王府、宗人府，以及所有姓朱的人',
    cost: 4,
    on: false,
    fromTurn: 3,
    need: { flag: 'open_zonglu', hint: '尚无人把宗禄不敷的事提到你面前' },
    effect: {
      taicang: 0.7,
      metric: { chaoshi: -0.22 },
    },
    gains: ['太仓年增约 25 万两'],
    costs: ['朝局年降八分：宗室怨望'],
    aftermath: '各王府怨望，襄王先请「臣府独支本色」，二十几个王府跟着递本。',
  },
  {
    id: 'xianfeng',
    name: '宗藩限封',
    group: '宗室',
    brief: '郡王以下不再世袭罔替，减等承袭，限其禄',
    text: '宗室自郡王以下，不世袭罔替：亲王之子封郡王，郡王之子降封镇国将军，' +
      '以次递降。禄米随爵递减。',
    against: '所有宗室。这条法一出，等于告诉朱家的人：往后不再养你们了',
    cost: 5,
    on: false,
    fromTurn: 12,
    need: { flag: 'open_xianfeng', hint: '尚无人敢议宗室世封' },
    exclusive: [],
    effect: {
      taicang: 0.5,
      metric: { chaoshi: -0.3 },
    },
    gains: ['太仓年增约 18 万两：这笔钱是逐年省下来的'],
    costs: ['朝局年降 11 分：宗室视你为夺其世业之人'],
    aftermath: '宗人府的头一件事，是把你的名字从「朱氏子孙」那一册里划出来另记。',
  },
]

const BY_ID = new Map(STATUTES.map((s) => [s.id, s]))
export const statuteById = (id: string) => BY_ID.get(id)

/** 一条法现在能不能动。null 表示可以；返回字符串就是不能动的原因 */
export function statuteLock(s: WorldState, st: Statute): string | null {
  if (st.need && !(s.flags[st.need.flag] ?? 0)) return st.need.hint
  if (st.fromTurn !== undefined && s.turn < st.fromTurn) return '时机未到'
  return null
}

/** 这一局已经浮出水面的律令。没浮出来的，界面上不显示 */
export function visibleStatutes(s: WorldState): Statute[] {
  return STATUTES.filter(
    (st) => st.on || !!s.statutes[st.id] || !st.need || (s.flags[st.need.flag] ?? 0) > 0,
  )
}

/** 还没人提到你面前的律令（只报数目，不报名字） */
export function hiddenStatuteCount(s: WorldState): number {
  return STATUTES.length - visibleStatutes(s).length
}

/** 已施行多少旬 */
export function statuteRuns(s: WorldState, id: string): number {
  return Math.round(s.flags[`runs_${id}`] ?? 0)
}

/** 这条法到手一共给过多少银子（万两） */
export function statuteYield(s: WorldState, id: string): number {
  return Math.round((s.flags[`yield_${id}`] ?? 0) * 10) / 10
}

/** 把一份效果落地（立法的即时效果用它） */
function applyNow(s: WorldState, e: StatuteEffect): void {
  if (e.backlog) s.backlog = Math.max(0, s.backlog + e.backlog)
  if (e.taicang) s.taicang += e.taicang
  if (e.neitang) s.neitang += e.neitang
  if (e.taipu) s.taipu += e.taipu
  if (e.metric) {
    for (const [k, v] of Object.entries(e.metric)) {
      const key = k as MetricKey
      s.truth[key] = clamp(s.truth[key] + (v ?? 0), 0, 100)
    }
  }
}

/** 立或废，都是一句话的事；后果在往后每一旬 */
export function toggleStatute(s: WorldState, id: string): WorldState {
  const st = BY_ID.get(id)
  if (!st) return s
  if (statuteLock(s, st)) return s
  if (s.energy < st.cost) return s

  const now = !s.statutes[id]
  const statutes = { ...s.statutes, [id]: now }
  const flags = { ...s.flags, [`st_from_${id}`]: now ? s.turn : 0 }
  const log = [
    ...s.log,
    {
      turn: s.turn,
      text: now ? `诏行《${st.name}》。` : `诏罢《${st.name}》。`,
      tone: 'red' as const,
    },
  ]

  // 互斥：立了这条，那条自动罢 —— 制度之间也打架
  if (now && st.exclusive) {
    for (const other of st.exclusive) {
      if (statutes[other]) {
        statutes[other] = false
        flags[`st_from_${other}`] = 0
        const on = BY_ID.get(other)
        log.push({
          turn: s.turn,
          text: `《${on?.name ?? other}》与《${st.name}》不并行，并罢。`,
          tone: 'red' as const,
        })
      }
    }
  }

  const next: WorldState = { ...s, energy: s.energy - st.cost, statutes, flags, log }
  // 立法的即时效果（赏、赈、一笔勾销的旧账）
  if (now && st.immediate) applyNow(next, st.immediate)
  return next
}

/** 每旬都往账上记一笔：施行旬数 + 银子。执行汇报的奏疏要读这个数 */
function credit(s: WorldState, id: string, money: number): void {
  s.flags[`runs_${id}`] = (s.flags[`runs_${id}`] ?? 0) + 1
  if (money > 0) s.flags[`yield_${id}`] = (s.flags[`yield_${id}`] ?? 0) + money
}

/**
 * 每旬，律令在暗处用力。
 *
 * 数字都很小 —— 一条法不会让你当旬看出变化，
 * 三年五年下来，它把国家推到了另一个地方。
 */
export function tickStatutes(s: WorldState): void {
  for (const st of STATUTES) {
    if (!s.statutes[st.id]) continue
    const e = st.effect

    if (e.backlog) s.backlog = Math.max(0, s.backlog + e.backlog)
    if (e.taicang) s.taicang += e.taicang
    if (e.neitang) s.neitang += e.neitang
    if (e.taipu) s.taipu += e.taipu
    if (e.metric) {
      for (const [k, v] of Object.entries(e.metric)) {
        const key = k as MetricKey
        s.truth[key] = clamp(s.truth[key] + (v ?? 0), 0, 100)
      }
    }
    credit(s, st.id, (e.taicang ?? 0) + (e.neitang ?? 0) + (e.taipu ?? 0))
  }

  // 法与人相激：两条法叠在一起，比两条法各走各的更狠
  if (s.statutes.kaocheng && s.statutes.yitiaobian) {
    // 考成压着一条鞭，州县不敢报灾
    s.truth.minxin = clamp(s.truth.minxin - 0.05, 0, 100)
  }
  if (s.statutes.kaocheng && s.statutes.kuangshui) {
    // 矿使有考成撑腰，地方更不敢拦
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.05, 0, 100)
  }
  if (s.statutes.jiapai && s.statutes.caiyi) {
    // 加派与裁驿叠在一起：失了差事的人，又要多交一份钱
    s.truth.minxin = clamp(s.truth.minxin - 0.08, 0, 100)
  }
  if (s.statutes.jinjiangxue && s.statutes.tingzhang) {
    // 书院拆了，言官也打了：这天下就没有人说话了
    s.truth.chaoshi = clamp(s.truth.chaoshi - 0.08, 0, 100)
  }
  if (s.statutes.zonglu || s.statutes.xianfeng) {
    // 宗室被夺了世业，不会坐着等：藩府拖欠、地方代垫、行贿求通融
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.06, 0, 100)
    s.taicang -= 0.2
  }
}

/* ------------------------------------------------------------------ *
 * 给人看的说法
 * ------------------------------------------------------------------ */

const METRIC_NAME: Record<MetricKey, string> = {
  minxin: '民心',
  bianfang: '边防',
  guanfeng: '官风',
  chaoshi: '朝局',
}

const fmt = (v: number) => (v > 0 ? `+${v}` : `${v}`)

export interface EffectLines {
  gains: string[]
  costs: string[]
}

/**
 * 这条法每旬到底在干什么 —— 按得失分两栏。
 * 结算用 effect，这段文字也从 effect 生成：改数值只改一处，说明不会和实现打架。
 */
export function effectLines(st: Statute): EffectLines {
  const e = st.effect
  const gains: string[] = []
  const costs: string[] = []

  const push = (line: string, v: number) => (v > 0 ? gains : costs).push(line)

  if (e.taicang) push(`太仓 ${fmt(e.taicang)} 万/旬（一年约 ${fmt(Math.round(e.taicang * 36))} 万两）`, e.taicang)
  if (e.neitang) push(`内帑 ${fmt(e.neitang)} 万/旬（一年约 ${fmt(Math.round(e.neitang * 36))} 万两）`, e.neitang)
  if (e.taipu) push(`太仆 ${fmt(e.taipu)} 万/旬（一年约 ${fmt(Math.round(e.taipu * 36))} 万两）`, e.taipu)
  for (const [k, v] of Object.entries(e.metric ?? {})) {
    const key = k as MetricKey
    push(`${METRIC_NAME[key]} ${fmt(v)}/旬（一年约 ${fmt(Math.round(v * 36))}）`, v)
  }
  if (e.backlog) {
    // 案头积压减少是「得」，增加是「失」
    const n = Math.abs(e.backlog)
    const line = `案头积压 ${e.backlog < 0 ? '减' : '增'} ${n} 件/旬（一年约 ${Math.round(n * 36)} 件）`
    push(line, -e.backlog)
  }
  // 得在前，按量级排
  return { gains, costs }
}

/** 立法当旬的一次性得失（没有则返回空数组） */
export function immediateLines(st: Statute): EffectLines {
  const e = st.immediate
  const gains: string[] = []
  const costs: string[] = []
  if (!e) return { gains, costs }
  if (e.taicang) (e.taicang > 0 ? gains : costs).push(`太仓 ${fmt(e.taicang)} 万两（一次性）`)
  if (e.neitang) (e.neitang > 0 ? gains : costs).push(`内帑 ${fmt(e.neitang)} 万两（一次性）`)
  if (e.taipu) (e.taipu > 0 ? gains : costs).push(`太仆 ${fmt(e.taipu)} 万两（一次性）`)
  return { gains, costs }
}
