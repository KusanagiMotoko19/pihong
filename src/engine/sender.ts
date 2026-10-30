import type { WorldState } from './types'
import { headOf } from '../data/inner'
import { OFFICE_BY_ID } from './offices'

/**
 * 具奏人署名。
 *
 * 规矩：每一本都得有个活人署名。只写「户部尚书」不写是谁，等于没说。
 * 这道工序在生成奏疏时做一次 —— 于是王国光一走，下一本就不是他署的名了。
 */

/** 职名 → 官职 id（外廷） */
const EXACT: Record<string, string> = {
  户部尚书: 'hubu-shangshu',
  吏部尚书: 'libu-shangshu',
  礼部尚书: 'libu2-shangshu',
  兵部尚书: 'bingbu-shangshu',
  刑部尚书: 'xingbu-shangshu',
  工部尚书: 'gongbu-shangshu',
  漕运总督: 'zongdu-caoyun',
  宣大总督: 'zongdu-xuanda',
  蓟辽总督: 'zongdu-jiliao',
  三边总督: 'zongdu-sanbian',
  两广总督: 'zongdu-liangguang',
  闽浙总督: 'zongdu-minzhe',
  山东巡抚: 'xunfu-shandong',
  河南巡抚: 'xunfu-henan',
  湖广巡抚: 'xunfu-huguang',
  四川巡抚: 'xunfu-sichuan',
  陕西巡抚: 'xunfu-shaanxi',
  山西巡抚: 'xunfu-shanxi',
  云南巡抚: 'xunfu-yunnan',
  贵州巡抚: 'xunfu-guizhou',
  广西巡抚: 'xunfu-guangxi',
  广东巡抚: 'xunfu-guangdong',
  福建巡抚: 'xunfu-fujian',
  浙江巡抚: 'xunfu-zhejiang',
  江西巡抚: 'xunfu-jiangxi',
  辽东巡抚: 'xunfu-liaodong',
  顺天巡抚: 'xunfu-beizhili',
  应天巡抚: 'xunfu-nanzhili',
  户科都给事中: 'ke-hu',
  吏科都给事中: 'ke-li',
  兵科都给事中: 'ke-bing',
  礼科都给事中: 'ke-li2',
  工科都给事中: 'ke-gong',
  内阁首辅: 'grand-1',
  太仆寺卿: 'taipu-qing',
  京营提督: 'zz-jingying',
  左都御史: 'ducha-zuo',
  总理河道: 'hedao',
  钦天监监正: 'qintian',
}

/** 部门性来件 → 默认由该衙门堂官署名 */
const BY_DEPT: [string, string][] = [
  ['户部清吏司', 'hubu-zuo'],
  ['户部', 'hubu-shangshu'],
  ['吏部考功司', 'libu-zuo'],
  ['吏部', 'libu-shangshu'],
  ['礼部主客司', 'libu2-zuo'],
  ['礼部', 'libu2-shangshu'],
  ['兵部', 'bingbu-shangshu'],
  ['工部', 'gongbu-shangshu'],
  ['刑部', 'xingbu-shangshu'],
]

/** 内廷来件 → 归某个监 */
const INNER: [string, string][] = [
  ['司礼监秉笔', 'siliji'],
  ['司礼监', 'siliji'],
  ['东厂', 'dongchang'],
  ['内官监', 'neiguanjian'],
  ['织造', 'zhizao'],
  ['御马监', 'yumajian'],
  ['尚膳监', 'shangshanjian'],
]

/** 御史：按道名找一个在任的御史，找不到就让左副都御史顶 */
function censorId(s: WorldState) {
  return (
    s.officers.find((x) => x.officeId === 'ducha-qian') ??
    s.officers.find((x) => x.officeId === 'ducha-fu') ??
    s.officers.find((x) => x.officeId === 'ducha-zuo')
  )
}

export function resolveSender(s: WorldState, from: string): { text: string; id?: string } {
  if (!from) return { text: from }

  // 拆出「括号后缀」，如（密奏）（飞报）
  const pm = from.match(/（[^）]*）\s*$/)
  const suffix = pm ? pm[0] : ''
  const core = (pm ? from.slice(0, pm.index) : from).trim()

  // 已有署名就不动（如「内阁首辅 张四维」）
  if (core.includes(' ')) {
    const [title, name] = core.split(/\s+/)
    if (name && name.length >= 2) return { text: `${title} ${name}${suffix ? ' ' + suffix : ''}` }
  }

  const title = core

  // 一、内廷
  for (const [kw, id] of INNER) {
    if (title.includes(kw)) {
      const h = headOf(s.inner, id)
      if (h) return { text: `${title} ${h.name}${suffix ? ' ' + suffix : ''}` }
    }
  }

  // 二、御史
  if (title.includes('御史')) {
    const n = censorId(s)
    if (n) return { text: `${title} ${n.name}${suffix ? ' ' + suffix : ''}`, id: n.id }
  }

  // 三、外廷堂官
  const exact = EXACT[title]
  if (exact) {
    const o = s.officers.find((x) => x.officeId === exact)
    if (o) return { text: `${OFFICE_BY_ID.get(exact)?.name ?? title} ${o.name}${suffix ? ' ' + suffix : ''}`, id: o.id }
  }

  // 四、按衙门兜底
  for (const [kw, id] of BY_DEPT) {
    if (title.includes(kw)) {
      const o = s.officers.find((x) => x.officeId === id)
      // 衙门简称（「工部」）要补成正式职名（「工部尚书」），否则署名不成立
      if (o) return { text: `${OFFICE_BY_ID.get(id)?.name ?? title} ${o.name}${suffix ? ' ' + suffix : ''}`, id: o.id }
    }
  }

  // 五、位子空着（总督、巡抚罢免未补）：奏疏是副手递的，按该衙门左贰取人
  if (title.endsWith('总督') || title.endsWith('巡抚')) {
    const any = s.officers.find((x) => x.officeId && x.jinshi && (x.tenure ?? 0) >= 0)
    if (any) return { text: `${title}署事 ${any.name}`, id: any.id }
  }

  // 六、查不到就原样（藩王、乡绅联名这类本来就不该编个名字）
  return { text: from }
}
