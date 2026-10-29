import { useState } from 'react'

/**
 * 过门。
 *
 * 不讲规则，只讲位置 —— 你在哪儿，接过的是个什么盘子。
 */

const PAGES: { mark: string; lines: string[] }[] = [
  {
    mark: '万 历 十 年 · 六 月',
    lines: [
      '张居正死了。',
      '',
      '他在你十岁那年做的首辅，做了十年。这十年里，你叫他先生。',
      '',
      '今年你十九岁。',
      '',
      '从今天起，奏疏上那道朱批，得你自己写。',
    ],
  },
  {
    mark: '这 十 年',
    lines: [
      '他做了些什么？',
      '',
      '立考成法 —— 每个官头上悬一条限期，完不成降级。',
      '行一条鞭 —— 天下的赋役归并，计亩折银。',
      '清丈田亩 —— 把豪强隐占的田，一亩一亩翻出来。',
      '',
      '政令「虽万里之外，朝下而夕奉行」。太仓的银子，从不足一年之支，攒到四百万两。',
      '',
      '代价是：天下的官都怕他，天下的读书人都恨他。',
    ],
  },
  {
    mark: '眼 下 的 盘 子',
    lines: [
      '太仓四百万，看着厚。',
      '',
      '九边年例一年三百三十万，宗禄二百四十万石，还有官俸、河工、织造、各处的亏空。',
      '',
      '宣大那边，俺答老了，封贡十三年，无边警。',
      '可辽东边外，有个二十五岁的人，拿十三副遗甲起了兵。奏报上写：「不过一部酋耳。」',
      '',
      '朝中没有一个人替张居正说话。他们都在等，等你说一句话。',
    ],
  },
  {
    mark: '你 要 做 的 事',
    lines: [
      '一、批红。天下的事都从你笔下过。可你看不完 —— 一年三十六旬，精力只够批一小半。',
      '',
      '二、用人。一百个官在任，三百个在籍等着补。你不知道谁行，只能靠听、靠问、靠试。',
      '',
      '三、立规矩。批红管一件事，用人管一个人。只有立条法，能改国运。',
      '',
      '奏报上的数，未必是真的。你派出去的人，回话也未必是真的。',
    ],
  },
]

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0)
  const last = page === PAGES.length - 1
  const p = PAGES[page]

  const next = () => {
    if (last) onDone()
    else setPage(page + 1)
  }

  return (
    <div className="intro" onClick={next}>
      <div className="intro-inner">
        <div className="intro-mark">{p.mark}</div>
        <div className="intro-body">
          {p.lines.map((l, i) => (
            <p key={i} className={l === '' ? 'blank' : ''}>
              {l}
            </p>
          ))}
        </div>

        <div className="intro-foot">
          <span className="intro-dots">
            {PAGES.map((_, i) => (
              <i key={i} className={i === page ? 'on' : ''} />
            ))}
          </span>
          <button
            className="primary"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
          >
            {last ? '临 朝' : '继 续'}
          </button>
          {!last && (
            <span
              className="intro-skip"
              onClick={(e) => {
                e.stopPropagation()
                onDone()
              }}
            >
              略过
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
