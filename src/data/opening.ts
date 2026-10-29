import type { WorldState } from '../engine/types'
import { computeReported } from '../engine/rules'
import { buildRoster } from '../engine/roster'
import { TEMPLATES } from './memorials'
import { POWERS, FRONTIERS } from './powers'
import { buildInner } from './inner'

export const ALL_TEMPLATES = TEMPLATES

/**
 * 时间线：只写死非出现不可的几本。其余靠模板自己的 when 条件抽。
 * turn 0 = 万历十年六月上旬。一旬一回合，一年三十六旬。
 */
export const TIMELINE: Record<number, string[]> = {
  0: ['qingzhang-report', 'hubu-routine'],
}

export const TOTAL_TURNS = 180 // 五年，一年三十六旬

export const START = { year: 1582, month: 6, xun: 1 }

export function createInitialState(seed = 20261030): WorldState {
  const base: WorldState = {
    date: { ...START },
    turn: 0,
    energy: 8,
    maxEnergy: 8,

    taicang: 380,
    neitang: 200,
    taipu: 400,

    truth: { minxin: 62, bianfang: 74, guanfeng: 58, chaoshi: 66 },
    reported: { minxin: 0, bianfang: 0, guanfeng: 0, chaoshi: 0 },

    officers: buildRoster(seed),
    powers: POWERS.map((p) => ({ ...p })),
    frontiers: FRONTIERS.map((f) => ({ ...f })),
    inner: buildInner(seed),
    autopilot: 0,
    projects: [
      {
        id: 'qingzhang',
        name: '清丈天下田亩',
        goal: '核实天下田土，使隐占者出，赋役均平',
        stewardId: 'wangguanguang',
        budget: 200,
        spent: 0,
        progress: 6,
        reported: 18,
        resistance: 22,
        months: 0,
        exposed: false,
        status: 'running',
        stage: 'promote',
        opponents: [
          { name: '藩府宗室', reason: '清丈一查，王府隐占的田就露出来了' },
          { name: '江南乡绅', reason: '田寄在举人名下，一改就没了' },
          { name: '州县有司', reason: '丈量是苦差，办成没赏，办砸了担责' },
        ],
        milestones: [
          { at: 30, text: '过半省份报册到部，清丈的架子立起来了', hit: false },
          { at: 55, text: '隐占之田开始浮出水面，藩府与乡绅反弹最烈', hit: false },
          { at: 80, text: '田册可核，赋役均平有了底子', hit: false },
          { at: 100, text: '清丈告竣，天下田土有了一本真账', hit: false },
        ],
        history: [{ turn: 0, text: '万历八年奉旨清丈，至今两年。' }],
      },
    ],

    queue: [],
    backlog: 0,
    shelved: 0,
    incoming: 0,

    policy: { quota: 90, severity: 3 },

    log: [
      {
        turn: 0,
        text:
          '万历十年六月二十日，太师张居正卒。上震悼辍朝，赠上柱国，谥文忠。' +
          '是日，你第一次独自坐在文华殿的案前，看见案上堆着的本子，比人还高。',
        tone: 'red',
      },
    ],
    flags: {},
    knowledge: {},
    statutes: { kaocheng: true },
    orders: [],
    pending: [],
    seed,
    over: false,
  }

  base.reported = computeReported(base)
  return base
}
