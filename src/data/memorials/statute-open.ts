import { def } from '../../engine/events'
import type { WorldState } from '../../engine/types'

/**
 * 议法的奏疏（续）。
 *
 * 律令不是菜单。每一条法，背后都有一个吃亏的人、一笔对不上的账、
 * 一个终于忍不住的衙门。他们把这件事实写成本子递上来，
 * 你才知道世上还有这么一条路可以走。
 *
 * 这本子里写的是「该不该议」，不是「该不该办」——但只要你说了「议」，
 * 那条法就摆到了律令页上，立不立再由你定。
 *
 * 十五条都是这样：先有人喊疼，才有法可立。
 */

const on = (s: WorldState, id: string) => !!s.statutes[id]

/* ══════════════════════════ 盐法 ══════════════════════════ */

export const openYanfa = def(
  'open-yanfa',
  'routine',
  (s) => ({
    from: '两淮巡盐御史',
    title: '为盐课壅积、边储不继、乞改纲运事',
    summary: `两淮盐引壅积一百二十万道，商人不肯中；边镇粮储只够三个月。`,
    body:
      `臣谨奏：两淮盐课，是天下盐课之半。往年边镇缺粮，召商纳粟，官给盐引——` +
      `商人运粮到边，领引支盐，官民两便。此谓「开中」。\n\n` +
      `近年以来，开中之法坏了：守边的将官，把盐引先截了，转卖给京里的势要；` +
      `势要再转手，一引之利，官得三，私得七。商人算了账，运粮到边不如买引` +
      `到扬州，于是边镇的粮仓，一年比一年空。\n\n` +
      `臣查：两淮盐引，壅积一百二十万道；边镇报来的粮储，宣大只够三个月，` +
      `辽东只够两个月。太仓现存银${Math.round(s.taicang)}万，九边年例还欠着一半。\n\n` +
      `臣请改行纲运：盐课由运司直接征银，解户部；商人在运司纳银领引，` +
      `不再经边镇转手。如此，盐利归官，边储改由太仓发银采买。\n\n` +
      `此举有两难：边镇从此不再有商人送粮，将官必以为断其命脉；` +
      `而运司与纲商合流，未必不生出新的弊。臣不敢专，伏乞圣裁。`,
    piaoni: '着户部覆议，仍令边镇具奏有无妨碍。',
    secret:
      '巡盐御史这本，一半是为国课，一半是为自己。纲运一改，盐政的权力从边镇回到运司，' +
      '也就是回到他这一类人手里。',
    patience: 4,
    yiEffect: { ledger: { taicang: 4 }, metric: { bianfang: -1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，改纲运',
        effect: {
          metric: { guanfeng: 1 },
          flags: { open_yanfa: 1 },
          log: '诏议盐法改纲运。边镇将官联名具奏，言「边储自此无着」。',
        },
      },
      {
        key: 'hold',
        label: '仍旧开中，只严查截引',
        effect: { ledger: { taicang: 3 }, metric: { bianfang: 1 }, log: '盐法之议，暂缓。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'yanfa') && s.turn >= 5,
    forbids: ['open_yanfa'],
  },
)

/* ══════════════════════════ 漕折 ══════════════════════════ */

export const openCaozhe = def(
  'open-caozhe',
  'routine',
  () => ({
    from: '户部尚书',
    title: '为漕运耗费、运军赔累、乞议改折事',
    summary: `漕粮四百万石北运，一路耗米三成；运军月粮，已欠了八个月。`,
    body:
      `臣谨奏：漕粮四百万石，自南而北，过淮、过闸、过洪，一石到京，` +
      `脚费与耗米加起来，要三石之价。这是天下最贵的一条路。\n\n` +
      `运河这几年淤得快：高家堰一决，淮扬就断；闸河一浅，粮船就滞。` +
      `去年漕船回空，迟了四个月，运军月粮欠了八个月，沿途卖船、卖儿的事都有。\n\n` +
      `臣查：若将江南漕粮一半改折银两，每石折银七钱，解太仓；` +
      `京仓用银采买，商贩自会运来。省下的耗米与月粮，一岁可得二十万。\n\n` +
      `然此事有三难：一、京师米价必涨，小民先受其害；` +
      `二、运军十二万，失了月粮，便是十二万闲人；` +
      `三、漕运一系的官，从总督到闸官，全靠这条河吃饭。\n\n` +
      `臣不敢请全改，只请改一半，试行二年。伏乞圣裁。`,
    piaoni: '漕运乃国家命脉，改折一事，关系甚大。着九卿科道会议。',
    secret:
      '这本是户部尚书自己写的。户部的账上，漕粮的耗米是一笔糊涂账 ——' +
      '改了折，这笔账就归户部，他也就抓到了京仓采买的权。',
    patience: 4,
    yiEffect: { ledger: { taicang: 5 }, metric: { minxin: -1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，改折一半',
        effect: {
          ledger: { taicang: 6 },
          metric: { minxin: -3, guanfeng: 1 },
          flags: { open_caozhe: 1 },
          log: '诏议漕粮改折。漕运总督上疏力争，言「祖宗之制不可变」。',
        },
      },
      {
        key: 'hold',
        label: '不许。漕运关系国本',
        effect: { metric: { chaoshi: 2 }, log: '漕折之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'caozhe') && s.turn >= 8,
    forbids: ['open_caozhe'],
  },
)

/* ══════════════════════════ 海运 ══════════════════════════ */

export const openHaiyun = def(
  'open-haiyun',
  'routine',
  () => ({
    from: '工科都给事中',
    title: '为运河淤塞、漕运不通、乞复海运事',
    summary: '闸河浅涩，粮船滞留两月；元朝海运旧道尚在，请试之。',
    body:
      `臣谨奏：今年漕船过淮，迟了两月。问其故，曰「闸河水浅，一日只行十里」。\n\n` +
      `运河自永乐年间开通，二百年了。河身淤高，堤岸单薄：北段靠泉，泉眼塞了；` +
      `南段靠湖，湖水涨了就决堤。每年挑浅、修闸，费银几十万，只保得半年。\n\n` +
      `臣查前元旧制：漕粮自淮安出海，经登莱、成山，至天津入京。` +
      `其路比运河近，其费比河运省。前朝行二百余年，本朝太祖、成祖时亦尝行之。\n\n` +
      `臣请：募沙船三百，自淮安出海，岁运二百万石；运河仍留一半，` +
      `两路并行，试之三年。若海运有成，运河可专供转输，不必岁岁挑浅。\n\n` +
      `然海运之险，不可不奏：漂没之事，前朝多有。一船沉，数百人，` +
      `此责在臣。伏乞圣裁。`,
    piaoni: '海运之议，前朝屡行屡罢。着户部、工部、漕运总督会议。',
    secret:
      '这本是工科给事中写的，他管不了漕运，也没出过海。' +
      '他真正想说的是：运河的账，工部看不下去。',
    patience: 4,
    yiEffect: { metric: { chaoshi: -1 } },
    options: [
      {
        key: 'discuss',
        label: '着会议，试海运三年',
        effect: {
          metric: { chaoshi: -2, bianfang: 1 },
          flags: { open_haiyun: 1 },
          log: '诏议海运。漕运总督与沿河州县，交章言其不便。',
        },
      },
      {
        key: 'hold',
        label: '不必。修河比试海稳当',
        effect: { ledger: { taicang: -3 }, log: '海运之议，不许。挑浅的银子照旧花。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'haiyun') && s.turn >= 14,
    forbids: ['open_haiyun'],
  },
)

/* ══════════════════════════ 马政 ══════════════════════════ */

export const openMazheng = def(
  'open-mazheng',
  'routine',
  (s) => ({
    from: '太仆寺卿',
    title: '为马政困敝、民牧赔累、乞改折银事',
    summary: '北直隶民牧马匹，一马之累，破一家之产；太仆寺库中，银却不多。',
    body:
      `臣谨奏：太仆寺之政，本朝二百年来，以民牧为主：北直隶、山东、河南之民，` +
      `按丁养马，免其徭役。此谓「民牧」。\n\n` +
      `民牧之苦，臣在外任时见过：一户养一马，马死则赔，马病则罚，` +
      `种马孳生不及数，也要赔。一马之累，破一家之产；一家破，一甲逃。\n\n` +
      `而太仆寺的库中，其实存银不过${Math.round(s.taipu)}万 —— 这些年边饷不足，` +
      `兵部动不动就来「借」。借了不还，账上还挂着。\n\n` +
      `臣请改民牧为折银：每马折银十两，民户纳银，免其养马；` +
      `太仆寺收银，边镇用马时发银采买。如此，民免赔累，寺中亦有余银。\n\n` +
      `然有一节：边镇的马，是要能打仗的。银子买来的马，牙行说了算；` +
      `买得急，价就十倍。臣不敢断其必善，伏乞圣裁。`,
    piaoni: '着兵部、太仆寺会议。',
    secret:
      '太仆寺卿这本，说得很实在：他库里的银子被兵部借着不还，' +
      '他想把「借」变成「征」——民牧改折之后，账就是太仆寺自己的账。',
    patience: 4,
    yiEffect: { ledger: { taipu: 6 }, metric: { bianfang: -1 } },
    options: [
      {
        key: 'discuss',
        label: '着会议，改民牧为折银',
        effect: {
          ledger: { taipu: 10 },
          metric: { minxin: 2, bianfang: -2 },
          flags: { open_mazheng: 1 },
          log: '诏议马政改折。兵部言「边马自此难得」。',
        },
      },
      {
        key: 'hold',
        label: '仍旧民牧，只免种马赔补',
        effect: { metric: { minxin: 3 }, log: '马政之议，暂缓。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'mazheng') && s.turn >= 6,
    forbids: ['open_mazheng'],
  },
)

/* ══════════════════════════ 蠲免逋赋 ══════════════════════════ */

export const openJuanmian = def(
  'open-juanmian',
  'routine',
  () => ({
    from: '河南巡抚',
    title: '为积欠如山、民逃过半、乞蠲旧逋事',
    summary: `河南一省积欠二百四十万石，逃户十之三；追比之下，死者相望。`,
    body:
      `臣谨奏：河南自万历七年以来，连岁荒歉。一亩之收，不敷一亩之税；` +
      `一县之民，逃者十之三。\n\n` +
      `积欠二百四十万石，其中六成是万历十年以前的旧账。州县按册追比，` +
      `户已绝而册未除，则责之里甲；里甲不能支，则责之里长。` +
      `前月杞县一里长，追比不过，自缢于县门。\n\n` +
      `臣请：万历十年以前逋欠，一概蠲免；十年以后，許分三年带征。` +
      `如此，册上少一笔死账，民间多一条活路。\n\n` +
      `然户部必不肯：这笔账他们记了十年，一蠲，账面上就是亏空。` +
      `臣不敢请，只敢奏。伏乞圣裁。`,
    piaoni: '积欠一事，屡经言官奏请。着户部查议，果系灾伤，准其蠲免。',
    secret:
      '河南巡抚这本，一半是替百姓，一半是替自己：他今年考满，' +
      '如果逋欠还在册上，他就是「征赋不足」的那一个。',
    patience: 3,
    yiEffect: { ledger: { taicang: -5 }, metric: { minxin: 3 } },
    options: [
      {
        key: 'pardon',
        label: '蠲万历十年以前逋欠',
        effect: {
          metric: { minxin: 8, guanfeng: 1 },
          flags: { open_juanmian: 1 },
          log: '诏蠲各省旧逋。户部具奏，言「国用将绌」。',
        },
      },
      {
        key: 'chase',
        label: '不许。只准分年带征',
        effect: {
          ledger: { taicang: 8 },
          metric: { minxin: -6 },
          log: '诏不许蠲免，只许分年带征。河南又逃了一批。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'juanmian') && s.turn >= 7 && s.truth.minxin < 58,
    forbids: ['open_juanmian'],
  },
)

/* ══════════════════════════ 加派 ══════════════════════════ */

export const openJiapai = def(
  'open-jiapai',
  'routine',
  (s) => ({
    from: '户部尚书',
    title: '为帑藏空虚、边饷无措、乞暂加田赋事',
    summary: `太仓只剩${Math.round(s.taicang)}万，下月九边年例无处取。` + '臣请每亩暂加三厘。',
    body:
      `臣谨奏：太仓现存银${Math.round(s.taicang)}万。下月应发九边年例十一万，` +
      `百官俸禄二万，太仆寺借支的旧账还没清。臣算过，到这个月底，库里剩不下三万。\n\n` +
      `臣不敢请动内帑 —— 内帑是皇上的私房，臣无此理。臣也不敢再借太仆，` +
      `那个窟窿已经借了二十年。\n\n` +
      `臣请：天下田亩，每亩暂加银三厘，名曰「边饷预征」。天下田约七百万顷，` +
      `每亩三厘，一岁可得银二十余万。加派三年，边饷可支。\n\n` +
      `臣知道这两个字不好看。万历初年张太师在日，最恨的就是加派；` +
      `他说「加派一开，十年收不回去」。臣也这么想。可是下个月的饷，` +
      `总得有个出处。伏乞圣裁。`,
    piaoni: '加派之事，关系民心。着九卿会议，不许轻议。',
    secret:
      '这本是户部尚书递的，也是被逼的：九边欠饷，兵部一天三道咨文来催，' +
      '催到后来，连他衙门的书办都被骂哭了。',
    patience: 3,
    yiEffect: { ledger: { taicang: 8 } },
    options: [
      {
        key: 'levy',
        label: '准加三厘，三年为限',
        effect: {
          ledger: { taicang: 18 },
          metric: { minxin: -8, chaoshi: -2 },
          flags: { open_jiapai: 1 },
          log: '诏亩加三厘。科道交章论劾，言「此亡国之政」。',
        },
      },
      {
        key: 'no',
        label: '不许。另议节用',
        effect: {
          ledger: { taicang: -6 },
          metric: { minxin: 4, chaoshi: 2 },
          log: '诏不许加派。户部与兵部，在文华门外吵了一架。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'jiapai') && s.turn >= 10 && s.taicang < 120,
    forbids: ['open_jiapai'],
  },
)

/* ══════════════════════════ 汰冗员 ══════════════════════════ */

export const openRongyuan = def(
  'open-rongyuan',
  'routine',
  () => ({
    from: '吏部尚书',
    title: '为官冗役滥、俸禄不支、乞行裁革事',
    summary: '两京添设官三百余员，各省佐贰闲住者以千计；俸禄却一文不能少。',
    body:
      `臣谨奏：两京各衙门，额设之外，添设者三百余员；各省佐贰、首领官，` +
      `闲住无差者，以千计。此辈不干事，却要吃俸。\n\n` +
      `臣查户部账：一岁俸禄，京官二十四万，外官三十六万。` +
      `若去其三之一，岁可省银二十万 —— 这二十万，正好是九边一个月的年例。\n\n` +
      `然裁革有三难：一、添设之官，多是阁臣、部院堂官荐的，裁一个，得罪一个；` +
      `二、各省佐贰，多是举人、监生出身，无他生计，裁了就要闹；` +
      `三、考成法正在行，州县缺人，裁了更办不动。\n\n` +
      `臣请：先裁两京添设官，各省佐贰暂留；一年之后，再看成效。` +
      `宁可慢，不可乱。伏乞圣裁。`,
    piaoni: '裁革冗员，前朝有行之者，然未几而复。着吏部详议。',
    secret:
      '吏部尚书这本，写得像替朝廷省钱，其实是替自己立威：' +
      '裁谁不裁谁，名单从他手里过。',
    patience: 4,
    yiEffect: { ledger: { taicang: 3 }, metric: { chaoshi: -1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，先裁两京添设官',
        effect: {
          ledger: { taicang: 4 },
          metric: { guanfeng: 2, chaoshi: -2 },
          flags: { open_rongyuan: 1 },
          log: '诏议裁革冗员。被裁者数十人，聚于吏部门前。',
        },
      },
      {
        key: 'hold',
        label: '不必。人多好办事',
        effect: { metric: { chaoshi: 1 }, log: '汰冗之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'rongyuan') && s.turn >= 7,
    forbids: ['open_rongyuan'],
  },
)

/* ══════════════════════════ 裁驿 ══════════════════════════ */

export const openCaiyi = def(
  'open-caiyi',
  'routine',
  () => ({
    from: '兵部尚书',
    title: '为驿递困敝、夫马逃亡、乞行裁并事',
    summary: '天下驿站一千余处，岁费银三百万；勘合滥发，白吃白住者无数。',
    body:
      `臣谨奏：天下驿站一千零五十处，岁费银三百万两 —— 这个数，是太仓岁入的四分之三。\n\n` +
      `驿站之弊，不在驿而在「勘合」：一张勘合，可以支夫十名、马五匹、廪给三份。` +
      `京官出京，勘合是吏部给的；外官入京，勘合是兵部给的；还有一种是「飞票」，` +
      `乡宦、生员、举人都有办法弄到手。\n\n` +
      `臣查万历五年，各省勘合发了一万二千张；额定不过三千。多出来的九千张，` +
      `每张支银三两，就是二万七千两 —— 这还只是明账。\n\n` +
      `臣请：裁并驿站十之三，核减夫马；凡无勘合而支应者，以枉法论。` +
      `省下来的银，解户部。\n\n` +
      `然驿卒数万，失了差事，便是数万闲人。此事臣不敢不奏。伏乞圣裁。`,
    piaoni: '驿递之弊，言者屡矣。着兵部会同户部会议。',
    secret:
      '兵部尚书这本，算得很精：驿递省下的钱，他说解户部，其实兵部想留一半养马。',
    patience: 4,
    yiEffect: { ledger: { taicang: 2 }, metric: { minxin: -1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，裁并十之三',
        effect: {
          ledger: { taicang: 3 },
          metric: { guanfeng: 1, minxin: -2 },
          flags: { open_caiyi: 1 },
          log: '诏议裁驿。各省驿卒，聚于按察司门前。',
        },
      },
      {
        key: 'hold',
        label: '不必。驿递一通，天下才通',
        effect: { metric: { chaoshi: 1 }, log: '裁驿之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'caiyi') && s.turn >= 9,
    forbids: ['open_caiyi'],
  },
)

/* ══════════════════════════ 清军 ══════════════════════════ */

export const openQingjun = def(
  'open-qingjun',
  'routine',
  () => ({
    from: '兵部尚书',
    title: '为卫所空额、兵册虚冒、乞行清军事',
    summary: '辽东额兵八万，实额不足六万；空额之饷，尽入将官私囊。',
    body:
      `臣谨奏：卫所之兵，本朝以军户世袭。军户逃亡，则勾其原籍之丁补伍，` +
      `此谓「清军」。二百年下来，军户逃的逃、绝的绝，册上的人，早就不是地上的。\n\n` +
      `臣查辽东：额兵八万，实额不足六万。空出来的两万人，饷银照领 ——` +
      `这一笔，各级将官分。臣不敢说分得多少，只知道辽东的总兵，` +
      `去年在京师买了两处宅子。\n\n` +
      `臣请：遣御史分赴各省清军，凡逃亡者，勾其户丁补伍；` +
      `冒名顶替者，革。一年一造册，送兵部备查。\n\n` +
      `然清军之法，最难在「勾军」：一户逃了，勾其族人；族人逃了，勾其里甲。` +
      `一纸军帖下去，能勾散一个村。此事臣不敢不言。伏乞圣裁。`,
    piaoni: '清军一事，屡行屡止。着兵部会同都察院议奏。',
    secret:
      '兵部尚书这本，说的都是实话；他真正想要的，是把空额的账拿到自己手里 ——' +
      '清军一办，兵部的册子才是唯一的册子。',
    patience: 4,
    yiEffect: { metric: { bianfang: 2, minxin: -1 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，遣御史清军',
        effect: {
          metric: { bianfang: 3, minxin: -2, guanfeng: 1 },
          flags: { open_qingjun: 1 },
          log: '诏遣御史清军。各省勾军之帖，一日发出三百。',
        },
      },
      {
        key: 'hold',
        label: '不必。清一次，乱一次',
        effect: { metric: { minxin: 2 }, log: '清军之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'qingjun') && s.turn >= 10,
    forbids: ['open_qingjun'],
  },
)

/* ══════════════════════════ 商屯 ══════════════════════════ */

export const openShangtun = def(
  'open-shangtun',
  'routine',
  () => ({
    from: '宣大总督',
    title: '为边地荒芜、储峙不足、乞召商屯种事',
    summary: '宣府、大同关外荒地千里；请召商开垦，给引免科。',
    body:
      `臣谨奏：宣府、大同关外，荒地千里。国初设卫屯田，军士自种自食；` +
      `如今屯田尽废，军士的粮，全靠太仓发银来买。\n\n` +
      `臣尝出关巡视：土是好的，水也够，只是没人种。为什么没人种？` +
      `一、种了要被虏骑抢；二、种了要交科；三、种了之后，卫所说来收「屯田旧额」。\n\n` +
      `臣请：召商开种。凡商人在边地开荒者，给盐引，免三年科；` +
      `三年之后，按亩起科，仍比内地轻。如此，边地有粮，商有引，` +
      `官府不必岁岁千里转输。\n\n` +
      `然商人屯田，必有家丁、有堡寨，久而久之，边地就有了不服管的私兵。` +
      `此事关系甚大，臣不敢专，伏乞圣裁。`,
    piaoni: '着户部、兵部会议。',
    secret:
      '宣大总督这本，写得很坦白：他要的不是粮，是边地的「商」——' +
      '有商就有税，有税就有他可以支配的钱。',
    patience: 4,
    yiEffect: { ledger: { taicang: 2 }, metric: { bianfang: 2 } },
    options: [
      {
        key: 'discuss',
        label: '着会议，召商屯种',
        effect: {
          metric: { bianfang: 3, minxin: -1 },
          flags: { open_shangtun: 1 },
          log: '诏议商屯。户部言「盐引有限，商屯夺之」。',
        },
      },
      {
        key: 'hold',
        label: '不必。边地之事，宁简毋繁',
        effect: { metric: { chaoshi: 1 }, log: '商屯之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'shangtun') && s.turn >= 8,
    forbids: ['open_shangtun'],
  },
)

/* ══════════════════════════ 京营募兵 ══════════════════════════ */

export const openJingying = def(
  'open-jingying',
  'routine',
  () => ({
    from: '京营提督',
    title: '为京营疲敝、军户逃亡、乞改募兵事',
    summary: '京营额兵十二万，实能披甲者不足三万；请改募兵，厚给粮饷。',
    body:
      `臣谨奏：京营额兵十二万，臣点过两回：第一回实到五万，第二回实到三万七千。` +
      `来的人里，能披甲、能开弓的，不到一半。\n\n` +
      `问其故：军户是世袭的，父死子替；替不上，就雇人应点 —— 一人一旬银一钱。` +
      `点过之后，各回各家做买卖。这样的兵，守城门尚可，打仗是不行的。\n\n` +
      `臣请改募兵：选民间壮丁，月给银一两五钱，另给冬衣；` +
      `选锋三千，专习火器。卫所军户，渐次改募，不愿者听。\n\n` +
      `然募兵最贵：一岁之饷，比军户多三倍。户部必不肯，兵部也未必肯 ——` +
      `募兵是提督的兵，不是尚书的兵。此事臣不敢专，伏乞圣裁。`,
    piaoni: '京营积弊已久。募兵之议，着户部、兵部会议，务求可行。',
    secret:
      '京营提督这本，话里有话：募来的兵，饷由他发，将由他选 ——' +
      '十二万人的京营如果变成三万募兵，这三万人是谁的兵？',
    patience: 4,
    yiEffect: { metric: { bianfang: 2 }, ledger: { taicang: -3 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，改募兵',
        effect: {
          metric: { bianfang: 4, guanfeng: 1 },
          ledger: { taicang: -8 },
          flags: { open_jingying: 1 },
          log: '诏议京营募兵。户部尚书奏：「饷从何出？」',
        },
      },
      {
        key: 'hold',
        label: '不许。京营照旧点卯',
        effect: { ledger: { taicang: 3 }, log: '募兵之议，不许。京营照旧点卯。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'jingying') && s.turn >= 10,
    forbids: ['open_jingying'],
  },
)

/* ══════════════════════════ 内操 ══════════════════════════ */

export const openNeicao = def(
  'open-neicao',
  'routine',
  () => ({
    from: '司礼监掌印太监',
    title: '为京营不可恃、乞简内臣习武以备非常事',
    summary: '奴才请简选内臣三千，习弓马火器于内教场，以备宿卫。',
    body:
      `奴才谨奏：京营的兵，奴才不敢说。前月点卯，十二万的册子，来的不到四万。\n\n` +
      `奴才想着：宫城宿卫，是奴才们的差事。万一有变，靠谁？` +
      `请简选内臣年少有力者三千，于内教场习弓马、习火器，` +
      `另选二百人习刀盾。此辈吃的是皇上的饭，认的是皇上的人。\n\n` +
      `奴才不敢说这是「兵」。只是宫里得有些能动手的人。\n\n` +
      `然外廷若知，必以为内臣典兵之始，必有一番话说。` +
      `奴才不敢瞒，伏乞圣裁。`,
    piaoni: '内臣习武，祖宗朝未有此例。此事关系甚大，请旨裁夺。',
    secret:
      '这本是司礼监递的。内操一开，宫里的刀就在他们手里 ——' +
      '「以备非常」四个字，非常的是谁，他们没写。',
    patience: 3,
    yiEffect: { metric: { chaoshi: -2, guanfeng: -1 } },
    options: [
      {
        key: 'allow',
        label: '准内操，简选三千',
        effect: {
          metric: { bianfang: 2, chaoshi: -4, guanfeng: -2 },
          flags: { open_neicao: 1 },
          log: '诏准内操。外廷闻之，六科连章，言「阉寺典兵，非国家之福」。',
        },
      },
      {
        key: 'deny',
        label: '不许。宿卫自有京营',
        effect: { metric: { chaoshi: 3 }, log: '内操之议，不许。司礼监叩首而退。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'neicao') && s.turn >= 12,
    forbids: ['open_neicao'],
  },
)

/* ══════════════════════════ 讲学 ══════════════════════════ */

export const openJiangxue = def(
  'open-jiangxue',
  'routine',
  () => ({
    from: '礼部右侍郎',
    title: '为书院久废、士习日偷、乞弛讲学之禁事',
    summary: '天下书院，自万历七年禁毁，士人无讲习之所；请弛其禁。',
    body:
      `臣谨奏：书院之禁，起于万历七年。当时以「聚徒空谈、摇撼朝政」为罪，` +
      `毁天下书院六十四处。至今四年，书院是毁了，士习却没有变好。\n\n` +
      `臣在礼部，看得见两件事：一、士子无讲习之所，只读程文，学问日陋；` +
      `二、书院虽毁，讲学的人还在，改在寺庙、在私宅，反而更不受管。\n\n` +
      `臣请：弛讲学之禁。各省书院，许其复设；讲学不必先报有司。` +
      `但有聚众干政、诽谤朝政者，仍以律论 —— 禁的是干政，不是讲学。\n\n` +
      `然讲学之风一开，士论必盛；士论盛，则朝廷的是非，就有人说三道四。` +
      `此事臣不敢专，伏乞圣裁。`,
    piaoni: '讲学一事，前有明旨禁之。着礼部再议。',
    secret:
      '礼部右侍郎是翰林出身。他这本，是替自己的同年、门生说话 ——' +
      '书院一开，讲学的那些人，多是他的师友。',
    patience: 4,
    yiEffect: { metric: { guanfeng: 1 } },
    options: [
      {
        key: 'open',
        label: '弛禁，许复书院',
        effect: {
          metric: { guanfeng: 2, minxin: 1, chaoshi: -2 },
          flags: { open_jiangxue: 1 },
          log: '诏弛讲学之禁。各省书院，次第复设。',
        },
      },
      {
        key: 'keep',
        label: '仍旧禁之',
        effect: { metric: { chaoshi: 2, guanfeng: -1 }, log: '讲学之禁，仍旧。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'jiangxue') && s.turn >= 9,
    forbids: ['open_jiangxue'],
  },
)

export const openJinjiangxue = def(
  'open-jinjiangxue',
  'routine',
  () => ({
    from: '内阁首辅',
    title: '为士风嚣竞、聚徒非议事，乞申讲学之禁事',
    summary: '各省私设书院，聚徒数百，议论朝政；请申严禁，拆毁如故。',
    body:
      `臣谨奏：书院之禁，行了四年，禁而不绝。各省仍有私设者：` +
      `或托名「社学」，或称「讲会」，聚徒数百，旬日一会。\n\n` +
      `臣不是怕他们讲学。臣是怕他们讲完了，把讲的话写成书，刻出来卖；` +
      `书一出来，天下的士子都读了，读完了就以为朝政该这么办 ——` +
      `而他们连一个县的赋税都收不上来。\n\n` +
      `臣请：申明旧禁。凡私设书院者，拆毁；聚徒讲学者，以违制论；` +
      `刻书售卖者，追板销毁。有司岁终具报。\n\n` +
      `臣知道这会招骂。但是非出于士口，政令就没有一天能行得通。` +
      `伏乞圣裁。`,
    piaoni: '着礼部、都察院申明旧例。',
    secret:
      '首辅这本，其实是替自己：书院里骂得最凶的，正是他当年得罪过的那几个人。',
    patience: 4,
    yiEffect: { metric: { chaoshi: 1, guanfeng: -1 } },
    options: [
      {
        key: 'ban',
        label: '申禁，拆毁私设书院',
        effect: {
          metric: { chaoshi: 3, guanfeng: -2, minxin: -1 },
          flags: { open_jinjiangxue: 1 },
          log: '诏申讲学之禁。各省拆毁书院十一处，士林大哗。',
        },
      },
      {
        key: 'relax',
        label: '不必。让他们说去',
        effect: { metric: { guanfeng: 1 }, log: '申禁之议，不许。' },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'jinjiangxue') && s.turn >= 9,
    forbids: ['open_jinjiangxue'],
  },
)

/* ══════════════════════════ 宗藩限封 ══════════════════════════ */

export const openXianfeng = def(
  'open-xianfeng',
  'routine',
  () => ({
    from: '礼部尚书',
    title: '为宗藩日繁、禄米不继、乞议限封事',
    summary: '在册宗室逾十万，岁支禄米八百五十万石；请自郡王以下减等承袭。',
    body:
      `臣谨奏：太祖高皇帝封建诸王，本意是屏藩皇室。二百年下来，宗室在册者逾十万：` +
      `亲王三十，郡王二百余，将军、中尉以下，不可胜数。\n\n` +
      `岁支禄米八百五十万石。天下税粮，不过二千六百万石 —— 三分之一，养宗室。` +
      `山西、河南两省，存留粮不够宗禄，年年要向户部请拨。\n\n` +
      `臣请：自郡王以下，不世袭罔替。亲王之子封郡王，郡王之子降封镇国将军，` +
      `以次递降；禄米随爵递减。如此，三代之后，宗禄可减其半。\n\n` +
      `然此法是动太祖的成法。宗人府必以为不可，各王府必有泣诉；` +
      `而《皇明祖训》就摆在奉天殿上，臣不敢不奏。伏乞圣裁。`,
    piaoni: '祖训具在，此事非臣下所敢议。请旨。',
    secret:
      '礼部尚书这本，是替户部递的 —— 户部被宗禄逼了二十年，' +
      '只是从来没有一个礼部尚书敢把「限封」两个字写在纸上。',
    patience: 3,
    yiEffect: { ledger: { taicang: 3 }, metric: { chaoshi: -2 } },
    options: [
      {
        key: 'discuss',
        label: '下部议，限封降等',
        effect: {
          metric: { chaoshi: -4, guanfeng: 1 },
          flags: { open_xianfeng: 1 },
          log: '诏议宗藩限封。宗人府具奏，言「祖训不可违」。',
        },
      },
      {
        key: 'hold',
        label: '不必。祖训不可动',
        effect: {
          ledger: { taicang: -3 },
          metric: { chaoshi: 2 },
          log: '限封之议，不许。宗禄照旧。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 55,
    when: (s) => !on(s, 'xianfeng') && s.turn >= 12,
    forbids: ['open_xianfeng'],
  },
)

export const MORE_OPEN_TEMPLATES = [
  openYanfa,
  openCaozhe,
  openHaiyun,
  openMazheng,
  openJuanmian,
  openJiapai,
  openRongyuan,
  openCaiyi,
  openQingjun,
  openShangtun,
  openJingying,
  openNeicao,
  openJiangxue,
  openJinjiangxue,
  openXianfeng,
]

/* ══════════════════════════════════════════════════════════════════ *
 * 宗室的反制
 *
 * 玩家反馈：「对藩王苛刻没有实质影响」。
 * 确实 —— 原来只扣朝局一个数字，藩王连个回音都没有。
 * 这两本补上：夺了宗室的世业，藩府会闭门、会抗法、会越关赴京。
 * 每一本都要你拿钱或拿刀子去解决，不解决就一直摆着。
 * ══════════════════════════════════════════════════════════════════ */

export const zlRefuse = def(
  'zl-refuse',
  'urgent',
  (s) => ({
    from: '河南巡抚',
    title: '为藩府闭门、命官不得入、乞赐裁断事',
    summary: '代府闭门三月，粮册不交，藩校拦阻丈量；州县官到门，藩府称「王爷有病」。',
    body:
      `臣谨奏：宗禄改折之令下到河南，代府闭门三月。\n\n` +
      `藩府长史传话：「王爷有病，不见客。」臣遣布政使往，门不开；` +
      `遣按察使往，门仍不开。藩府校尉在门前拦人，说：「此地是王府，不是布政司。」\n\n` +
      `更要紧的是粮册：代府应纳的折银，一文未解；应报的庄田亩数，一册不交。` +
      `臣调了丈量的人去，藩校持棍守田埂，不许下绳。\n\n` +
      `臣查祖制：藩府有罪，长史代王受责。可如今长史躲在府里，` +
      `臣若派兵开门，便是「以兵胁宗室」，这个罪名臣担不起。\n\n` +
      `太仓现存银${Math.round(s.taicang)}万。河南一省的宗禄折银，` +
      `一年该解八万，如今一文没有。伏乞圣裁。`,
    piaoni: '着河南巡抚相机办理，毋得激变。',
    secret:
      '「相机办理」四个字，是让巡抚自己担责任。' +
      '他写这本，就是不想一个人担 —— 藩王与朝廷之间，他想站在后面。',
    patience: 3,
    yiEffect: { ledger: { taicang: -3 }, metric: { chaoshi: -2 } },
    ignoredEffect: { ledger: { taicang: -8 }, metric: { chaoshi: -4, guanfeng: -2 } },
    options: [
      {
        key: 'force',
        label: '遣兵开府，拿问长史',
        note: '开这个头，往后宗室都拿你当对头',
        effect: {
          ledger: { taicang: 8 },
          metric: { guanfeng: 3, chaoshi: -5, minxin: -1 },
          flags: { zl_forced: 1 },
          log: '诏遣兵开代府，拿问长史。粮册交出，折银追解。宗室闻之，人人自危。',
        },
      },
      {
        key: 'yield',
        label: '让步：许代府仍支本色一半',
        note: '开了口子，别府会跟着要',
        effect: {
          ledger: { taicang: -9 },
          metric: { chaoshi: 4, guanfeng: -2 },
          flags: { zl_yielded: 1 },
          log: '诏许代府支本色一半。三日之内，晋、沈二府各上一疏，请照代府之例。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 60,
    when: (s) =>
      (on(s, 'zonglu') || on(s, 'xianfeng')) && s.turn >= 14 && s.truth.chaoshi < 62,
  },
)

export const zlPetition = def(
  'zl-petition',
  'urgent',
  () => ({
    from: '礼部尚书',
    title: '为宗室越关赴京、聚于午门、乞赐处分事',
    summary: '宗室百余人自山西越关入京，聚于午门外击鼓陈情，已三日不散。',
    body:
      `臣谨奏：本月朔，宗室一百三十七人自山西越关入京，聚于午门外。\n\n` +
      `内中有奉国中尉十一人，辅国中尉二十余人，余皆庶宗。` +
      `他们不带兵器，只带了两样东西：一是《皇明祖训》，二是各府的禄米旧册。\n\n` +
      `为首者呼曰：「太祖高皇帝说，宗室禄米，永为定制。今日折色减半，` +
      `是要饿死朱家的子孙么？」\n\n` +
      `臣查：《祖训》确有「宗禄永额」之条；而今日之折，是本朝新例。` +
      `两者对不上，臣不能辩。\n\n` +
      `他们已经三日不散。京营不敢动，锦衣卫不敢拿 —— 拿宗室，比拿言官难。` +
      `伏乞圣裁。`,
    piaoni: '着礼部、宗人府劝谕遣返。',
    secret:
      '礼部尚书这本，把《祖训》两个字摆出来，是要你看清楚：' +
      '这条法动的是祖制，不是数字。他劝谕遣返，是怕这事闹到太庙去。',
    patience: 2,
    yiEffect: { metric: { chaoshi: -4, minxin: -1 } },
    ignoredEffect: { metric: { chaoshi: -8, guanfeng: -3 }, backlog: 4 },
    options: [
      {
        key: 'arrest',
        label: '拿问为首者，余者押解回籍',
        note: '狠一次，宗室会记一辈子',
        effect: {
          metric: { chaoshi: -6, guanfeng: 2 },
          flags: { zl_arrested: 1 },
          log: '诏拿问宗室为首者十一人，余者押解回籍。太庙前，有宗室哭了一夜。',
        },
      },
      {
        key: 'compensate',
        label: '发银遣返，许其具本陈情',
        note: '花钱买安静，安静只是一时',
        effect: {
          ledger: { taicang: -7 },
          metric: { chaoshi: 5, minxin: 1 },
          flags: { zl_compensated: 1 },
          log: '诏发银七万，遣返宗室，许其具本陈情。他们走了，本子留下了。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 60,
    when: (s) =>
      (on(s, 'zonglu') || on(s, 'xianfeng')) && s.turn >= 18 && s.truth.chaoshi < 50,
  },
)

export const zlUnion = def(
  'zl-union',
  'urgent',
  (s) => ({
    from: '襄王（藩府联名）',
    title: '为宗禄改折、有违祖训、乞赐仍旧事',
    summary: '晋、代、沈、襄四府联名，宗室四百余人署名，请复原额本色。',
    body:
      `臣（襄王）谨奏：宗禄改折之令下，晋、代、沈、襄四府，会同各郡王、将军，` +
      `宗室四百三十七人联名具奏。\n\n` +
      `臣等不敢言朝廷之非，只陈一事：《皇明祖训》有「宗室禄米，永为定制」之条。` +
      `今日折色减半，是改祖训；祖训可改，则天下何事不可改？\n\n` +
      `河南、山西两省，宗室之在州县者，近月多聚于王府门外，言「折色到手，买米不够」。` +
      `有宗室卖马、卖田、卖先人遗物者。臣等不忍看，也不敢瞒。\n\n` +
      `臣等所求，只一事：仍复原额本色。若朝廷不允，臣等不敢再奏，` +
      `只是这四百三十七个名字，臣不敢从纸上抹去。\n\n` +
      `太仓现存银${Math.round(s.taicang)}万。臣等知道朝廷也有难处。伏乞圣裁。`,
    piaoni: '宗室禄米，祖制具在。着礼部、宗人府会议具奏。',
    secret:
      '四府联名，表面是请复原额，底下是给朝廷出难题：' +
      '准了，折色之法就算废了；不准，四百三十七个名字就是天下人的口实。',
    patience: 3,
    yiEffect: { metric: { chaoshi: -3 } },
    ignoredEffect: { metric: { chaoshi: -6, guanfeng: -2 } },
    options: [
      {
        key: 'reject',
        label: '严旨驳斥，首倡者罚禄一年',
        note: '一次压住，宗室记仇',
        effect: {
          ledger: { taicang: 3 },
          metric: { guanfeng: 2, chaoshi: -4 },
          flags: { zl_union_rejected: 1 },
          log: '诏严旨驳斥宗室联名，首倡者罚禄一年。四府的门，此后关得更紧。',
        },
      },
      {
        key: 'conciliate',
        label: '许三府支本色一年，以示宽恤',
        note: '花钱买安静，折色之法就此松了一道口',
        effect: {
          ledger: { taicang: -10 },
          metric: { chaoshi: 5, guanfeng: -1 },
          flags: { zl_union_conciliated: 1 },
          log: '诏许晋、代、沈三府支本色一年。襄王未与，四府之间从此生了嫌隙。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 60,
    when: (s) =>
      (on(s, 'zonglu') || on(s, 'xianfeng')) && s.turn >= 16 && s.truth.chaoshi < 55,
  },
)

export const zlGuards = def(
  'zl-guards',
  'urgent',
  (s) => ({
    from: '河南巡抚',
    title: '为藩府私蓄家丁、置械拒命、乞赐处置事',
    summary: '代府私蓄家丁八百，置盔甲器械，自称「护府」；折银仍一文不纳。',
    body:
      `臣谨奏：代府自折色之令下，闭门不出，私蓄家丁八百。\n\n` +
      `这些家丁，有的是逃军，有的是白莲教的散众，有的是本地的亡命。` +
      `代府给他们饭吃，给他们号衣，教他们射箭。府城四门，都是他们守的。\n\n` +
      `臣遣人问，代府长史答曰：「王府护府，祖制也。」\n\n` +
      `臣查：亲王护卫，国初确有定额，然嘉靖以后尽裁。今日之家丁，` +
      `非护卫，是私兵。河南都司的兵，不敢入府城；臣的令，出不了开封府。\n\n` +
      `折银一事，更不必说：一文未纳。太仓现存银${Math.round(s.taicang)}万。` +
      `伏乞圣裁。`,
    piaoni: '着河南巡抚会同都司，查明具奏，毋得轻动。',
    secret:
      '八百家丁，不全是代府的。里面有一半，是河南几个大族的子弟 ——' +
      '他们不认朝廷的折色，只认王府的庇护。',
    patience: 2,
    yiEffect: { metric: { chaoshi: -3, bianfang: -1 } },
    ignoredEffect: { metric: { chaoshi: -5, bianfang: -2 }, backlog: 3 },
    options: [
      {
        key: 'disarm',
        label: '遣兵勒令解散，长史下狱',
        note: '硬碰硬。府城内外，会死人',
        effect: {
          ledger: { taicang: 5 },
          metric: { chaoshi: -6, minxin: -2, guanfeng: 2 },
          flags: { zl_disarmed: 1 },
          log: '诏遣兵勒令代府解散家丁，长史下狱。府城闭了三日，死者七人。',
        },
      },
      {
        key: 'allow',
        label: '许其留三百护府，折银仍追',
        note: '留一口气给他，也留一个口子',
        effect: {
          ledger: { taicang: -4 },
          metric: { chaoshi: 3, bianfang: -2 },
          flags: { zl_guards_kept: 1 },
          log: '诏许代府留家丁三百护府，折银仍令追解。河南的私兵，从此有了名目。',
        },
      },
    ],
  }),
  {
    weight: 2,
    cooldown: 60,
    when: (s) =>
      (on(s, 'zonglu') || on(s, 'xianfeng')) && s.turn >= 22 && s.truth.chaoshi < 45,
  },
)

export const COURT_TEMPLATES = [zlRefuse, zlPetition, zlUnion, zlGuards]
