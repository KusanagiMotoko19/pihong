export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** 万两 → 「三百八十万两」这样的中文读法，奏疏里要用 */
export function wan(n: number): string {
  const v = Math.round(n)
  if (Math.abs(v) < 10000) return `${v.toLocaleString('zh-CN')}万两`
  return `${(v / 10000).toFixed(1)}亿两`
}

/** 万历十年六月 */
const MONTH_CN = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const NUM_CN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 万历元年 = 1573 年 */
export const WANLI_EPOCH = 1573 - 1

export function yearCN(n: number): string {
  if (n <= 0) return '元'
  if (n <= 10) return n === 10 ? '十' : NUM_CN[n]
  if (n < 20) return `十${NUM_CN[n - 10]}`
  const t = Math.floor(n / 10)
  const r = n % 10
  return `${NUM_CN[t]}十${r ? NUM_CN[r] : ''}`
}

export function dateCN(y: number, m: number, xun?: number): string {
  const base = `万历${yearCN(y - WANLI_EPOCH)}年${MONTH_CN[m - 1]}月`
  if (!xun) return base
  return base + ['', '上旬', '中旬', '下旬'][xun]
}

/** 回合数（0 = 万历十年六月上旬）换算成年月旬 */
export function monthFromTurn(turn: number): { year: number; month: number; xun: number } {
  const idx = 5 * 3 + turn // 六月是第 6 个月，(6-1)*3 = 15
  const year = 1582 + Math.floor(idx / 36)
  const rem = idx % 36
  return { year, month: Math.floor(rem / 3) + 1, xun: (rem % 3) + 1 }
}

export function nextMonth(y: number, m: number): [number, number] {
  return m === 12 ? [y + 1, 1] : [y, m + 1]
}
