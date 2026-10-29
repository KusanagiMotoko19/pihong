import type { Frontier, Power } from '../engine/types'

/**
 * 四夷与藩属。万历十年这个时点，北边刚安静下来，东北还看不见，
 * 西南的山里有人在磨刀，海上有个岛国正在统一。
 *
 * attitude：对我朝的态度。-100 死仇，0 冷淡，100 恭顺。
 * strength：实力，0-100。
 * threat：威胁，0-100。它有多想、多能打我。三者不是一回事。
 */
export const POWERS: Power[] = [
  {
    id: 'tumed',
    name: '土默特（俺答）',
    kind: 'tributary',
    region: '大同',
    attitude: 45,
    strength: 68,
    threat: 15,
    status: '款贡',
    leader: '俺答汗（顺义王）',
    contacts: 0,
  },
  {
    id: 'chahar',
    name: '察哈尔（土蛮）',
    kind: 'tribe',
    region: '辽东',
    attitude: -40,
    strength: 62,
    threat: 55,
    status: '犯边',
    leader: '土蛮汗',
    contacts: 0,
  },
  {
    id: 'duoyan',
    name: '朵颜三卫',
    kind: 'tribe',
    region: '蓟州',
    attitude: 12,
    strength: 28,
    threat: 22,
    status: '首鼠两端',
    leader: '长昂',
    contacts: 0,
  },
  {
    id: 'jianzhou',
    name: '建州女真',
    kind: 'tribe',
    region: '辽东',
    attitude: 8,
    strength: 14,
    threat: 8,
    status: '新附',
    leader: '努尔哈赤',
    contacts: 0,
  },
  {
    id: 'haixi',
    name: '海西女真（叶赫）',
    kind: 'tribe',
    region: '辽东',
    attitude: -5,
    strength: 26,
    threat: 14,
    status: '观望',
    leader: '清佳砮',
    contacts: 0,
  },
  {
    id: 'japan',
    name: '日本',
    kind: 'state',
    region: '福建',
    attitude: -18,
    strength: 72,
    threat: 26,
    status: '海禁通番',
    leader: '丰臣秀吉',
    contacts: 0,
  },
  {
    id: 'joseon',
    name: '朝鲜',
    kind: 'tributary',
    region: '辽东',
    attitude: 88,
    strength: 30,
    threat: 0,
    status: '事大惟谨',
    leader: '李昖',
    contacts: 0,
  },
  {
    id: 'annam',
    name: '安南',
    kind: 'tributary',
    region: '广西',
    attitude: 42,
    strength: 34,
    threat: 10,
    status: '例贡不阙',
    leader: '莫茂洽',
    contacts: 0,
  },
  {
    id: 'burma',
    name: '缅甸（东吁）',
    kind: 'state',
    region: '云南',
    attitude: -32,
    strength: 56,
    threat: 34,
    status: '侵扰土司',
    leader: '莽应里',
    contacts: 0,
  },
  {
    id: 'bozhou',
    name: '播州杨氏',
    kind: 'rebel',
    region: '四川',
    attitude: -45,
    strength: 38,
    threat: 24,
    status: '骄蹇不法',
    leader: '杨应龙',
    contacts: 0,
  },
]

/**
 * 九边。额兵与实额分开记 —— 中间那一截，是各级将官的饭碗。
 * 万历中期以后，九边年例银已近四百万两，annual 一栏按万两记。
 */
export const FRONTIERS: Frontier[] = [
  { id: 'liaodong', name: '辽东镇', troops: 8.0, actual: 6.1, horses: 6.0, pay: 62, readiness: 72, audited: false },
  { id: 'jizhou', name: '蓟州镇', troops: 10.0, actual: 8.6, horses: 8.0, pay: 58, readiness: 84, audited: false },
  { id: 'xuanfu', name: '宣府镇', troops: 8.0, actual: 6.4, horses: 5.0, pay: 48, readiness: 66, audited: false },
  { id: 'datong', name: '大同镇', troops: 8.5, actual: 6.7, horses: 5.5, pay: 52, readiness: 58, audited: false },
  { id: 'shanxi', name: '山西镇', troops: 5.5, actual: 4.1, horses: 3.0, pay: 32, readiness: 50, audited: false },
  { id: 'yansui', name: '延绥镇', troops: 5.5, actual: 3.9, horses: 2.5, pay: 36, readiness: 54, audited: false },
  { id: 'ningxia', name: '宁夏镇', troops: 3.0, actual: 2.1, horses: 1.5, pay: 26, readiness: 46, audited: false },
  { id: 'guyuan', name: '固原镇', troops: 6.0, actual: 4.4, horses: 3.0, pay: 32, readiness: 52, audited: false },
  { id: 'gansu', name: '甘肃镇', troops: 4.5, actual: 3.1, horses: 2.0, pay: 30, readiness: 44, audited: false },
]

/** 某镇对应的总兵位子 */
export const FRONTIER_OFFICE: Record<string, string> = {
  liaodong: 'zz-liaodong',
  jizhou: 'zz-jizhou',
  xuanfu: 'zz-xuanfu',
  datong: 'zz-datong',
  shanxi: 'zz-shanxi',
  yansui: 'zz-yansui',
  ningxia: 'zz-ningxia',
  guyuan: 'zz-guyuan',
  gansu: 'zz-gansu',
}
