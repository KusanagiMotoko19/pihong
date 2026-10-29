import { useEffect, useState } from 'react'
import type { WorldState } from './engine/types'
import { createInitialState } from './data/opening'
import { advanceTurn, evaluate, initQueue, type Verdict } from './engine/tick'
import {
  appointOfficer,
  dismissOfficer,
  audience,
  decree,
  doActivity,
  projectAction,
  readMemorial,
  recordTopic,
  secretOrder,
  stayMemorial,
} from './engine/actions'
import { TopBar } from './ui/TopBar'
import { MemorialList } from './ui/MemorialList'
import { MemorialView } from './ui/MemorialView'
import { SidePanel } from './ui/SidePanel'
import { OfficerModal } from './ui/OfficerModal'
import { ProjectModal } from './ui/ProjectModal'
import { VacancyModal } from './ui/VacancyModal'
import { Toast } from './ui/Toast'
import { VerdictView } from './ui/VerdictView'
import { ChronicleModal } from './ui/ChronicleModal'
import { load, save, clear } from './engine/save'
import { arrest, buildPalace, dongchangProbe, meetInner, setAutopilot, spyOn, spyOnOfficer } from './engine/inner'
import { toggleStatute } from './data/statutes'
import { verifyOrder } from './engine/orders'
import { InnerModal } from './ui/InnerModal'
import { AudienceModal } from './ui/AudienceModal'
import { IntroScreen } from './ui/IntroScreen'
import { sortQueue } from './engine/order'
import type { PersonKind } from './ui/OfficerText'

type Panel = 'queue' | 'memorial' | 'side'

function bootstrap(): { world: WorldState; verdict: Verdict | null } {
  const saved = load()
  if (saved) {
    return { world: saved, verdict: saved.over ? evaluate(saved) : null }
  }
  return { world: initQueue(createInitialState()), verdict: null }
}

export default function App() {
  const [boot] = useState(bootstrap)
  const [world, setWorld] = useState<WorldState>(boot.world)
  const [verdict, setVerdict] = useState<Verdict | null>(boot.verdict)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [officerId, setOfficerId] = useState<string | null>(null)
  const [innerId, setInnerId] = useState<string | null>(null)
  const [audienceId, setAudienceId] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(() => {
    const saved = localStorage.getItem('pihong.save.v3')
    if (!saved) return true
    try {
      const s = JSON.parse(saved)
      return typeof s.turn === 'number' && s.turn === 0
    } catch {
      return true
    }
  })
  const [projectId, setProjectId] = useState<string | null>(null)
  const [vacancyId, setVacancyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showChronicle, setShowChronicle] = useState(false)
  /** 手机上当前看哪一屏。桌面上三栏都显示，这个状态不起作用 */
  const [panel, setPanel] = useState<Panel>('queue')

  useEffect(() => {
    save(world)
  }, [world])

  const ordered = sortQueue(world.queue)
  const selected = ordered.find((m) => m.id === selectedId) ?? ordered[0] ?? null
  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [world.queue, selected, selectedId])

  /** 文本里点一个人：外廷的开官员档案，内廷的开内臣档案 */
  const pickPerson = (id: string, kind: PersonKind) => {
    if (kind === 'inner') setInnerId(id)
    else setOfficerId(id)
  }

  const apply = (next: WorldState) => {
    if (next === world) return
    setWorld(next)
    const last = next.log[next.log.length - 1]
    if (last && next.log.length !== world.log.length) setToast(last.text)
  }

  const nextTurn = () => {
    const n = advanceTurn(world)
    setWorld(n)
    setSelectedId(null)
    setToast(null)
    if (n.over) setVerdict(evaluate(n))
  }

  const restart = () => {
    clear()
    const fresh = initQueue(createInitialState())
    save(fresh)
    setWorld(fresh)
    setSelectedId(null)
    setOfficerId(null)
    setProjectId(null)
    setVacancyId(null)
    setToast(null)
    setShowChronicle(false)
    setVerdict(null)
    setPanel('queue')
  }

  const innerPerson = innerId ? world.inner.find((o) => o.id === innerId) : undefined

  if (showIntro && !verdict) {
    return <IntroScreen onDone={() => setShowIntro(false)} />
  }

  if (verdict) return <VerdictView verdict={verdict} state={world} onRestart={restart} />

  return (
    <div className="app">
      <TopBar s={world} onChronicle={() => setShowChronicle(true)} />

      <div className="main">
        <aside className={`pane left${panel === 'queue' ? ' active' : ''}`}>
          <h3 className="pane-title">案 头</h3>
          <MemorialList
            s={world}
            selectedId={selected?.id ?? null}
            onSelect={(id) => {
              setSelectedId(id)
              setPanel('memorial')
            }}
            onOfficer={setOfficerId}
            onPick={pickPerson}
          />
        </aside>

        <section className={`pane center${panel === 'memorial' ? ' active' : ''}`}>
          {selected ? (
            <MemorialView
              s={world}
              m={selected}
              energy={world.energy}
              onRead={() => setWorld(readMemorial(world, selected.id))}
              onDecree={(key) => setWorld(decree(world, selected.id, key))}
              onStay={() => setWorld(stayMemorial(world, selected.id))}
              onOfficer={setOfficerId}
              onPick={pickPerson}
            />
          ) : (
            <div className="empty">案头无事。这一旬的奏疏，都批完了。</div>
          )}
        </section>

        <aside className={`pane right${panel === 'side' ? ' active' : ''}`}>
          <SidePanel
            s={world}
            onAudience={setOfficerId}
            onActivity={(id) => apply(doActivity(world, id))}
            onProject={setProjectId}
            onVacancy={setVacancyId}
            onAutopilot={(n) => apply(setAutopilot(world, n))}
            onSpy={(kind, id) =>
              apply(spyOn(world, kind === 'officer' ? { kind: 'officer', id } : { kind: 'frontier', id }))
            }
            onArrest={(oid) => apply(arrest(world, oid))}
            onBuild={(k) => apply(buildPalace(world, k))}
            onInner={setInnerId}
            onStatute={(id) => apply(toggleStatute(world, id))}
            onVerify={(orderId) => {
              const r = verifyOrder(world, orderId)
              if (r.note) setToast(r.note)
              setWorld(r.s)
            }}
            onProbeOfficer={(id: string) => {
              const r = dongchangProbe(world, id)
              setWorld(r.s)
              return r.report
            }}
            onSpyOfficer={(id: string) => {
              const r = spyOnOfficer(world, id)
              setWorld(r.s)
              return r.report
            }}
          />
        </aside>
      </div>

      <div className="footer">
        <div className="meta">
          {world.incoming > 0 ? `本旬进本 ${world.incoming} 件` : '本旬无新本'}
          {world.backlog > 0 && ` · 留中未批 ${world.backlog} 件`}
          {world.turn > 0 && ` · 第 ${world.turn} / 36 旬`}
        </div>
        <div className="spacer" />
        {world.over ? (
          <button className="primary" onClick={() => setVerdict(evaluate(world))}>
            看 结 局
          </button>
        ) : (
          <button className="primary" onClick={nextTurn}>
            {world.turn >= 35 ? '终 局' : '下 旬'}
          </button>
        )}
      </div>

      {/* 手机上的底栏：三屏 + 下 旬 */}
      <nav className="mobile-nav">
        <button className={panel === 'queue' ? 'on' : ''} onClick={() => setPanel('queue')}>
          案头
          {world.queue.length > 0 && <i className="dot">{world.queue.length}</i>}
        </button>
        <button className={panel === 'memorial' ? 'on' : ''} onClick={() => setPanel('memorial')}>
          奏疏
        </button>
        <button className={panel === 'side' ? 'on' : ''} onClick={() => setPanel('side')}>
          政务
        </button>
        <button className="go" onClick={world.over ? () => setVerdict(evaluate(world)) : nextTurn}>
          {world.over ? '结局' : world.turn >= 35 ? '终局' : '下 旬'}
        </button>
      </nav>

      {officerId && (
        <OfficerModal
          officer={world.officers.find((o) => o.id === officerId)!}
          s={world}
          energy={world.energy}
          onClose={() => setOfficerId(null)}
          onAudience={() => {
            setAudienceId(officerId)
            setOfficerId(null)
            apply(audience(world, officerId))
          }}
          onOrder={(k) => apply(secretOrder(world, officerId, k))}
          onDismiss={(k) => {
            const o = world.officers.find((x) => x.id === officerId)
            const nextW = dismissOfficer(world, officerId, k)
            setWorld(nextW)
            setOfficerId(null)
            const allies = world.officers.filter(
              (x) => x.officeId && x.faction === o?.faction && x.id !== officerId,
            ).length
            setToast(
              k === 'plain'
                ? `罢了${o?.name}的官。位子空出来了。${allies > 0 ? `他那一路的人，都在看。` : ''}`
                : k === 'jail'
                  ? `${o?.name}下狱。${allies > 0 ? `同党${allies}人，往后不会替你办事了。` : ''}`
                  : `${o?.name}下狱，籍其家。银子进了太仓，恶名进了史书。`,
            )
          }}
        />
      )}

      {projectId && (
        <ProjectModal
          s={world}
          projectId={projectId}
          onClose={() => setProjectId(null)}
          onAction={(a) => apply(projectAction(world, projectId, a))}
          onOfficer={(id) => {
            setProjectId(null)
            setOfficerId(id)
          }}
        />
      )}

      {vacancyId && (
        <VacancyModal
          s={world}
          officeId={vacancyId}
          onClose={() => setVacancyId(null)}
          onAppoint={(oid) => {
            setWorld(appointOfficer(world, oid, vacancyId))
            setVacancyId(null)
            setToast('补了一个缺。这个位子上的事，从今天起有人管了。')
          }}
        />
      )}

      {toast && <Toast text={toast} onClose={() => setToast(null)} />}

      {audienceId && world.officers.some((o) => o.id === audienceId) && (
        <AudienceModal
          officer={world.officers.find((o) => o.id === audienceId)!}
          s={world}
          onClose={() => setAudienceId(null)}
          onRecord={(topic) => apply(recordTopic(world, audienceId, topic))}
        />
      )}

      {innerPerson && (
        <InnerModal
          o={innerPerson}
          energy={world.energy}
          onClose={() => setInnerId(null)}
          onMeet={() => apply(meetInner(world, innerPerson.id))}
        />
      )}

      {showChronicle && (
        <ChronicleModal
          s={world}
          onClose={() => setShowChronicle(false)}
          onRestart={restart}
          onPick={(id, kind) => {
            setShowChronicle(false)
            pickPerson(id, kind)
          }}
        />
      )}
    </div>
  )
}
