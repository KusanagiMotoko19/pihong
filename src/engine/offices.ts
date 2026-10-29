/**
 * 官职体系。M1 的朝廷是一张真实的座位表：
 * 内阁四席、六部十二堂官、都察院、六科、寺监、二十二处督抚、九边总兵。
 *
 * 空出来的位子才需要补人 —— 所以"人事"才成为一件事。
 */

export type OfficeKind = 'civil' | 'military' | 'eunuch'

export interface OfficeSlot {
  id: string
  /** 职名，如「户部尚书」 */
  name: string
  /** 所属，如「户部」「蓟辽」 */
  dept: string
  /** 品级：1 正一品 … 9 从九品，用数字越小越高 */
  rank: number
  kind: OfficeKind
  /** 权重：这个位子能撬动多少事，1-5 */
  power: number
  /** 对应边防或行省，用于把人物和地方事件绑起来 */
  region?: string
  /** 职掌一句话，给人看的 */
  duty: string
}

const c = (
  id: string,
  name: string,
  dept: string,
  rank: number,
  power: number,
  duty: string,
  region?: string,
): OfficeSlot => ({ id, name, dept, rank, kind: 'civil', power, duty, region })

const m = (id: string, name: string, dept: string, rank: number, region: string, duty: string): OfficeSlot => ({
  id,
  name,
  dept,
  rank,
  kind: 'military',
  power: 4,
  duty,
  region,
})

export const OFFICES: OfficeSlot[] = [
  /* ------------------------------------------------ 内阁 */
  c('grand-1', '内阁首辅', '内阁', 1, 5, '票拟之权，实总百揆'),
  c('grand-2', '内阁次辅', '内阁', 1, 4, '赞理机务'),
  c('grand-3', '文渊阁大学士', '内阁', 2, 3, '参预机务'),
  c('grand-4', '东阁大学士', '内阁', 2, 3, '参预机务'),

  /* ------------------------------------------------ 六部 */
  c('libu-shangshu', '吏部尚书', '吏部', 2, 5, '铨衡天下官员'),
  c('hubu-shangshu', '户部尚书', '户部', 2, 5, '天下钱粮'),
  c('libu2-shangshu', '礼部尚书', '礼部', 2, 3, '典礼、科举、朝贡'),
  c('bingbu-shangshu', '兵部尚书', '兵部', 2, 5, '武选、军饷、边务'),
  c('xingbu-shangshu', '刑部尚书', '刑部', 2, 3, '天下刑名'),
  c('gongbu-shangshu', '工部尚书', '工部', 2, 3, '营造、河工、军器'),

  c('libu-zuo', '吏部左侍郎', '吏部', 3, 3, '协理铨选'),
  c('hubu-zuo', '户部左侍郎', '户部', 3, 3, '协理钱粮'),
  c('libu2-zuo', '礼部左侍郎', '礼部', 3, 2, '协理典礼'),
  c('bingbu-zuo', '兵部左侍郎', '兵部', 3, 3, '协理边务'),
  c('xingbu-zuo', '刑部左侍郎', '刑部', 3, 2, '协理刑名'),
  c('gongbu-zuo', '工部左侍郎', '工部', 3, 2, '协理营缮'),

  /* ------------------------------------------------ 都察院与六科 */
  c('ducha-zuo', '左都御史', '都察院', 2, 4, '纠劾百司，总宪风纪'),
  c('ducha-fu', '左副都御史', '都察院', 3, 3, '协理院事'),
  c('ducha-qian', '佥都御史', '都察院', 4, 2, '巡按、巡抚之衔'),

  c('ke-li', '吏科都给事中', '六科', 7, 2, '封驳吏部章奏'),
  c('ke-hu', '户科都给事中', '六科', 7, 2, '封驳户部章奏'),
  c('ke-li2', '礼科都给事中', '六科', 7, 2, '封驳礼部章奏'),
  c('ke-bing', '兵科都给事中', '六科', 7, 2, '封驳兵部章奏'),
  c('ke-xing', '刑科都给事中', '六科', 7, 1, '封驳刑部章奏'),
  c('ke-gong', '工科都给事中', '六科', 7, 1, '封驳工部章奏'),

  /* ------------------------------------------------ 寺监 */
  c('dali-qing', '大理寺卿', '大理寺', 3, 2, '平反刑狱'),
  c('taichang-qing', '太常寺卿', '太常寺', 3, 1, '祭祀礼乐'),
  c('guanglu-qing', '光禄寺卿', '光禄寺', 4, 1, '宫廷供办'),
  c('taipu-qing', '太仆寺卿', '太仆寺', 3, 3, '马政与马价银'),
  c('honglu-qing', '鸿胪寺卿', '鸿胪寺', 4, 1, '朝会仪节、外使接待'),
  c('guozi-jijiu', '国子监祭酒', '国子监', 4, 1, '育才、士林清议'),

  /* ------------------------------------------------ 督抚（二十二处） */
  c('zongdu-jiliao', '蓟辽总督', '蓟辽', 2, 5, '总督蓟辽保定军务', '辽东'),
  c('zongdu-xuanda', '宣大总督', '宣大', 2, 5, '总督宣大山西军务', '宣府'),
  c('zongdu-sanbian', '三边总督', '三边', 2, 5, '总督陕西三边军务', '固原'),
  c('zongdu-liangguang', '两广总督', '两广', 2, 4, '总督两广军务', '广东'),
  c('zongdu-minzhe', '闽浙总督', '闽浙', 2, 4, '总督闽浙军务', '浙江'),
  c('zongdu-caoyun', '漕运总督', '漕运', 2, 4, '总督漕运兼巡抚凤阳', '南直隶'),

  c('xunfu-beizhili', '顺天巡抚', '北直隶', 3, 2, '巡抚顺天等府', '北直隶'),
  c('xunfu-nanzhili', '应天巡抚', '南直隶', 3, 2, '巡抚应天等府', '南直隶'),
  c('xunfu-shandong', '山东巡抚', '山东', 3, 2, '巡抚山东', '山东'),
  c('xunfu-shanxi', '山西巡抚', '山西', 3, 2, '巡抚山西', '山西'),
  c('xunfu-henan', '河南巡抚', '河南', 3, 2, '巡抚河南', '河南'),
  c('xunfu-shaanxi', '陕西巡抚', '陕西', 3, 2, '巡抚陕西', '陕西'),
  c('xunfu-sichuan', '四川巡抚', '四川', 3, 3, '巡抚四川', '四川'),
  c('xunfu-huguang', '湖广巡抚', '湖广', 3, 2, '巡抚湖广', '湖广'),
  c('xunfu-jiangxi', '江西巡抚', '江西', 3, 2, '巡抚江西', '江西'),
  c('xunfu-zhejiang', '浙江巡抚', '浙江', 3, 2, '巡抚浙江', '浙江'),
  c('xunfu-fujian', '福建巡抚', '福建', 3, 2, '巡抚福建', '福建'),
  c('xunfu-guangdong', '广东巡抚', '广东', 3, 2, '巡抚广东', '广东'),
  c('xunfu-guangxi', '广西巡抚', '广西', 3, 2, '巡抚广西', '广西'),
  c('xunfu-yunnan', '云南巡抚', '云南', 3, 3, '巡抚云南', '云南'),
  c('xunfu-guizhou', '贵州巡抚', '贵州', 3, 3, '巡抚贵州', '贵州'),
  c('xunfu-liaodong', '辽东巡抚', '辽东', 3, 3, '巡抚辽东', '辽东'),

  /* ------------------------------------------------ 布按（十三布政使） */
  c('buzheng-beizhili', '北直隶布政使', '北直隶', 3, 2, '掌一省民政钱粮', '北直隶'),
  c('buzheng-nanzhili', '南直隶布政使', '南直隶', 3, 2, '掌一省民政钱粮', '南直隶'),
  c('buzheng-shandong', '山东布政使', '山东', 3, 2, '掌一省民政钱粮', '山东'),
  c('buzheng-shanxi', '山西布政使', '山西', 3, 2, '掌一省民政钱粮', '山西'),
  c('buzheng-henan', '河南布政使', '河南', 3, 2, '掌一省民政钱粮', '河南'),
  c('buzheng-shaanxi', '陕西布政使', '陕西', 3, 2, '掌一省民政钱粮', '陕西'),
  c('buzheng-sichuan', '四川布政使', '四川', 3, 2, '掌一省民政钱粮', '四川'),
  c('buzheng-huguang', '湖广布政使', '湖广', 3, 2, '掌一省民政钱粮', '湖广'),
  c('buzheng-jiangxi', '江西布政使', '江西', 3, 2, '掌一省民政钱粮', '江西'),
  c('buzheng-zhejiang', '浙江布政使', '浙江', 3, 2, '掌一省民政钱粮', '浙江'),
  c('buzheng-fujian', '福建布政使', '福建', 3, 2, '掌一省民政钱粮', '福建'),
  c('buzheng-guangdong', '广东布政使', '广东', 3, 2, '掌一省民政钱粮', '广东'),
  c('buzheng-yunnan', '云南布政使', '云南', 3, 2, '掌一省民政钱粮', '云南'),

  /* ------------------------------------------------ 九边总兵 */
  m('zz-liaodong', '辽东总兵官', '辽东', 2, '辽东', '镇守辽东'),
  m('zz-jizhou', '蓟州总兵官', '蓟州', 2, '蓟州', '镇守蓟州'),
  m('zz-xuanfu', '宣府总兵官', '宣府', 2, '宣府', '镇守宣府'),
  m('zz-datong', '大同总兵官', '大同', 2, '大同', '镇守大同'),
  m('zz-shanxi', '山西总兵官', '山西', 2, '山西', '镇守山西'),
  m('zz-yansui', '延绥总兵官', '延绥', 2, '延绥', '镇守延绥'),
  m('zz-ningxia', '宁夏总兵官', '宁夏', 2, '宁夏', '镇守宁夏'),
  m('zz-guyuan', '固原总兵官', '固原', 2, '固原', '镇守固原'),
  m('zz-gansu', '甘肃总兵官', '甘肃', 2, '甘肃', '镇守甘肃'),
  m('zz-jingying', '京营提督', '京营', 2, '京营', '提督京营戎政'),

  /* ------------------------------------------------ 清要之职 */
  c('hanlin-zhang', '翰林院掌院学士', '翰林院', 5, 1, '教习庶吉士，士林之望'),
  c('guozijian-siye', '国子监司业', '国子监', 6, 1, '佐祭酒育才'),
  c('tongzheng-shi', '通政使', '通政司', 3, 2, '收受章奏，通达下情'),
  c('dali-shaoqing', '大理寺少卿', '大理寺', 4, 1, '平反刑狱'),
  c('taipu-shaoqing', '太仆寺少卿', '太仆寺', 4, 2, '协理马政'),
  c('honglu-shaoqing', '鸿胪寺少卿', '鸿胪寺', 5, 1, '赞相仪节'),
  c('shangbao-si', '尚宝司卿', '尚宝司', 5, 1, '掌宝玺符牌'),
  c('hedao', '总理河道', '工部', 4, 3, '总理河道，专治黄淮'),
  c('qintian', '钦天监监正', '钦天监', 5, 1, '察天文，占灾异'),
  c('bingbu-yuanwai', '兵部武选司郎中', '兵部', 5, 2, '武职铨选'),
  c('hubu-yuanwai', '户部山东司郎中', '户部', 5, 2, '分管一省钱粮'),
  c('xingbu-yuanwai', '刑部浙江司郎中', '刑部', 5, 1, '分管一省刑名'),
]

export const OFFICE_BY_ID = new Map(OFFICES.map((o) => [o.id, o]))

export function officeName(id: string | null): string {
  if (!id) return '在籍'
  return OFFICE_BY_ID.get(id)?.name ?? '在籍'
}

/** 品级的中文写法 */
export function rankCN(rank: number): string {
  const names = ['', '正一品', '正二品', '正三品', '正四品', '正五品', '正六品', '正七品', '正八品', '正九品']
  return names[rank] ?? '未入流'
}

/** 地方官对应哪个方向的事 */
export function regionOf(officeId: string | null): string | undefined {
  if (!officeId) return undefined
  return OFFICE_BY_ID.get(officeId)?.region
}
