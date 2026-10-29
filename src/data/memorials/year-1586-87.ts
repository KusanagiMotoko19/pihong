import { def } from '../../engine/events'

/**
 * 万历十四年、十五年（1586—1587）。turn 126 — 179。
 *
 * 国本之争从这一年起。它不是一个事件，是一个二十年都解不开的结——
 * 你在这两年做的每一个选择，都在为那个结打第一个扣。
 */

/* ══════════════════ 万历十四年 ══════════════════ */

export const y14Guoben = def(
  'y14-guoben',
  'urgent',
  () => ({
    from: '礼部尚书',
    title: '为皇三子诞生、请定名分、以安国本事',
    summary: '皇三子生，母郑氏进封皇贵妃，位在皇长子母之上。东宫之位未定。',
    body:
      `臣谨奏：皇三子生，母子平安，此宗社之福。\n\n` +
      `惟有一事，臣不敢不言：皇长子今年五岁，中宫无出，` +
      `长子为庶长，于礼当立。然东宫之位，至今未定。\n\n` +
      `今皇三子之母郑氏，进封皇贵妃，位在皇长子生母之上。` +
      `外间已有议论，谓「将易储」。臣知此言无据，` +
      `然人言可畏，宗社之计不可不早定。\n\n` +
      `臣请早立东宫，以定国本。此言一出，臣自知触忌，` +
      `然此事关乎社稷，臣不敢缄默。`,
    piaoni: '皇子尚幼，此事俟后再议。',
    secret:
      '「俟后再议」四个字，是这一朝二十年党争的开头。' +
      '写这四个字的时候，申时行在边上看着，什么也没说。',
    patience: 3,
    yiEffect: { metric: { chaoshi: -5 } },
    ignoredEffect: { metric: { chaoshi: -9, guanfeng: -3 } },
    options: [
      {
        key: 'name',
        label: '立皇长子为太子',
        note: '一锤定音。郑贵妃那边要记一辈子',
        effect: {
          metric: { chaoshi: 8, minxin: 4 },
          flags: { guoben_settled: 1 },
        },
      },
      {
        key: 'wait',
        label: '俟后再议',
        note: '拖。拖到最后会拖成什么，谁也不知道',
        effect: {
          metric: { chaoshi: -6 },
          flags: { guoben_deferred: 1 },
        },
      },
      {
        key: 'favor',
        label: '不立，而厚待皇三子',
        note: '让人自己猜。猜到的人会站错队',
        effect: {
          metric: { chaoshi: -10, guanfeng: -5 },
          flags: { guoben_favor_third: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y14', when: (s) => s.turn >= 130 },
)

export const y14Petition = def(
  'y14-petition',
  'impeach',
  () => ({
    from: '刑部主事 李懋桧',
    title: '为申救言官、乞赐优容事',
    summary: '言官请立东宫被贬，李懋桧上疏申救，词甚激切。',
    body:
      `臣李懋桧谨奏：前月礼部诸臣请立东宫，降调者四人，夺俸者七人。\n\n` +
      `臣窃以为不可。请立东宫者，非为一人之私，是为宗社之计。` +
      `今以言获罪，则此后无人敢言国本 —— 而国本，是不可不言的。\n\n` +
      `臣闻宫中已有「待嫡」之说。夫待嫡者，待中宫生子也。` +
      `中宫春秋已高，此说之不可待，三尺童子知之。\n\n` +
      `臣愿皇上下一诏：立长子为太子。若臣言不当，` +
      `请先赐臣死，以谢天下。`,
    piaoni: '李懋桧出位妄言，着降三级，调外用。',
    secret:
      '申时行拟的。「降三级调外用」比「廷杖」轻，比「罚俸」重——' +
      '他是在找一个不会把事情闹大、又能让皇上消气的分寸。',
    patience: 2,
    yiEffect: { metric: { chaoshi: -4 } },
    ignoredEffect: { metric: { chaoshi: -7, guanfeng: -4 } },
    options: [
      {
        key: 'pardon',
        label: '免其降调，仍留原官',
        note: '皇上认一次软。言路会记这一笔',
        effect: {
          metric: { chaoshi: 7, guanfeng: 4 },
          flags: { petition_pardoned: 1 },
        },
      },
      {
        key: 'demote',
        label: '照拟降调',
        note: '',
        effect: { metric: { chaoshi: -3 }, flags: { petition_demoted: 1 } },
      },
      {
        key: 'flog',
        label: '廷杖，削籍为民',
        note: '打一个人，堵十张嘴',
        effect: {
          metric: { chaoshi: -8, guanfeng: -6 },
          flags: { petition_flogged: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y14b', when: (s) => s.turn >= 138 && (!!s.flags.guoben_deferred || !!s.flags.guoben_favor_third) },
)

export const y14Nihon = def(
  'y14-nihon',
  'routine',
  () => ({
    from: '兵部尚书',
    title: '为倭情叵测、乞预饬沿海兵备事',
    summary: '日本关白丰臣秀吉平定诸岛，调兵对马，朝鲜使臣来告。',
    body:
      `臣谨奏：日本国中，近年有一人曰丰臣秀吉，起于微贱，` +
      `数年之间尽并诸岛。今年调兵于对马岛，又征粮于九州。\n\n` +
      `朝鲜使臣至，言其国中亦有备。朝鲜于我，世为藩属，` +
      `其言可信。\n\n` +
      `臣查：日本犯我，往时不过沿海剽掠，为患虽久，不至大举。` +
      `然此人既并六十六州，其志恐不在剽掠。\n\n` +
      `臣请预饬浙江、福建、广东沿海兵备，并遣人探其对马虚实。`,
    piaoni: '着沿海各省督抚，严加哨探。',
    secret:
      '兵部这本递上来，其实没指望什么。' +
      '「严加哨探」四个字，往年也写过——写完之后，什么也没发生。',
    patience: 8,
    yiEffect: { metric: { bianfang: 2 } },
    ignoredEffect: { metric: { bianfang: -3 } },
    options: [
      {
        key: 'prepare',
        label: '饬沿海兵备，岁费十万',
        note: '花钱买安心。六年后才知道值不值',
        effect: {
          ledger: { taicang: -10 },
          metric: { bianfang: 6 },
          flags: { japan_prepared: 1 },
        },
      },
      {
        key: 'spy',
        label: '只遣人探虚实，不动兵',
        note: '便宜。知道得早，也算准备',
        effect: {
          ledger: { taicang: -3 },
          metric: { bianfang: 2 },
          flags: { japan_spied: 1 },
        },
      },
      { key: 'ignore', label: '海外的传闻，不必当真', note: '', effect: {} },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y14c', when: (s) => s.turn >= 150 },
)

/* ══════════════════ 万历十五年 ══════════════════ */

export const y15HairuiDie = def(
  'y15-hairui',
  'routine',
  () => ({
    from: '南京吏部侍郎 王用汲',
    title: '为故南京右都御史海瑞病故、谨具奏闻事',
    summary: '海瑞卒于南京，箧中仅俸银八两，旧袍数件。南京百姓罢市。',
    body:
      `臣谨奏：南京右都御史海瑞，于十月十四日病故，年七十五。\n\n` +
      `佥都御史王用汲入视其箧，仅俸银八两、旧袍数件，` +
      `有寒士所不堪者。\n\n` +
      `南京百姓闻之，罢市三日，白衣送者夹岸。\n\n` +
      `臣查其履历：历任应天巡抚、南京吏部侍郎，` +
      `所至之地，墨吏望风解印。然亦屡遭弹劾，` +
      `谓其「迁滞不达政体」。\n\n` +
      `今其人已死。臣请赐谥、赐祭葬。`,
    piaoni: '着礼部议谥、赐祭葬。',
    secret:
      '这个人一辈子没做成一件大事，因为他把每一件小事都当真。' +
      '朝廷给了他一个闲官，天下给了他一个清名。两不相欠。',
    patience: 8,
    yiEffect: { metric: { guanfeng: 3 } },
    ignoredEffect: { metric: { guanfeng: -3 } },
    options: [
      {
        key: 'honor',
        label: '赐谥忠介，赐祭葬',
        note: '给天下一个榜样',
        effect: { metric: { guanfeng: 6, minxin: 4 }, flags: { hairui_honored: 1 } },
      },
      {
        key: 'plain',
        label: '照常例赐祭，不加谥',
        note: '不抬他，也不贬他',
        effect: { metric: { guanfeng: 1 }, flags: { hairui_plain: 1 } },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y15', when: (s) => s.turn >= 166 },
)

export const y15Qijiguang = def(
  'y15-qijiguang',
  'impeach',
  () => ({
    from: '兵科给事中 王致祥',
    title: '为劾蓟镇总兵戚继光久任不迁、结党自固事',
    summary: '戚继光镇蓟十六年，被劾「久任不迁、结党自固」，罢归。',
    body:
      `臣谨奏：蓟镇总兵戚继光，镇守蓟州一十六年。\n\n` +
      `臣非谓其不能战。然一将久任，兵为将有，此非国家之福。` +
      `其部曲皆南兵旧部，其将佐皆其亲信。名曰蓟镇之兵，实为戚家之兵。\n\n` +
      `又闻其与张居正往来，居正当国时，岁有馈遗。` +
      `今居正已败，其党未清。\n\n` +
      `臣请罢其兵柄，调京闲住。`,
    piaoni: '戚继光着回籍闲住。蓟镇总兵另推。',
    secret:
      '这道票拟是张四维拟的。他动手不是因为戚继光有罪——' +
      '是因为戚继光是张居正的人，而蓟镇的兵，是天下最能打的兵。',
    patience: 2,
    yiEffect: { metric: { bianfang: -4 } },
    ignoredEffect: { metric: { bianfang: -2, chaoshi: 2 } },
    options: [
      {
        key: 'keep',
        label: '不许。留其兵柄',
        note: '跟执政顶一次。蓟镇的兵还用得上',
        effect: {
          metric: { bianfang: 6, chaoshi: -5 },
          flags: { qijiguang_kept: 1 },
        },
      },
      {
        key: 'move',
        label: '调为广东总兵，南迁不夺兵',
        note: '给个体面，实权变成空衔',
        effect: {
          metric: { bianfang: -2, chaoshi: 2 },
          flags: { qijiguang_moved: 1 },
        },
      },
      {
        key: 'fire',
        label: '照拟罢归',
        note: '',
        effect: {
          metric: { bianfang: -7, chaoshi: -2 },
          flags: { qijiguang_fired: 1 },
        },
      },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y15b', when: (s) => s.turn >= 172 && !!s.flags.zhang_stripped },
)

export const y15Jingying = def(
  'y15-jingying',
  'project',
  () => ({
    from: '协理京营戎政 张国彦',
    title: '为京营积弊、乞赐清查事',
    summary: '京营册载十二万，实存四万；军器朽坏，火器炸过三门。',
    body:
      `臣谨奏：京营额设十二万，今册上尚存十一万七千，实存四万一千。\n\n` +
      `缺额之饷，十九年来源源解入，不知所往。\n\n` +
      `军器库中，盔甲三千副，可用者九百；弓箭五万支，可用者一万二千；` +
      `火器三百门，试放炸过三门，余者不知能不能响。\n\n` +
      `臣请清查京营，并请修复军器。然此事一动，` +
      `牵涉提督、坐营、把总数十人 —— 而这些人，多是勋臣之后。`,
    piaoni: '着兵部会同戎政，清查具奏。',
    secret:
      '京营的事，二十年没人敢碰。不是查不出，是查出来也没人敢办——' +
      '吃这份空饷的，一半是公侯伯，一半是宫里的人。',
    patience: 5,
    yiEffect: { metric: { bianfang: 2 } },
    ignoredEffect: { metric: { bianfang: -4 } },
    options: [
      {
        key: 'audit',
        label: '严查空额，追赃补饷',
        note: '能补上几万兵，勋贵要跟你翻脸',
        effect: {
          ledger: { taicang: 16 },
          metric: { bianfang: 8, chaoshi: -8, guanfeng: 4 },
          flags: { jingying_audited: 1 },
        },
      },
      {
        key: 'weapon',
        label: '先修军器，空额慢慢再说',
        note: '花钱在看得见的东西上',
        effect: {
          ledger: { taicang: -14 },
          metric: { bianfang: 5 },
          flags: { jingying_weapon: 1 },
        },
      },
      { key: 'skip', label: '此时不宜动摇京营', note: '', effect: { metric: { bianfang: -2 } } },
    ],
  }),
  { weight: 0, cooldown: 999, line: 'y15c', when: (s) => s.turn >= 176 },
)

export const YEAR_1586_87 = [y14Guoben, y14Petition, y14Nihon, y15HairuiDie, y15Qijiguang, y15Jingying]
