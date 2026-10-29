import { def } from '../../engine/events'
import { FRONTIER_OFFICE } from '../powers'
import type { WorldState } from '../../engine/types'

/** 边务。额兵、实额、饷，三样东西凑不齐，仗就打不了 */

function worstFrontier(s: WorldState) {
  return [...s.frontiers].sort((a, b) => a.readiness - b.readiness)[0]
}

export const frontierPay = def(
  'frontier-pay',
  'urgent',
  (s: WorldState) => {
    const f = worstFrontier(s)
    const cmdr = s.officers.find((o) => o.officeId === FRONTIER_OFFICE[f.id])
    return {
      from: `${f.name}总兵官 ${cmdr?.name ?? ''}`.trim(),
      title: '为边饷久欠、军心不稳事',
      summary: `${f.name}本年年例银${f.pay}万两，止解到一半。军士鼓噪，乞速发。`,
      body:
        `臣谨奏：${f.name}的饷，欠了。\n\n` +
        `本镇年例银${f.pay}万两，到今岁只解到一半。三月里，军士聚在辕门外，` +
        `说要见臣。臣出去了，站在台阶上，问了他们一句：你们要什么？\n\n` +
        `他们说：要饷。\n\n` +
        `臣说：饷在道上。\n\n` +
        `他们没散。站了一个时辰，才慢慢回去。臣站在台阶上，腿都麻了，` +
        `不敢下去——下去了，他们就知道臣也怕。\n\n` +
        `臣不敢说这是小事。边军一散，墙就空了。伏乞速发。`,
      piaoni: '户部即行措处。',
      yiEffect: {
        taicang: -5,
        frontier: { id: f.id, readiness: 5 },
        log: `${f.name}补发年例银十四万两，军心稍定。`,
      },
      patience: 2,
      ignoredEffect: {
        metrics: { bianfang: -2, chaoshi: -1 },
        frontier: { id: f.id, readiness: -12 },
        log: `${f.name}的饷一直没到。入冬之后，逃了七百多人。`,
      },
      options: [
        {
          key: 'yi',
          label: '依拟（发一半）',
          effect: {
            taicang: -5,
            frontier: { id: f.id, readiness: 5 },
            log: `${f.name}补发年例银十四万两。`,
          },
        },
        {
          key: 'quan',
          label: '全数补发，并加赏',
          needsReading: true,
          note: '钱从太仓出。你今年本来就在亏',
          effect: {
            taicang: -10,
            frontier: { id: f.id, readiness: 14 },
            metrics: { bianfang: 4, chaoshi: 1 },
            energy: -1,
            log: `${f.name}全数补发，另加犒赏。军士欢呼，声闻数里。`,
          },
        },
        {
          key: 'ju',
          label: '不发，令该镇自筹',
          needsReading: true,
          note: '朝廷没钱了。这话说出口，边军会怎么想',
          effect: {
            taicang: 2,
            frontier: { id: f.id, readiness: -14 },
            metrics: { bianfang: -6, chaoshi: -3 },
            flags: { pay_refused: 1 },
            energy: -1,
            log: `${f.name}请饷不允，令其自筹。三日后，军中有哗噪者。`,
          },
        },
        {
          key: 'cha',
          label: '先遣御史查该镇兵额，再议发饷',
          needsReading: true,
          note: '你怀疑这饷根本没到兵手里',
          effect: {
            frontier: { id: f.id, audited: true, readiness: -4 },
            metrics: { guanfeng: 3, chaoshi: -1 },
            flags: { pay_audit: 1 },
            energy: -1,
            log:
              `遣御史查${f.name}兵额。查出来：额兵${f.troops.toFixed(1)}万，` +
              `实额只有${f.actual.toFixed(1)}万。中间那一万几千人的饷，进了谁的口袋，` +
              `御史的册子上写着。`,
          },
        },
      ],
    }
  },
  { line: 'frontier', weight: 3, cooldown: 999, requires: ['raid'] },
)

export const raidAlert = def(
  'raid-alert',
  'urgent',
  (s: WorldState) => {
    const p = [...s.powers].sort((a, b) => b.threat - a.threat)[0]
    const fid = Object.keys(FRONTIER_OFFICE).find((k) => {
      const f = s.frontiers.find((x) => x.id === k)
      return f && f.name.replace('镇', '') === p.region
    })
    const f = s.frontiers.find((x) => x.id === fid) ?? worstFrontier(s)
    const cmdr = s.officers.find((o) => o.officeId === FRONTIER_OFFICE[f.id])
    return {
      from: `${f.name}总兵官 ${cmdr?.name ?? ''}`.trim(),
      title: '为虏骑入犯、官军拒却事',
      summary: `${p.name}以数千骑犯${f.name}边，官军拒却之。请发犒赏、补马价。`,
      body:
        `臣谨奏：${p.name}的骑，从${f.name}的口子进来了。\n\n` +
        `初三日卯时，约三千骑，分三路。臣带兵迎上去，打到午后，他们退了。` +
        `斩首一百七十级，夺马八十三匹。我军伤四十一人，马倒死一百二十匹。\n\n` +
        `臣不敢报大捷。这是小胜。他们不是来打的，是来抢的——抢完就走。\n\n` +
        `臣请发犒赏银五万两，再补马价银三万两。马不补上，下回他们来时，` +
        `臣的兵就只能站着了。`,
      piaoni: '兵部知道。犒赏着太仆寺查发。',
      yiEffect: {
        taipu: -3,
        frontier: { id: f.id, readiness: 3 },
        metrics: { bianfang: 1 },
        power: { id: p.id, attitude: -3 },
        log: `${p.name}犯${f.name}，官军拒却，发犒赏银。`,
      },
      patience: 3,
      ignoredEffect: {
        metrics: { bianfang: -2 },
        frontier: { id: f.id, readiness: -8 },
        power: { id: p.id, threat: 4 },
        log: '请犒赏的疏留中。边军三月无赏，下回再有人进来，没人愿意往前冲了。',
      },
      options: [
        {
          key: 'yi',
          label: '依拟',
          effect: {
            taipu: -3,
            frontier: { id: f.id, readiness: 3 },
            metrics: { bianfang: 1 },
            log: '发犒赏银，补马价。',
          },
        },
        {
          key: 'zhong',
          label: '重赏，并许该镇便宜行事',
          needsReading: true,
          note: '给边将一个「便宜行事」，等于给他半个省',
          effect: {
            taipu: -6,
            frontier: { id: f.id, readiness: 8 },
            metrics: { bianfang: 5, chaoshi: -1 },
            flags: { borderlord: 1 },
            energy: -1,
            log: '重赏边镇，许便宜行事。边将权重，自此始。',
          },
        },
        {
          key: 'he',
          label: '斩首一百七十级？令巡按核功',
          needsReading: true,
          note: '边功冒滥是老毛病。可这一回，也许是真的',
          effect: {
            metrics: { guanfeng: 2, bianfang: -1 },
            power: { id: p.id, threat: 2 },
            flags: { merit_audit: 1 },
            energy: -1,
            log: '令巡按核实功次。总兵上疏自辩，言辞很激。核下来，实数一百一十级。',
          },
        },
      ],
    }
  },
  { line: 'frontier', weight: 2, cooldown: 999, sets: ['raid'], when: (s) => s.turn >= 4 },
)

/** 兵变：饷断了，刀就转了向 */
export const mutiny = def(
  'mutiny',
  'urgent',
  (s) => {
    const f = [...s.frontiers].sort((a, b) => a.readiness - b.readiness)[0]
    return {
      from: '巡按山西监察御史（飞报）',
      title: '为军变、据城、杀害将官事',
      summary: `${f.name}军士鼓噪，杀坐营官二人，闭城门，索饷三月。`,
      body:
        `臣飞报：${f.name}反了。\n\n` +
        `本月十六日夜，军士三百余人，拥入坐营官署，杀了两个坐营官。` +
        `他们说：饷欠了七个月，家里老婆孩子在吃草根。\n\n` +
        `现在城门闭着，他们要三件事：一、补饷；二、不追究；三、换掉总兵。\n\n` +
        `臣在城外，进不去。臣问城上的人，你们要反么？上面说：不敢反，只想吃饭。\n\n` +
        `伏乞速裁。迟一日，就不知是什么光景了。`,
      piaoni: '着巡抚亲往抚谕，许以补饷，毋得遽剿。',
      secret: '这道票拟是兵部拟的。他们怕的不是兵变，是「剿」字一出口，账就要算到兵部头上——那七个月的饷，是兵部没发。',
      yiEffect: {
        taicang: -8,
        frontier: { id: f.id, readiness: 5 },
        metrics: { chaoshi: -3, bianfang: -2 },
        log: `${f.name}军变，抚谕补饷，事平。为首者不究。`,
      },
      patience: 1,
      ignoredEffect: {
        metrics: { bianfang: -10, chaoshi: -8, minxin: -5 },
        frontier: { id: f.id, readiness: -20 },
        log: `${f.name}军变无人处置。乱兵破城，掠库，散入山中。`,
      },
      options: [
        {
          key: 'yi',
          label: '依拟（抚谕补饷）',
          effect: {
            taicang: -8,
            frontier: { id: f.id, readiness: 5 },
            metrics: { chaoshi: -3, bianfang: -2 },
            log: '抚谕补饷，事平。',
          },
        },
        {
          key: 'jiao',
          label: '调邻镇兵进剿',
          needsReading: true,
          note: '剿得快，也记得久。边军看朝廷，从此不一样了',
          effect: {
            taicang: -14,
            frontier: { id: f.id, readiness: -10 },
            metrics: { bianfang: -4, chaoshi: -6, minxin: -3 },
            flags: { army_resent: 1 },
            energy: -1,
            log:
              '调邻镇兵进剿。三日破城，斩首二百余。此后九边军中，' +
              '私下里多了一句话：「饿死也是死，反也是死。」',
          },
        },
        {
          key: 'huan',
          label: '补饷、换总兵、赦胁从',
          needsReading: true,
          note: '三件事都答应。花钱，但把根留住',
          effect: {
            taicang: -12,
            frontier: { id: f.id, readiness: 10 },
            metrics: { chaoshi: 3, bianfang: 2, minxin: 2 },
            energy: -1,
            log: '补饷、换总兵、赦胁从。乱兵开城，跪在道边请罪。',
          },
        },
      ],
    }
  },
  { line: 'frontier', requires: ['pay_refused'], cooldown: 999 },
)

export const MILITARY_TEMPLATES = [frontierPay, raidAlert, mutiny]
