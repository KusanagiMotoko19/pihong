import { def } from '../../engine/events'
import { OFFICES, OFFICE_BY_ID } from '../../engine/offices'
import { candidatesFor } from '../../engine/roster'
import type { WorldState } from '../../engine/types'

/** 人事。官缺不补，政事就停在那儿；补错了人，停得更久 */

function pickVacancy(s: WorldState): string | null {
  const taken = new Set(s.officers.filter((o) => o.officeId).map((o) => o.officeId))
  const vacant = OFFICES.filter((o) => !taken.has(o.id) && o.rank <= 3 && o.kind !== 'eunuch')
  if (vacant.length === 0) return null
  return vacant[(s.turn * 7) % vacant.length].id
}

export const tingtui = def(
  'tingtui',
  'personnel',
  (s: WorldState) => {
    const vid = pickVacancy(s) ?? 'hubu-zuo'
    const slot = OFFICE_BY_ID.get(vid)!
    const picks = candidatesFor(s.officers, vid, 3)
    const names = picks.map((p) => `${p.name}（${p.origin}人，${p.jinshi}）`).join('；')
    return {
      from: '吏部尚书',
      title: `为会推${slot.name}事`,
      summary: `会推三员：${picks.map((p) => p.name).join('、')}。伏乞简用一员。`,
      body:
        `臣谨题：${slot.name}的位子空了，等着人。\n\n` +
        `臣会同九卿、科道，会推了三个人：${names}。\n\n` +
        `臣把三个人的考语抄在下面，皇上自己看：\n\n` +
        picks.map((p) => `　${p.name}——${p.appraisal}`).join('\n') +
        `\n\n臣不敢替皇上拿主意。只有一句：这三个人，臣都见过，都是能办差的。` +
        `不同的是，有的能办得干净，有的办得热闹。`,
      piaoni: `拟用${picks[0]?.name ?? '第一员'}。`,
      secret: `第一个人是吏部想用的。会推的三个人里，他排第一，不是因为他最好，是因为他最不碍事。`,
      yiEffect: {
        appoint: { officerId: picks[0]?.id ?? '', officeId: vid },
        log: `会推${slot.name}，用${picks[0]?.name}。`,
      },
      patience: 6,
      ignoredEffect: {
        metrics: { chaoshi: -1, guanfeng: -1 },
        log: `${slot.name}的缺一直空着。事没人管，渐渐就废了。`,
      },
      options: [
        {
          key: 'yi',
          label: `依拟（用${picks[0]?.name}）`,
          effect: {
            appoint: { officerId: picks[0]?.id ?? '', officeId: vid },
            log: `用${picks[0]?.name}为${slot.name}。`,
          },
        },
        ...picks.slice(1).map((p) => ({
          key: `use-${p.id}`,
          label: `用${p.name}`,
          needsReading: true as const,
          note: p.appraisal,
          effect: {
            appoint: { officerId: p.id, officeId: vid },
            metrics: { chaoshi: -1 },
            energy: -1,
            log: `破格用${p.name}为${slot.name}。吏部没有说什么。`,
          },
        })),
      ],
    }
  },
  { weight: 2, cooldown: 11 },
)

export const kaoman = def(
  'kaoman',
  'personnel',
  () => {
    return {
      from: '吏部考功司郎中',
      title: '为考满考察、分别去留事',
      summary: `本司考察在京官员，应降黜者十七员，应致仕者五员。伏乞裁定。`,
      body:
        `臣谨奏：三年一次的考察，办完了。\n\n` +
        `在京各衙门堂官以下，共考察过一千二百余员。其中：\n` +
        `　年老力衰，应致仕者五员；\n` +
        `　才力不及，应降调者九员；\n` +
        `　操守有议，应革职者八员。\n\n` +
        `臣把名单封在这里。有一句话要说在前头：这名单是吏部拟的，` +
        `拟的时候，有人来打招呼，臣挡了大部分。挡不住的那几个，臣在名字旁边画了圈。\n\n` +
        `伏乞圣裁。`,
      piaoni: '依议。',
      yiEffect: {
        metrics: { guanfeng: 2, chaoshi: -1 },
        log: '考察如议。十七员降黜，五员致仕。',
      },
      patience: 5,
      options: [
        {
          key: 'yi',
          label: '依拟',
          effect: { metrics: { guanfeng: 2, chaoshi: -1 }, log: '考察如议。' },
        },
        {
          key: 'kuan',
          label: '留中，一概不许',
          needsReading: true,
          note: '被黜的人会感激你。可考语从此就没人当真了',
          effect: {
            metrics: { guanfeng: -2, chaoshi: 3, minxin: 1 },
            flags: { exam_void: 1 },
            energy: -1,
            log: '考察之议一概留中。被黜的十七个人，都留了任。吏部考功司的郎中，当天递了告病的呈子。',
          },
        },
        {
          key: 'yan',
          label: '依议，并令都察院复核名单',
          needsReading: true,
          note: '查一查那些「画了圈」的名字',
          effect: {
            metrics: { guanfeng: 5, chaoshi: -1 },
            taicang: 3,
            energy: -1,
            log: '依议，并令都察院复核。查出三名该黜而未黜的，其中一个是某侍郎的门生。',
          },
        },
      ],
    }
  },
  { weight: 1, cooldown: 24 },
)

export const dingyou = def(
  'dingyou',
  'personnel',
  (s: WorldState) => {
    const cand = s.officers.filter((o) => o.officeId && o.officeId.startsWith('zongdu'))
    const target = cand[(s.turn * 3) % Math.max(1, cand.length)] ?? s.officers[0]
    return {
      from: '吏部尚书',
      title: '为大臣丁忧、请旨夺情事',
      summary: `${target.name}闻父丧，例应守制二十七个月。地方紧要，或可夺情。`,
      body:
        `臣谨奏：${target.name}家里来了讣告，他父亲故了。\n\n` +
        `按例，他该回籍守制二十七个月。可他那摊子事，一时没人接得住。\n\n` +
        `臣提这一条，心里是矛盾的。当年张居正的夺情，闹成什么样，皇上还记得。` +
        `天下士人把「夺情」两个字看成奇耻大辱，谁沾上谁一辈子洗不清。\n\n` +
        `可要是放他走，这两年的事就断在这儿了。\n\n` +
        `臣不敢拟。请皇上自己定。`,
      piaoni: '着吏部议。',
      yiEffect: {
        appoint: { officerId: target.id, officeId: null },
        metrics: { guanfeng: 1, chaoshi: 1 },
        log: `${target.name}回籍守制。他的位子空着，事交别人署理。`,
      },
      patience: 5,
      options: [
        {
          key: 'yi',
          label: '依拟（准其守制）',
          effect: {
            appoint: { officerId: target.id, officeId: null },
            metrics: { guanfeng: 1, chaoshi: 1 },
            log: `${target.name}回籍守制。`,
          },
        },
        {
          key: 'duo',
          label: '夺情，令其在任守制',
          needsReading: true,
          note: '事不断。可这个人从此在士林里抬不起头',
          effect: {
            metrics: { chaoshi: -2, guanfeng: -1 },
            flags: { duoqing: 1 },
            energy: -1,
            log:
              `诏夺情，令${target.name}在任守制。三日之内，六科上了十一本弹章，` +
              `都说「夺情非盛世事」。`,
          },
        },
        {
          key: 'huan',
          label: '准其守制，另简能员接任',
          needsReading: true,
          note: '人情两全。但你得找到人',
          effect: {
            appoint: { officerId: target.id, officeId: null },
            metrics: { guanfeng: 2, chaoshi: -1 },
            energy: -1,
            log: `准${target.name}守制，另简人接任。新来的那位，头一个月什么也没动。`,
          },
        },
      ],
    }
  },
  { weight: 1, cooldown: 18 },
)

export const PERSONNEL_TEMPLATES = [tingtui, kaoman, dingyou]
