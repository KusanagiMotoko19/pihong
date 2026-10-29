// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from '../src/App'
import { createInitialState, TOTAL_TURNS } from '../src/data/opening'
import { advanceTurn, evaluate, initQueue } from '../src/engine/tick'
import { VerdictView } from '../src/ui/VerdictView'

const KEY = 'pihong.save.v3'

const openApp = () => {
  const r = render(<App />)
  const skip = document.querySelector('.intro-skip') as HTMLElement | null
  if (skip) fireEvent.click(skip)
  return r
}

beforeEach(() => {
  cleanup()
  localStorage.clear()
})

describe('案头', () => {
  it('开局是万历十年六月上旬', () => {
    openApp()
    expect(screen.getByText('万历十年六月上旬')).toBeTruthy()
  })

  it('未细看时只有摘要，没有全文', () => {
    openApp()
    expect(screen.getByText(/此本未细览/)).toBeTruthy()
  })

  it('细看之后正文展开', () => {
    openApp()
    fireEvent.click(screen.getAllByText(/细看全文/)[0])
    expect(screen.queryByText(/此本未细览/)).toBeNull()
  })

  it('依拟之后这一本出案头', () => {
    openApp()
    const before = document.querySelectorAll('.queue-item').length
    fireEvent.click(screen.getAllByText('依拟')[0])
    const after = document.querySelectorAll('.queue-item').length
    expect(after).toBe(before - 1)
  })
})

describe('旁栏', () => {
  it('可以切到朝廷，看见在任官员', () => {
    openApp()
    fireEvent.click(screen.getByText('朝廷'))
    expect(screen.getAllByText(/内阁|尚书|总督|总兵/).length).toBeGreaterThan(3)
  })

  it('可以切到四夷，看见部族', () => {
    openApp()
    fireEvent.click(screen.getByText('四夷'))
    expect(screen.getByText(/土默特/)).toBeTruthy()
    expect(screen.getByText(/建州女真/)).toBeTruthy()
  })

  it('可以切到内廷，看见司礼监与东厂', () => {
    openApp()
    fireEvent.click(screen.getByText('内廷'))
    expect(screen.getByText(/司 礼 监/)).toBeTruthy()
    expect(screen.getByText(/东 厂/)).toBeTruthy()
    expect(screen.getAllByText(/锦 衣 卫/).length).toBeGreaterThan(0)
  })

  it('内廷可以授权代批', () => {
    openApp()
    fireEvent.click(screen.getByText('内廷'))
    fireEvent.click(screen.getByText('除急件外全代批'))
    // 授权后会有回执
    expect(screen.getByText(/叩首领旨/)).toBeTruthy()
  })

  it('可以切到九边，实额未查时显示无凭', () => {
    openApp()
    fireEvent.click(screen.getByText('九边'))
    expect(screen.getAllByText('无凭').length).toBeGreaterThan(5)
  })
})

describe('召对给的是话，不是数字', () => {
  it('官员卡上看不到五维数字，只有模糊的判断', () => {
    openApp()
    fireEvent.click(screen.getByText('朝廷'))
    const first = document.querySelector('.officer') as HTMLElement
    fireEvent.click(first)
    expect(screen.getByText(/你 眼 里 的 他/)).toBeTruthy()
    const words = document.querySelectorAll('.pt-word')
    expect(words.length).toBe(4)
    expect(words[0].textContent).toBe('未有所闻')
  })

  it('召对之后能问话题，问到就有话说', () => {
    openApp()
    fireEvent.click(screen.getByText('朝廷'))
    const first = document.querySelector('.officer') as HTMLElement
    fireEvent.click(first)
    fireEvent.click(screen.getByText(/召 对/))
    expect(screen.getByText(/问 什 么/)).toBeTruthy()
    fireEvent.click(screen.getByText('问政事'))
    expect(document.querySelector('.ex-a')).toBeTruthy()
  })
})

describe('推进', () => {
  it('点下旬，日期从六月上旬走到六月中旬', () => {
    openApp()
    // 桌面底栏一个，手机底栏一个，取第一个
    fireEvent.click(screen.getAllByText('下 旬')[0])
    expect(screen.getByText('万历十年六月中旬')).toBeTruthy()
  })
})

describe('重开', () => {
  it('存的是终局档，打开直接进史评页，不会卡住', () => {
    let w = initQueue(createInitialState())
    for (let i = 0; i < TOTAL_TURNS; i++) w = advanceTurn(w)
    expect(w.over).toBe(true)
    localStorage.setItem(KEY, JSON.stringify(w))

    openApp()
    expect(screen.getByText('再 来 一 局')).toBeTruthy()
  })

  it('史评页点再来一局，回到开局', () => {
    let w = initQueue(createInitialState())
    for (let i = 0; i < TOTAL_TURNS; i++) w = advanceTurn(w)
    localStorage.setItem(KEY, JSON.stringify(w))

    openApp()
    fireEvent.click(screen.getByText('再 来 一 局'))
    expect(screen.getByText('万历十年六月上旬')).toBeTruthy()
  })

  it('起居注里能清档重开，且要确认一次', () => {
    openApp()
    fireEvent.click(screen.getByText('起居注'))
    fireEvent.click(screen.getByText('清档重开'))
    expect(screen.getByText('算了')).toBeTruthy()
    fireEvent.click(screen.getByText(/清档重开/))
    expect(screen.getByText('万历十年六月上旬')).toBeTruthy()
  })
})

describe('结局', () => {
  it('翻出你用过的人，并对照实际', () => {
    const s = initQueue(createInitialState())
    const v = evaluate(s)
    render(<VerdictView verdict={v} state={s} onRestart={() => {}} />)
    expect(screen.getByText(/你 用 过 的 人/)).toBeTruthy()
    expect(document.querySelectorAll('.pv').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.pv-v.real').length).toBeGreaterThan(0)
  })
})
