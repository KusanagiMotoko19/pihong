/**
 * 《批红》核心类型
 *
 * 一条原则：玩家看到的一切都是「奏报」，真相在 WorldState.truth 里，
 * 只有召对、密奏、亲查这三条路能窥见。
 */

/** 四维国情 */
export type MetricKey = 'minxin' | 'bianfang' | 'guanfeng' | 'chaoshi'

export const METRIC_LABEL: Record<MetricKey, string> = {
  minxin: '民心',
  bianfang: '边防',
  guanfeng: '官风',
  chaoshi: '朝局',
}

/** 三本账 */
export type LedgerKey = 'taicang' | 'neitang' | 'taipu'

export const LEDGER_LABEL: Record<LedgerKey, string> = {
  taicang: '太仓',
  neitang: '内帑',
  taipu: '太仆',
}

/** 奏疏类别 */
export type MemorialKind = 'routine' | 'urgent' | 'project' | 'personnel' | 'impeach'

export const KIND_LABEL: Record<MemorialKind, string> = {
  routine: '例行',
  urgent: '急',
  project: '事项',
  personnel: '人事',
  impeach: '弹章',
}

export type Faction =
  | '江陵旧人'
  | '晋党'
  | '浙党'
  | '清流'
  | '边将'
  | '内廷'
  | '新进'
  | '无党'

/**
 * 官员。四个隐藏数值玩家看不到，只能从三处隐约看出：
 *   一、考语（吏部给的评语，本身也可能不实）
 *   二、召对时的言语神情
 *   三、到任之后的成效
 */
export interface Officer {
  id: string
  name: string
  courtesy: string
  /** 籍贯，如「山西阳城」 */
  origin: string
  /** 科第，如「嘉靖二十三年进士」 */
  jinshi: string
  birthYear: number

  /** 现职 id，null 表示在籍候选（人才库） */
  officeId: string | null

  /** 履历一句话 */
  bio: string
  /** 考语：吏部会同都察院给的评语 */
  appraisal: string

  /** 德：品行。决定会不会背着你结党、他的弹章可不可信。 */
  de: number
  /** 能：才干。决定办事水平、票拟质量、项目推进。 */
  neng: number
  /** 勤：勤勉。决定办事快慢，会不会拖着不办。 */
  qin: number
  /** 绩：政绩。决定实际成效——能干的未必出活，出活才算。 */
  ji: number
  /** 廉：操守。决定贪腐与奏报失真的方向。 */
  lian: number

  faction: Faction
  /** 声望：士林与言官的评价，可见，但也可被炒起来 */
  reputation: number

  /** 召对时逐条揭示的印象 */
  impressions: string[]
  revealed: number
  /** 已任现职的旬数 */
  tenure: number
  /** 是否历史人物。名臣起始数值高，且履历是真的 */
  historical?: boolean

  /** 说话的样子。同一件事，五种人五种说法。 */
  speech: SpeechStyle
  /** 家里那点事。问到家事时用得上，也是他私心的来处。 */
  privateLife: string
  /** 他要什么。升迁、回乡、请封、保子孙——你不给，他就自己找。 */
  want: string
  /** 丁忧守制到第几旬。守制的人不在候选名录里，也不能被起用 */
  leaveUntil?: number
}

/** 说话的样式 */
export type SpeechStyle = 'blunt' | 'sly' | 'pedant' | 'dull' | 'warm'

/** 认知的五个侧面 */
export type Facet = 'talent' | 'integrity' | 'temper' | 'faction' | 'record'

export const FACET_LABEL: Record<Facet, string> = {
  talent: '才具',
  integrity: '操守',
  temper: '性情',
  faction: '党与',
  record: '履历',
}

/** 一条线索：你从某一处听来/看出来的一点东西 */
export interface Clue {
  facet: Facet
  /** 1 最低 5 最高；faction 与 record 不用 */
  band: 1 | 2 | 3 | 4 | 5
  /** 记在本子上的那句话 */
  text: string
  /** 从哪来的 */
  source: 'audience' | 'rumor' | 'result' | 'record'
  /** 谁说的（rumor / result 时有） */
  from?: string
  turn: number
  /** 这条其实不准。玩家看不出来。 */
  false?: boolean
}

/** 四夷与藩属 */
export type PowerKind = 'tribe' | 'state' | 'tributary' | 'rebel'

export interface Power {
  id: string
  name: string
  kind: PowerKind
  /** 与我朝接壤的方向，对应边镇或行省 */
  region: string
  /** 对我朝的态度 -100 到 100 */
  attitude: number
  /** 实力 0-100 */
  strength: number
  /** 威胁 0-100：它有多想、多能打我 */
  threat: number
  /** 现状一句话 */
  status: string
  /** 首领 */
  leader: string
  /** 已互动过的次数 */
  contacts: number
}


/**
 * 内臣：太监与锦衣卫。
 *
 * 这套人不是官，是家奴。他们的四个数跟文官不是一回事：
 *   忠 —— 对你一个人
 *   干 —— 会不会办事
 *   贪 —— 捞不捞钱
 *   势 —— 手里有多少人
 */
export type InnerKind = 'eunuch' | 'guard'

export interface InnerOfficer {
  id: string
  name: string
  kind: InnerKind
  /** 所属机构 id */
  officeId: string
  /** 职名，如「司礼监掌印太监」 */
  title: string
  bio: string
  loyalty: number
  competence: number
  greed: number
  power: number
  impressions: string[]
  revealed: number
}

/** 内廷机构 */
export interface InnerOffice {
  id: string
  name: string
  duty: string
  /** 这个机构能干什么，写给人看的 */
  power: number
}

/** 九边一镇 */
export interface Frontier {
  id: string
  name: string
  /** 额兵（万人） */
  troops: number
  /** 实额（万人）—— 隐藏，只有查过才知道 */
  actual: number
  /** 马匹（千匹） */
  horses: number
  /** 年例银（万两） */
  pay: number
  /** 战备 0-100 */
  readiness: number
  /** 是否查过实额 */
  audited: boolean
}

/** 事项：皇帝真正做的事是立项、派人、拨款、验收 */
export interface Project {
  id: string
  name: string
  goal: string
  /** 承办人 */
  stewardId: string
  /** 已拨银（万两） */
  budget: number
  /** 已支（万两） */
  spent: number
  /** 真实进度 0-100 */
  progress: number
  /** 臣子报上来的进度 0-100 */
  reported: number
  /** 阻力 0-100：既得利益者的反扑 */
  resistance: number
  /** 已运行旬数 */
  months: number
  /** 真实进度是否已被告知（密奏 / 亲查） */
  exposed: boolean
  status: 'running' | 'done' | 'failed' | 'scandal'
  /** 阶段：筹备 / 推行 / 收尾 */
  stage: 'prep' | 'promote' | 'close'
  /** 谁在反对，为什么 */
  opponents: { name: string; reason: string }[]
  /** 关键节点：进度到多少时发生什么 */
  milestones: { at: number; text: string; hit: boolean }[]
  /** 大事记 */
  history: { turn: number; text: string }[]
}

/** 效果：声明式，纯函数可测 */
export interface Effect {
  taicang?: number
  neitang?: number
  taipu?: number
  metrics?: Partial<Record<MetricKey, number>>
  /** 三本账的另一种写法（律令类奏疏用，读起来清楚些） */
  ledger?: { taicang?: number; neitang?: number; taipu?: number }
  /** metrics 的另一种写法 */
  metric?: Partial<Record<MetricKey, number>>
  /** 直接改律令状态 */
  statutes?: Record<string, boolean>
  /** 壅滞增减 */
  backlog?: number
  energy?: number
  project?: {
    id: string
    progress?: number
    reported?: number
    budget?: number
    resistance?: number
    expose?: boolean
    status?: Project['status']
  }
  flags?: Partial<Record<string, number>>
  /** 写入起居注的一条 */
  log?: string
  /** 下月追加的奏疏模板 id */
  spawn?: string[]
  /** 揭示某人的一条印象 */
  reveal?: string
  /** 调整考成政策 */
  policy?: Partial<Policy>
  /** 四夷与藩属 */
  power?: {
    id: string
    attitude?: number
    strength?: number
    threat?: number
    status?: string
  }
  /** 九边 */
  frontier?: {
    id: string
    readiness?: number
    actual?: number
    troops?: number
    audited?: boolean
  }
  /** 任免：把某人放到某个位子上（officeId 为 null 即罢职归籍） */
  appoint?: {
    officerId: string
    officeId: string | null
  }
  /** 守制：某人回籍丁忧，多少旬内不得起用 */
  leave?: {
    officerId: string
    xun: number
  }
}

/** 批红选项。玩家细看后才看得到「改拟」的备选。 */
export interface Option {
  key: string
  /** 朱批文字，写进起居注 */
  label: string
  /** 是否必须细看才能选 */
  needsReading?: boolean
  effect: Effect
  /** 奏疏票拟旁的小字提示 */
  note?: string
}

export type DecreeKind = 'yi' | 'liuzhong'

export interface Memorial {
  id: string
  templateId: string
  kind: MemorialKind
  /** 具奏人，如「户部尚书 王国光」 */
  from: string
  /** 具奏人在名册里的 id，用来显示他的档案 */
  senderId?: string
  /** 这件事的来龙去脉：为什么现在递上来 */
  background?: string
  /** 事由，如「为清丈田亩事」 */
  title: string
  /** 一句提要，不细看也能看到 */
  summary: string
  /** 全文，须细看 */
  body: string
  /** 内阁票拟 */
  piaoni: string
  /** 依拟时执行的票拟效果 */
  yiEffect: Effect
  /** 细看后可选的全部选项（含依拟、留中） */
  options: Option[]
  /** 已留中几个月 */
  stayMonths: number
  /** 忍耐月数，超过则触发 ignoredEffect */
  patience: number
  /** 留中逾期的后果 */
  ignoredEffect?: Effect
  /** 已细看 */
  read: boolean
  /** 已处理 */
  resolved: boolean
  /** 细看才看得见的一句话：这道票拟背后的私心 */
  secret?: string
}

export interface LogEntry {
  turn: number
  /** 起居注体：某年某月，某事 */
  text: string
  tone: 'normal' | 'good' | 'bad' | 'red'
}

/** 政策仪表盘 —— 本作的元机制 */
export interface Policy {
  /** 征收达标线，70-100，越高州县越要敲扑小民 */
  quota: number
  /** 处罚烈度 0-3：罚俸 / 降级 / 革职 / 廷杖 */
  severity: number
}

export interface WorldState {
  /** 年月 + 旬（1 上旬、2 中旬、3 下旬） */
  date: { year: number; month: number; xun: number }
  /** 已过旬数 */
  turn: number
  energy: number
  maxEnergy: number

  taicang: number
  neitang: number
  taipu: number

  /** 真实国情 */
  truth: Record<MetricKey, number>
  /** 奏报国情 */
  reported: Record<MetricKey, number>

  /** 全部官员：officeId 非空者为在任，null 者为人才库 */
  officers: Officer[]

  /** 四夷与藩属 */
  powers: Power[]
  /** 九边 */
  frontiers: Frontier[]
  /** 内廷：太监与锦衣卫 */
  inner: InnerOfficer[]
  /** 司礼监代批：0 不授权，1 只代批例行，2 代批除急件外全部 */
  autopilot: number
  projects: Project[]

  /** 案头待批 */
  queue: Memorial[]
  /** 累计留中本数（壅滞） */
  backlog: number
  /** 已逾期、再也批不了的本子。它们不会消失，只会压在你身上 */
  shelved: number
  /** 本月新进本数 */
  incoming: number

  policy: Policy
  /** 律令：true = 施行中 */
  statutes: Record<string, boolean>
  /** 在办与已办的政令 */
  orders: Order[]

  log: LogEntry[]
  /** 玩家心里那本账：每个人你听说了什么 */
  knowledge: Record<string, Clue[]>
  flags: Record<string, number>
  /** 待生成的下月奏疏模板 */
  pending: string[]

  /** 随机种子，用于生成奏疏措辞与事件 */
  seed: number

  /** 是否已到结局 */
  over: boolean
}

/** 奏疏模板 */
export interface MemorialTemplate {
  id: string
  /** 类别 */
  kind: MemorialKind
  /** 抽取权重：越大越常见。不写按 1 算 */
  weight?: number
  /** 冷却：同一模板至少隔多少旬才可能再出 */
  cooldown?: number
  /** 只出一次的事（籍没、抄家、册立这类）：出过就不再进本 */
  once?: boolean
  /** 判定是否需要生成（满足条件才进本）。不写则恒真。 */
  when?: (s: WorldState) => boolean
  /** 需要哪些 flag 已置位才出（网状叙事用） */
  requires?: string[]
  /** 这些 flag 已置位就不出了 */
  forbids?: string[]
  /** 出本时置位的 flag（推进剧情用） */
  sets?: string[]
  /** 属于哪条叙事线 */
  line?: string
  /** 生成器。可以按当前局面动态改写措辞与数字。 */
  build: (s: WorldState) => Omit<Memorial, 'id' | 'templateId' | 'kind' | 'stayMonths' | 'read' | 'resolved'>
}

/**
 * 一道政令。
 *
 * 批红只是把话说出去。话说出去之后，得有人接、有人办、有人回话 ——
 * 而回话里的数，未必是真的。
 */
export interface Order {
  id: string
  /** 从哪本奏疏来（用于回头查） */
  source: string
  /** 交谁办 */
  executorId: string
  executorName: string
  executorOffice: string
  /** 交办的是什么事 */
  task: string
  turnStart: number
  /** 该回话的旬 */
  dueTurn: number
  /** 真进度 */
  progress: number
  /** 他报的进度 */
  reported: number
  /** 阻力：越是得罪人的事，阻力越大 */
  resistance: number
  status: 'running' | 'done' | 'exposed' | 'failed'
  /** 已回话 */
  answered: boolean
  /** 你核实过 */
  verified: boolean
}