import type { WorldState } from '../engine/types'
import { clamp } from '../engine/util'

/**
 * 律令。
 *
 * 皇帝管国家，靠三样东西：批一本折子（个案）、用一个人（人事）、
 * 立一条法（制度）。前两样是一时的，只有第三条能改国家的走向。
 *
 * 每条律令都有代价，而且代价不在颁布那天显现 —— 它在往后每一旬里渗出来。
 */

export interface Statute {
  id: string
  name: string
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
  /** 只在某些条件下才能动 */
  unlock?: (s: WorldState) => string | null
}

export const STATUTES: Statute[] = [
  {
    id: 'kaocheng',
    name: '考成法',
    brief: '立程限、三簿查考，征赋不足九成者降级',
    text:
      '凡诏令及征赋，皆立程限，置三簿：一存本部，一存六科，一存内阁。' +
      '逐月查考，年终稽核。抚按官征赋不足九成者，降三级；不完者，不许升转。',
    against: '州县官、吏部考功司，以及所有怕被追着要结果的人',
    cost: 2,
    on: true,
  },
  {
    id: 'yitiaobian',
    name: '一条鞭法',
    brief: '赋役合并、计亩征银、官收官解',
    text:
      '总括一州县之赋役，量地计丁，丁粮毕输于官。岁役亦编为银，' +
      '归于一条。凡额办、派办、京库岁需与存留供亿诸费，以及土贡方物，' +
      '悉并为一条，皆计亩征银，折办于官。',
    against: '江南乡绅、大户，以及靠包揽、飞洒、诡寄吃饭的胥吏',
    cost: 3,
    on: false,
    fromTurn: 0,
  },
  {
    id: 'kaihai',
    name: '开海通商',
    brief: '月港开关，商民出海贩运，抽税以佐国用',
    text:
      '准福建月港通商，商民造船出海，贩运东西两洋。' +
      '凡出海者，给引抽税，岁有定额。卫所不得擅拦，违者论罪。',
    against: '沿海卫所、言官，以及所有靠「海禁」二字吃饭的人',
    cost: 3,
    on: false,
    fromTurn: 0,
  },
  {
    id: 'zonglu',
    name: '宗禄折色',
    brief: '宗室俸禄改折银两，减本色，定额永为定制',
    text:
      '宗室禄米，自今改折银两，每石折银五钱。' +
      '其有逾额多支者，驳回。各王府不得再请增额。',
    against: '各王府、宗人府，以及所有姓朱的人',
    cost: 4,
    on: false,
    fromTurn: 3,
  },
  {
    id: 'kuangshui',
    name: '开采矿税',
    brief: '遣内官监矿，抽分纳税，径解内帑',
    text:
      '天下矿脉，听民开采，官为抽分。' +
      '遣内官监税，径解内帑，不经户部。',
    against: '地方官、生员、百姓——开矿这件事，历来是要出人命的',
    cost: 3,
    on: false,
    fromTurn: 9,
  },
  {
    id: 'tingzhang',
    name: '廷杖言官',
    brief: '言事忤旨者，于午门杖之，以警其余',
    text: '凡言官论事失当、讪上卖直者，锦衣卫于午门外杖之。',
    against: '士林、言路。这一条不打人，是打读书人的脸',
    cost: 2,
    on: false,
    fromTurn: 0,
  },
]

/** 立或废，都是一句话的事；后果在往后每一旬 */
export function toggleStatute(s: WorldState, id: string): WorldState {
  const st = STATUTES.find((x) => x.id === id)
  if (!st) return s
  if (s.energy < st.cost) return s
  if (st.fromTurn !== undefined && s.turn < st.fromTurn) return s
  if (st.unlock && st.unlock(s)) return s

  const now = !s.statutes[id]
  const next: WorldState = {
    ...s,
    energy: s.energy - st.cost,
    statutes: { ...s.statutes, [id]: now },
    log: [
      ...s.log,
      {
        turn: s.turn,
        text: now ? `诏行《${st.name}》。` : `诏罢《${st.name}》。`,
        tone: 'red' as const,
      },
    ],
  }
  return next
}

/**
 * 每旬，律令在暗处用力。
 *
 * 注意数字都很小 —— 一条法不会让你当旬看出变化，
 * 三年五年下来，它把国家推到了另一个地方。
 */
export function tickStatutes(s: WorldState): void {
  const on = (id: string) => !!s.statutes[id]

  if (on('kaocheng')) {
    // 政令通，但官被追着要结果，只好往百姓身上要
    s.backlog = Math.max(0, s.backlog - 0.4)
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.18, 0, 100)
    s.truth.minxin = clamp(s.truth.minxin - 0.12, 0, 100)
    s.truth.chaoshi = clamp(s.truth.chaoshi + 0.05, 0, 100)
  }

  if (on('yitiaobian')) {
    s.taicang += 0.55
    s.truth.minxin = clamp(s.truth.minxin - 0.16, 0, 100)
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.1, 0, 100)
  }

  if (on('kaihai')) {
    s.taicang += 0.4
    s.truth.bianfang = clamp(s.truth.bianfang - 0.14, 0, 100)
    s.truth.minxin = clamp(s.truth.minxin + 0.06, 0, 100)
  }

  if (on('zonglu')) {
    s.taicang += 0.7
    s.truth.chaoshi = clamp(s.truth.chaoshi - 0.22, 0, 100)
  }

  if (on('kuangshui')) {
    s.neitang += 0.9
    s.truth.minxin = clamp(s.truth.minxin - 0.4, 0, 100)
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.24, 0, 100)
  }

  if (on('tingzhang')) {
    // 表面压住了，底下积着
    s.backlog = Math.max(0, s.backlog - 0.25)
    s.truth.chaoshi = clamp(s.truth.chaoshi - 0.3, 0, 100)
    s.truth.guanfeng = clamp(s.truth.guanfeng - 0.1, 0, 100)
  }
}

