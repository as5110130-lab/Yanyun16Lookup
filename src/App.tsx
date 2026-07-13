import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab = 'home' | 'data' | 'builder' | 'faces' | 'music' | 'codes' | 'converter'
type Source = { label: string; url: string }

type FacePreset = {
  name: string
  author: string
  code: string
  imageUrl: string
  style: string[]
  sourceNote: string
  source: Source
}

type FaceSourceStatus = '國際服確認' | '陸服來源未驗證'
type CodeExpiryFilter = 'all' | 'active' | 'expired' | 'uncertain'
type DataStatusFilter = 'all' | 'confirmed' | 'needsReview' | 'missing' | 'scaffold'
type CodeReportTopic = '過期' | '無效' | '其他'

type DataEntry = {
  name: string
  summary: string
  details: string[]
  tags: string[]
  source: Source
}

type DataSection = {
  title: string
  description: string
  items: DataEntry[]
}

type MusicEntry = {
  title: string
  type: string
  useCase: string
  steps: string[]
  tags: string[]
  source: Source
}

type MartialBuild = {
  name: string
  weapons: string
  role: string
  difficulty: string
  gearSet: string[]
  statLines: string[]
  hearts: string[]
  scenes: string[]
  notes: string
  source: Source
}

type RedeemCode = {
  code: string
  date: string
  expiresAt: string
  reward: string
  status: '官方確認' | '社群彙整' | '可能過期' | '已過期'
  source: Source
}

type BuilderGearSelection = {
  set: string
  affixA: string
  affixB: string
  tuning: string
}

type BuilderState = {
  title: string
  buildName: string
  equipmentTier: string
  mainWeapon: string
  mainMartial: string
  subWeapon: string
  subMartial: string
  arsenal: string
  gear: Record<string, BuilderGearSelection>
  mindsets: string[]
  miracles: string[]
  notes: string
}

type SavedBuilderBuild = BuilderState & {
  savedAt: string
}

const today = '2026-07-12'
const codesPerPage = 10
const facesDisplayLimit = 30

const sources = {
  officialFace:
    'https://www.yysls.cn/news/official/20250107/37780_1204881.html',
  officialFix: 'https://www.yysls.cn/news/update/20260529/40412_1302289.html',
  taptapFaces: 'https://www.taptap.cn/moment/626025738641869176',
  taptapFaceCollection: 'https://www.taptap.cn/app/239372/strategy/entity-collection/334588',
  taptapGuide: 'https://www.taptap.cn/moment/625904977906240486',
  taptapMartialIntro: 'https://www.taptap.cn/moment/626549918567236687',
  taptapMartialTop: 'https://www.taptap.cn/moment/667086669794509721',
  taptapWumingBuild: 'https://www.taptap.cn/moment/674703002656834013',
  taptapRiverWestBuild: 'https://www.taptap.cn/moment/679325920175065811',
  taptapBuildRank: 'https://www.taptap.cn/moment/673601594339623758',
  taptapLevel90Build: 'https://www.taptap.cn/moment/682002334955340648',
  taptapQiansiYu: 'https://www.taptap.cn/moment/768961346799667059',
  taptapWukuDingyin: 'https://www.taptap.cn/moment/627244601954009123',
  taptapPozhuYuan: 'https://www.taptap.cn/moment/740927002323717818',
  taptapMartialBalance: 'https://www.taptap.cn/moment/814540768998853198',
  gamersky: 'https://www.gamersky.com/handbook/202601/2073807.shtml',
  threeDm: 'https://www.3dmgame.com/gl/3976209.html',
  game8GearSets: 'https://game8.co/games/Where-Winds-Meet/archives/572267',
  officialGearUpdate:
    'https://www.wherewindsmeetgame.com/hmt/news/official/430update.html',
  game8MysticSkills: 'https://game8.co/games/Where-Winds-Meet/archives/564723',
  oslinkMysticGuide: 'https://www.oslink.io/tw/blog/guide/where-winds-meet-mystic-arts-guide.html',
  epicMysticGuide:
    'https://store.epicgames.com/news/where-winds-meet-guide-the-best-mystic-arts-to-unlock-first?lang=zh-CN',
  blueStacks:
    'https://www.bluestacks.com/tw/blog/game-guides/where-winds-meet/where-winds-meet-redeem-codes-tw.html',
  officialCodes:
    'https://www.wherewindsmeetgame.com/hmt/news/official/20260503/42816_1298978.html',
  bahaCodes: 'https://forum.gamer.com.tw/C.php?bsn=75703&snA=388',
  facebookGlobalCodes:
    'https://www.facebook.com/groups/yylsmy/posts/1157095823289922/',
  facebookDevlog:
    'https://www.facebook.com/groups/1003523911198623/posts/1425771832307160/',
  facebookWwmDevTalk:
    'https://www.facebook.com/groups/7098866083478326/posts/25768208926117426/',
  facebookWwmBind:
    'https://www.facebook.com/61585429144951/posts/new-redeem-codewwmbind01pic-for-attention-%EF%B8%8Fwherewindsmeet-wwm/122121750387180971/',
  facebookPalace:
    'https://www.facebook.com/groups/1031152431953437/posts/1563044495430892/',
  githubExpiredReport:
    'https://github.com/as5110130-lab/Yanyun16Lookup/issues/new',
  arlenCodes: 'https://www.arlenfuture.com/games/where-winds-meet-codes/',
  wwmPresets: 'https://wwmpresets.com/',
  steamPresetBot: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3625052726',
  bahaFaceConvert: 'https://forum.gamer.com.tw/C.php?bsn=75703&snA=7049',
  youtubeFaceConvert: 'https://www.youtube.com/watch?v=vN0q2GhsF2s',
  wwmWorkshopDiscord: 'https://discord.com/servers/wwm-workshop-1444832179061391542',
  youtubeJulyCodes: 'https://www.youtube.com/post/UgkxDtv_rgo58IPJSaOVp0nYQKHF_co1Fy5Y',
  musicGuide: 'https://news.17173.com/content/11022025/192549381.shtml',
  musicForum: 'https://forum.gamer.com.tw/C.php?bsn=75703&snA=6014',
}

const createMindsetEntry = (
  name: string,
  details: string[] = [
    '定位：待補',
    '適用流派：待補',
    '第一重：待補',
    '第二重：待補',
    '第三重：待補',
    '第四重：待補',
    '第五重：待補',
    '第六重：待補',
    '取得方式：待補',
  ],
  source: Source = { label: '國際服資料待補', url: sources.officialFace },
): DataEntry => ({
  name,
  summary: '心法資料項目，供配置編輯器心法槽選擇。',
  details,
  tags: ['心法', 'PVE', details.some((detail) => detail.includes('待補')) ? '待補詳細重數' : '國際服參考'],
  source,
})

const equipmentTierLevels = ['41', '51', '56', '61', '71', '81', '86', '91', '96', '100']
const equipmentSlots = ['武器 1', '武器 2', '冠', '衣', '腕', '帶', '褲', '鞋', '環', '佩']

const slotAffixProfiles: Record<
  string,
  {
    fixed: string[]
    recommended: string[]
    situational: string[]
    note: string
  }
> = {
  '武器 1': {
    fixed: ['武器增傷'],
    recommended: ['外功攻擊', '最小外功攻擊', '最大外功攻擊', '會意率', '會意傷害', '鳴金攻擊', '牽絲攻擊', '破竹攻擊', '裂石攻擊'],
    situational: ['治療效果'],
    note: '公開攻略明確提到武器會出武器增傷；PVE 依主要流派補外功、會意與屬性攻擊。',
  },
  '武器 2': {
    fixed: ['武器增傷'],
    recommended: ['外功攻擊', '最小外功攻擊', '最大外功攻擊', '會意率', '會意傷害', '鳴金攻擊', '牽絲攻擊', '破竹攻擊', '裂石攻擊'],
    situational: ['治療效果'],
    note: '副武器同樣可追武器增傷；若作治療或輔助配置，可人工核對治療相關詞綴。',
  },
  冠: {
    fixed: [],
    recommended: ['外功穿透', '外功攻擊', '會意率'],
    situational: ['氣血', '減傷', '外功抗性'],
    note: '防具部位詳細初始詞條池待核對；PVE 輸出先以穿透與攻擊向詞綴作為查詢選項。',
  },
  衣: {
    fixed: [],
    recommended: ['外功攻擊', '會意率', '會意傷害'],
    situational: ['氣血', '減傷', '外功抗性'],
    note: '防具部位詳細初始詞條池待核對；生存壓力高時再考慮防禦性詞綴。',
  },
  腕: {
    fixed: ['首領增傷'],
    recommended: ['外功攻擊', '會意率', '會意傷害', '外功穿透'],
    situational: ['氣血', '減傷'],
    note: '公開攻略明確提到護腕會出首領增傷；PVE 副本優先度高。',
  },
  帶: {
    fixed: [],
    recommended: ['外功攻擊', '會意率', '治療效果'],
    situational: ['氣血', '減傷', '外功抗性'],
    note: '帶目前保留獨立槽位；可出詞綴仍待遊戲內核對，先提供輸出、治療與生存候選。',
  },
  褲: {
    fixed: ['首領增傷'],
    recommended: ['外功攻擊', '會意率', '會意傷害'],
    situational: ['氣血', '減傷'],
    note: '公開攻略明確提到護腿會出首領增傷；PVE 副本優先度高。',
  },
  鞋: {
    fixed: [],
    recommended: ['外功攻擊', '會意率', '外功穿透'],
    situational: ['氣血', '減傷', '外功抗性'],
    note: '鞋部位詳細詞條池待核對；先保留輸出與生存兩類候選。',
  },
  環: {
    fixed: ['全武學增傷'],
    recommended: ['外功攻擊', '最小外功攻擊', '最大外功攻擊', '會意率', '會意傷害'],
    situational: ['治療效果', '氣血'],
    note: '公開攻略明確提到環會出全武學增傷；輸出配置優先度高。',
  },
  佩: {
    fixed: ['全武學增傷'],
    recommended: ['外功攻擊', '最小外功攻擊', '最大外功攻擊', '會意率', '會意傷害'],
    situational: ['治療效果', '氣血'],
    note: '公開攻略明確提到佩會出全武學增傷；輸出配置優先度高。',
  },
}

const getSlotAffixes = (slot: string) => {
  const profile = slotAffixProfiles[slot]

  if (!profile) {
    return []
  }

  return Array.from(new Set([...profile.fixed, ...profile.recommended, ...profile.situational]))
}

const pveTuningEntries: DataEntry[] = [
  {
    name: '外攻穿透',
    summary: 'PVE 通用定音屬性，提升外功傷害穿透表現。',
    details: [
      '類型：通用定音',
      '適用部位：攻具定音庫 / 通用定音方向',
      'PVE 用途：提高外功傷害對目標防禦的穿透表現',
      '適用流派：泛用輸出，尤其依賴外功倍率的武學',
      '優先度：高',
      '備註：與角色外功攻擊、武學倍率、增傷等共同影響最終傷害',
      '資料狀態：PVE 方向已確認，精確數值範圍待人工核對',
    ],
    tags: ['定音', 'PVE', '通用定音', '外攻穿透', '輸出', '已確認'],
    source: { label: '17173：裝備系統定音介紹', url: 'https://news.17173.com/content/01122026/120503399.shtml' },
  },
  {
    name: '無相穿透',
    summary: 'PVE 通用定音屬性，可依目前使用武學切換對應屬性穿透。',
    details: [
      '類型：通用定音',
      '適用部位：91 階攻具定音庫 / 通用定音方向',
      'PVE 用途：依目前使用武學定向提升相符屬性穿透',
      '適用流派：鳴金、裂石、牽絲、破竹等多武學切換配置',
      '優先度：高',
      '備註：官方公告提到 91 階攻具定音庫移除原各流派穿透並新增無相穿透',
      '資料狀態：官方公告確認，精確數值範圍待人工核對',
    ],
    tags: ['定音', 'PVE', '通用定音', '無相穿透', '輸出', '官方確認'],
    source: { label: '官方：4月30日裝備培養優化', url: sources.officialGearUpdate },
  },
  {
    name: '外攻抗性',
    summary: 'PVE 通用定音屬性，偏生存與承傷，輸出配置通常不是優先選項。',
    details: [
      '類型：通用定音',
      '適用部位：攻具定音庫 / 通用定音方向',
      'PVE 用途：提高外功抗性，降低受到外功傷害壓力',
      '適用流派：坦向、生存過渡、拓荒容錯配置',
      '優先度：中低，輸出配置通常先追穿透或武學增傷',
      '備註：PVE 輸出攻略通常更重視輸出詞條，生存詞條視副本壓力選用',
      '資料狀態：PVE 方向已確認，精確數值範圍待人工核對',
    ],
    tags: ['定音', 'PVE', '通用定音', '外攻抗性', '生存', '待人工核對'],
    source: { label: '17173：裝備系統定音介紹', url: 'https://news.17173.com/content/01122026/120503399.shtml' },
  },
  {
    name: '武學技增傷',
    summary: 'PVE 流派定音屬性，提升指定武學的武學技傷害。',
    details: [
      '類型：流派定音',
      '適用部位：流派定音方向',
      'PVE 用途：提升指定武學的武學技傷害',
      '適用流派：以武學技作主要傷害來源的配置',
      '命名格式：武學名稱 · 武學技增傷',
      '優先度：依流派核心技能占比判斷',
      '資料狀態：PVE 方向已確認，需依武學逐筆核對實際名稱與數值',
    ],
    tags: ['定音', 'PVE', '流派定音', '武學技增傷', '輸出', '待人工核對'],
    source: { label: '17173：裝備系統定音介紹', url: 'https://news.17173.com/content/01122026/120503399.shtml' },
  },
  {
    name: '蓄力技增傷',
    summary: 'PVE 流派定音屬性，提升指定武學的蓄力技傷害。',
    details: [
      '類型：流派定音',
      '適用部位：流派定音方向',
      'PVE 用途：提升指定武學的蓄力技傷害',
      '適用流派：無名劍法、多段蓄力、核心輸出依賴蓄力的配置',
      '命名格式：武學名稱 · 蓄力技增傷',
      '優先度：蓄力占比越高，優先度越高',
      '資料狀態：PVE 方向已確認，需依武學逐筆核對實際名稱與數值',
    ],
    tags: ['定音', 'PVE', '流派定音', '蓄力技增傷', '輸出', '待人工核對'],
    source: { label: '17173：裝備系統定音介紹', url: 'https://news.17173.com/content/01122026/120503399.shtml' },
  },
  {
    name: '特殊技增傷',
    summary: 'PVE 流派定音屬性，提升指定武學的特殊技傷害。',
    details: [
      '類型：流派定音',
      '適用部位：流派定音方向',
      'PVE 用途：提升指定武學的特殊技傷害',
      '適用流派：核心循環依賴特殊技爆發或特殊技觸發效果的配置',
      '命名格式：武學名稱 · 特殊技增傷',
      '優先度：依武學循環與傷害占比判斷',
      '資料狀態：PVE 方向已確認，需依武學逐筆核對實際名稱與數值',
    ],
    tags: ['定音', 'PVE', '流派定音', '特殊技增傷', '輸出', '待人工核對'],
    source: { label: '17173：裝備系統定音介紹', url: 'https://news.17173.com/content/01122026/120503399.shtml' },
  },
]

const createEquipmentTierEntry = (level: string): DataEntry => {
  const isTuningOpen = Number(level) >= 41
  const isAttuningOpen = Number(level) >= 51
  const isMelodyTier = ['91', '96', '100'].includes(level)
  const isKnownFutureTier = ['96', '100'].includes(level)

  return {
    name: `${level} 階裝備`,
    summary: `${level} 階武器、防具與飾品資料架構，精確基礎數值與詞綴上限待人工補正。`,
    details: [
      `等階：${level}`,
      '可用部位：武器 1、武器 2、冠、衣、腕、帶、褲、鞋、環、佩',
      '攻擊套裝部位：武器 1、武器 2、環、佩',
      '防禦套裝部位：冠、衣、腕、褲、鞋',
      '特殊部位：帶目前保留為獨立槽位，套裝與詞綴限制待人工核對',
      '武器基礎屬性：待補各武器類型基礎外功攻擊與造詣值',
      '防具基礎屬性：待補冠、衣、腕、褲、鞋外功防禦、氣血與造詣值',
      '飾品基礎屬性：待補環、佩基礎屬性與造詣值',
      '可出詞綴：待補各部位詞綴池',
      '詞綴數值範圍：待補藍 / 紫 / 金品質數值下限與上限',
      `調律：${isTuningOpen ? '可作為調律資料整理等階，實際開放與材料以遊戲內為準' : '待確認是否開放'}`,
      `定音：${isAttuningOpen ? '可作為定音資料整理等階，通用定音與流派定音限制待補' : '待確認是否開放'}`,
      `承音：${isMelodyTier ? '可納入承音 / 傳律資料核對範圍' : '未標記為承音核心等階'}`,
      `傳律：${isMelodyTier ? '待補傳律消耗、詞條符合度與提升上限' : '待確認是否適用'}`,
      `資料狀態：${isKnownFutureTier ? '高階 / 後續版本資料待人工核對' : '架構已建立，數值待補'}`,
    ],
    tags: [
      '裝備等階',
      `${level}階`,
      '武器',
      '防具',
      '飾品',
      isMelodyTier ? '承音 / 傳律' : '調律 / 定音',
      isKnownFutureTier ? '待人工核對' : '待補數值',
    ],
    source: { label: '官方裝備培養優化公告', url: sources.officialGearUpdate },
  }
}

const createSlotAffixEntry = (slot: string): DataEntry => {
  const profile = slotAffixProfiles[slot]
  const fixed = profile?.fixed ?? []
  const recommended = profile?.recommended ?? []
  const situational = profile?.situational ?? []
  const affixes = getSlotAffixes(slot)

  return {
    name: slot,
    summary: `${slot} 可選詞綴池，供配置編輯器依部位過濾詞綴。`,
    details: [
      `部位：${slot}`,
      `核心限定詞綴：${fixed.join('、') || '未確認限定詞綴'}`,
      `PVE 推薦詞綴：${recommended.join('、') || '待補'}`,
      `情境 / 過渡詞綴：${situational.join('、') || '待補'}`,
      `可選詞綴：${affixes.join('、') || '待補'}`,
      `詞綴數值範圍：待補各等階與品質數值`,
      `限制說明：${profile?.note ?? '目前先依 PVE 常見詞條方向建立，實際可出詞綴需以遊戲內為準'}`,
      '資料狀態：部位限定規則已有公開攻略參考，完整詞條池與數值仍待人工核對',
    ],
    tags: [
      '部位詞綴限制',
      slot,
      fixed.length > 0 ? '已確認部位限定' : '待人工核對',
      ...affixes,
    ],
    source: { label: '游俠網：裝備系統特點介紹', url: 'https://gl.ali213.net/html/2026-1/1735655.html' },
  }
}

const buildDataSections: DataSection[] = [
  {
    title: '武器資料',
    description: '配置編輯器的主副武器選項。武器下方列出目前已知會用到的武學，後續可逐步補完整武學清單。',
    items: [
      {
        name: '劍',
        summary: '近戰武器類型，常見於鳴金輸出流派。',
        details: ['可用武學：無名劍法', '可用武學：積矩九劍', '資料狀態：待補完整劍系武學清單'],
        tags: ['武器', '劍', '鳴金'],
        source: { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
      },
      {
        name: '槍',
        summary: '近戰武器類型，可與劍系武學組成鳴金輸出配置。',
        details: ['可用武學：無名槍法', '可用武學：九曲驚神槍', '可用武學：八方風雷槍', '資料狀態：待補完整槍系武學清單'],
        tags: ['武器', '槍', '鳴金', '裂石'],
        source: { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
      },
      {
        name: '陌刀',
        summary: '近戰武器類型，目前已知可使用十方破陣與嗟夫刀法。',
        details: ['可用武學：十方破陣', '可用武學：嗟夫刀法', '資料狀態：待補完整陌刀武學細節'],
        tags: ['武器', '陌刀', '裂石'],
        source: { label: 'TapTap：七種武器首次匯集', url: 'https://www.taptap.cn/moment/555836967758073508' },
      },
      {
        name: '傘',
        summary: '武器類型，目前已知可使用九重春色、千香引魂蠱與醉夢遊春。',
        details: ['可用武學：九重春色', '可用武學：千香引魂蠱', '可用武學：醉夢遊春', '資料狀態：待補完整傘系武學細節'],
        tags: ['武器', '傘', '牽絲'],
        source: { label: 'TapTap：牽絲玉萌新建議', url: sources.taptapQiansiYu },
      },
      {
        name: '扇',
        summary: '武器類型，目前已知牽絲玉與牽絲霖會使用。',
        details: ['可用武學：青山執筆', '可用武學：明川藥典', '資料狀態：待補完整扇系武學清單'],
        tags: ['武器', '扇', '牽絲', '治療'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
      {
        name: '繩鏢',
        summary: '武器類型，目前已知可使用粟子行雲與粟子遊塵。',
        details: ['可用武學：粟子行雲', '可用武學：粟子遊塵', '資料狀態：待補完整繩鏢武學細節'],
        tags: ['武器', '繩鏢', '破竹'],
        source: { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
      },
      {
        name: '唐刀',
        summary: '近戰武器類型，目前已知可使用斬雪刀法。',
        details: ['可用武學：斬雪刀法', '資料狀態：目前僅收錄已知唐刀武學'],
        tags: ['武器', '唐刀'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
      {
        name: '拳甲',
        summary: '手甲 / 拳甲武器類型，破竹鳶 PVE 輸出會用到。',
        details: ['可用武學：天志垂象', '資料狀態：待補完整拳甲武學清單'],
        tags: ['武器', '拳甲', '手甲', '破竹'],
        source: { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
      },
    ],
  },
  {
    title: '裝備部位',
    description: '配置編輯器會依這些部位讓玩家選套裝、詞綴與定音。',
    items: equipmentSlots.map((slot) => ({
      name: slot,
      summary: '配置裝備槽位。',
      details: ['可選：裝備套裝', '可選：主詞綴 / 副詞綴', '可選：定音', '資料狀態：部位可出詞綴待補完整表'],
      tags: ['裝備部位', slot.includes('武器') ? '武器' : '防具 / 飾品'],
      source: { label: '游俠網：裝備系統特點介紹', url: 'https://gl.ali213.net/html/2026-1/1735655.html' },
    })),
  },
  {
    title: '裝備套裝',
    description: '依國際服資料先整理攻擊套裝與防禦套裝；攻擊套裝對應武器與飾品，防禦套裝對應冠、衣、腕、褲、鞋。',
    items: [
      {
        name: '玉斗',
        summary: '攻擊套裝，偏會意傷害與武學技爆發。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：最大外功攻擊提升', '四件效果：施放武學技後啟動玉斗效果，提升會意傷害；若目標處於控制狀態或真氣低於 40%，會意傷害再提高，效果有觸發間隔', '適用方向：無名系、需要武學技爆發的輸出配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '會意傷害'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '飛隼',
        summary: '攻擊套裝，偏高頻會意後疊加外功攻擊。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：會意率提升', '四件效果：任意傷害觸發會意時獲得飛隼效果，外功攻擊提升，可疊加多層', '適用方向：高段數、高會意率輸出配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '會意率', '外功攻擊'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '燕歸',
        summary: '攻擊套裝，偏輕擊與低真氣目標增傷。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：最小外功攻擊提升', '四件效果：輕擊對真氣低於 40% 的目標造成更高傷害；對氣竭目標另有增傷', '適用方向：輕擊佔比較高、能快速壓低真氣或打氣竭的配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '輕擊', '氣竭'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '漣魚',
        summary: '攻擊套裝，偏會心傷害、會心治療與護盾加成。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：氣血最大值提升', '四件效果：會心傷害與會心治療提升；身上有氣血護盾時效果再提高', '適用方向：有護盾覆蓋的輸出或治療配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '治療', '護盾'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '疾風',
        summary: '攻擊套裝，偏空中重擊與擊倒效果。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：最大外功攻擊提升', '四件效果：空中重擊傷害提升，並可造成擊倒效果；擊倒有觸發間隔', '適用方向：常使用空中重擊或需要擊倒控制的配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '空中重擊', '控制'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '岳山傾',
        summary: '攻擊套裝，偏對高血量目標增傷。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：最小外功攻擊提升', '四件效果：對氣血高於 50% 的目標造成更高傷害，目標氣血越高加成越高', '適用方向：開場爆發、首領高血量階段輸出'],
        tags: ['套裝', '攻擊套裝', '輸出', '首領', '開場爆發'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '撼天',
        summary: '攻擊套裝，偏輕重攻擊互相增幅。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：精準率提升', '四件效果：輕擊或空中輕擊後提升重擊或空中重擊傷害；重擊或空中重擊後也會強化後續輕擊或蓄力攻擊', '適用方向：輕重攻擊交替循環的配置'],
        tags: ['套裝', '攻擊套裝', '輸出', '精準', '輕重攻擊'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '杏林',
        summary: '攻擊套裝，偏滿血時的會心傷害與會心治療。',
        details: ['類型：攻擊套裝', '可裝部位：武器 1、武器 2、環、佩', '二件效果：會心率提升', '四件效果：氣血全滿時，提高造成會心傷害與會心治療的機率，並提升會心傷害與會心治療效果', '適用方向：治療、遠程安全輸出或能穩定維持滿血的配置'],
        tags: ['套裝', '攻擊套裝', '治療', '會心率', '會心治療'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '鐵衣',
        summary: '防禦套裝，偏護盾延長與承傷減免。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：外功防禦提升', '四件效果：護盾持續時間延長；真氣較高或擁有真氣傷害免疫護盾時，受到的氣血傷害降低', '適用方向：護盾流、坦向或需要抗壓的配置'],
        tags: ['套裝', '防禦套裝', '護盾', '減傷', '坦'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '靜水',
        summary: '防禦套裝，偏完美閃避後回血與耐力回復。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：外功防禦提升', '四件效果：完美閃避敵人攻擊時，有機率回復氣血與耐力', '適用方向：需要閃避循環、耐力續航或單人容錯的配置'],
        tags: ['套裝', '防禦套裝', '閃避', '回復', '耐力'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '時雨',
        summary: '防禦套裝，偏持續傷害或治療後疊加減傷。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：外功防禦提升', '四件效果：造成持續傷害或治療時獲得時雨層數，降低受到傷害；滿層後獲得一次高額單次傷害減免，首領傷害減免效果折半', '適用方向：持續傷害、治療、坦向或需要穩定減傷的配置'],
        tags: ['套裝', '防禦套裝', '減傷', '治療', '持續傷害'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '連星',
        summary: '防禦套裝，偏防禦中攻擊觸發護盾與回血。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：氣血最大值提升', '四件效果：防禦中攻擊時有機率產生吸收傷害的護盾；若已存在護盾則額外回復氣血', '適用方向：防禦反擊、坦向或需要護盾續航的配置'],
        tags: ['套裝', '防禦套裝', '護盾', '回血', '坦'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '輕步',
        summary: '防禦套裝，偏卸勢成功後短時間減傷。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：氣血最大值提升', '四件效果：成功卸勢後，短時間內降低受到的所有傷害，效果可疊加', '適用方向：熟悉首領節奏、常用卸勢的配置'],
        tags: ['套裝', '防禦套裝', '卸勢', '減傷'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '無瑕',
        summary: '防禦套裝，偏低血量時額外減傷。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：外功防禦提升', '四件效果：常駐降低受到傷害；氣血低於 60% 後，每損失一定比例氣血會再獲得額外減傷，可疊加', '適用方向：坦向、低血容錯或高壓副本配置'],
        tags: ['套裝', '防禦套裝', '減傷', '低血量', '坦'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '不知寒',
        summary: '防禦套裝，偏入戰後未受傷累積下一次傷害減免。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：氣血最大值提升', '四件效果：進入戰鬥後若一段時間未受到傷害，獲得不知寒效果，降低下一次受到傷害與其後短時間內的傷害；離開戰鬥後移除', '適用方向：遠程輸出、治療或需要預防大傷害的配置'],
        tags: ['套裝', '防禦套裝', '減傷', '遠程', '容錯'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
      {
        name: '雪舞',
        summary: '防禦套裝，偏承受大傷害後強化下一次治療。',
        details: ['類型：防禦套裝', '可裝部位：冠、衣、腕、褲、鞋', '二件效果：外功防禦提升', '四件效果：單次承受大量傷害或氣血跌到低位時，短時間內下一次受到治療會額外回復氣血，效果有觸發間隔', '適用方向：治療隊友、坦向或首領大傷害容錯配置'],
        tags: ['套裝', '防禦套裝', '治療', '回血', '容錯'],
        source: { label: '國際服裝備套裝清單', url: sources.game8GearSets },
      },
    ],
  },
  {
    title: '裝備等階',
    description: '建立各等階武器、裝備、飾品的資料表架構；目前先整理可補欄位與版本機制，精確數值後續人工補正。',
    items: equipmentTierLevels.map(createEquipmentTierEntry),
  },
  {
    title: '部位詞綴限制',
    description: '依裝備部位建立可選詞綴池，供配置編輯器過濾詞綴；實際詞綴與數值待人工核對。',
    items: equipmentSlots.map(createSlotAffixEntry),
  },
  {
    title: '詞綴資料',
    description: '先建立可選詞綴池，之後再補各部位可出限制。',
    items: [
      '外功攻擊',
      '武器增傷',
      '最小外功攻擊',
      '最大外功攻擊',
      '會意率',
      '會意傷害',
      '全武學增傷',
      '首領增傷',
      '鳴金攻擊',
      '牽絲攻擊',
      '破竹攻擊',
      '裂石攻擊',
      '治療效果',
      '氣血',
      '減傷',
      '外功穿透',
      '外功抗性',
      '無相穿透',
    ].map((name) => ({
      name,
      summary: '配置編輯器詞綴選項。',
      details: ['PVE 取向：依流派與部位篩選', '資料狀態：待補各部位可出限制與數值上限'],
      tags: ['詞綴', name.includes('治療') ? '治療' : name.includes('氣血') || name.includes('減傷') || name.includes('抗性') ? '生存' : '輸出'],
      source: { label: '游俠網：裝備系統特點介紹', url: 'https://gl.ali213.net/html/2026-1/1735655.html' },
    })),
  },
  {
    title: '定音資料',
    description: '先整理 PVE 用定音屬性，分成通用定音與流派定音；PVP 定音暫不收錄。',
    items: pveTuningEntries,
  },
  {
    title: '心法資料',
    description: '先收錄目前 PVE 流派卡片用到的心法。網站只顯示中文名稱；詳細一到六重效果會優先補國際服資料，找不到再標註陸服來源。',
    items: [
      createMindsetEntry(
        '易水歌',
        [
          '定位：通用輸出 / 治療增益',
          '適用流派：泛用，PVE 可作過渡或通用心法',
          '基礎效果：攻擊或治療時有機率獲得易水效果，提升傷害與治療，最多疊加 5 層',
          '第一重：每層易水可額外提升自身 2 點外攻穿透',
          '第二重：外功攻擊提升，效果隨單人模式等級提升',
          '第三重：目標處於控制狀態時，易水加倍；每層提升 2% 傷害和治療，同時單次可添加層數加倍為兩層',
          '第四重：易水附加機率提升至 100%，持續時間延長至 12 秒',
          '第五重：直接會心率提升 4.6%',
          '第六重：易水達到滿層後，造成傷害時可額外造成 1 次附加傷害；若目標處於控制狀態則可額外造成共計 2 次附加傷害，造成治療同理，此效果每 10 秒只能生效一次',
          '取得方式：待補國際服中文路徑',
        ],
        { label: '國際服社群：易水歌重數整理', url: 'https://www.reddit.com/r/WhereWindsMeet/comments/1p0v41g/why_morale_chant/' },
      ),
      createMindsetEntry(
        '無名心法',
        [
          '定位：無名劍 / 無名槍核心輸出心法',
          '適用流派：鳴金虹、鳴金影',
          '基礎效果：強化無名系武學的蓄力、劍氣或槍法循環表現',
          '第一重：在未進入戰鬥狀態及特殊技退亦有方劍氣釋放的 5 秒內，無須真氣護盾存續即可蓄力發射多道劍氣',
          '第二重：最大外攻攻擊提升，效果隨單人模式等級提升',
          '第三重：多道劍氣命中氣竭單位時必定不會擦傷；若目標是氣竭非玩家單位，則多道劍氣的第三道劍氣必定會意',
          '第四重：蓄力技多道劍氣釋放後的 5 秒內，蓄力可以繼續發射多道劍氣',
          '第五重：直接會意率提升 2.3%',
          '第六重：發射多道劍氣後，會獲得氣湧效果：立即回復 20 點耐力值，5 秒內無須蓄力即可再釋放一次多道劍氣，同時移除氣湧效果。氣湧效果的初始觸發間隔為 20 秒，再每道劍氣首次命中首領單位時間間隔減少 1 秒，每次間隔最多可減少 8 秒',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
      ),
      createMindsetEntry(
        '千山法',
        [
          '定位：無名系輸出增益心法',
          '適用流派：鳴金虹、鳴金影',
          '基礎效果：作為無名劍槍 PVE 常用增傷心法，偏向提升輸出循環穩定度',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
      ),
      createMindsetEntry(
        '威猛歌',
        [
          '定位：通用輸出增益心法',
          '適用流派：鳴金系 PVE，亦可作輸出過渡心法',
          '基礎效果：偏向提高輸出能力，常與無名心法、千山法、易水歌搭配',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
      ),
      createMindsetEntry(
        '劍氣縱橫',
        [
          '定位：劍系輸出心法',
          '適用流派：鳴金影、劍系 PVE',
          '基礎效果：偏向強化劍系武學或劍氣相關輸出',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：燕雲河西最強流派推薦', url: sources.taptapRiverWestBuild },
      ),
      createMindsetEntry(
        '逐狼心經',
        [
          '定位：輸出增益心法',
          '適用流派：鳴金影、連段輸出配置',
          '基礎效果：偏向提高連段或追擊型輸出表現',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：燕雲河西最強流派推薦', url: sources.taptapRiverWestBuild },
      ),
      createMindsetEntry(
        '凝神章',
        [
          '定位：輸出穩定 / 循環輔助心法',
          '適用流派：鳴金影、需要穩定輸出節奏的 PVE 配置',
          '基礎效果：偏向提升連段循環或輸出穩定度',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：燕雲河西最強流派推薦', url: sources.taptapRiverWestBuild },
      ),
      createMindsetEntry(
        '困獸心經',
        [
          '定位：坦向 / 抗壓心法',
          '適用流派：裂石威',
          '基礎效果：偏向承傷、反擊或低血量抗壓方向',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '抗造大法',
        [
          '定位：坦向生存心法',
          '適用流派：裂石威、副本抗壓配置',
          '基礎效果：偏向提升承傷、生存或容錯能力',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '磐石決',
        [
          '定位：防禦 / 護盾心法',
          '適用流派：裂石威、坦位備選',
          '基礎效果：偏向提升防禦、護盾或硬直抗性表現',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '山河絕韻',
        [
          '定位：裂石 / 防禦輔助心法',
          '適用流派：裂石威',
          '基礎效果：偏向裂石流派的生存或副本抗壓加成',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '花下月令',
        [
          '定位：牽絲輸出心法',
          '適用流派：牽絲玉',
          '基礎效果：偏向提升牽絲玉遠程輸出或核心技能傷害',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：牽絲玉萌新建議', url: sources.taptapQiansiYu },
      ),
      createMindsetEntry(
        '征人歸',
        [
          '定位：輸出增益心法',
          '適用流派：牽絲玉、部分輸出流派高重數備選',
          '基礎效果：常作高重數後的輸出替換選項',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：牽絲玉萌新建議', url: sources.taptapQiansiYu },
      ),
      createMindsetEntry(
        '縱地摘星',
        [
          '定位：牽絲輸出 / 機動輔助心法',
          '適用流派：牽絲玉',
          '基礎效果：偏向提升遠程輸出節奏或機動輸出表現',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：牽絲玉萌新建議', url: sources.taptapQiansiYu },
      ),
      createMindsetEntry(
        '君臣藥',
        [
          '定位：治療核心心法',
          '適用流派：牽絲霖、團隊治療',
          '基礎效果：偏向提升治療量、治療循環或團隊支援能力',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '杏花不見',
        [
          '定位：治療 / 團隊支援心法',
          '適用流派：牽絲霖',
          '基礎效果：偏向提升治療、續航或團隊容錯',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '指玄篇注',
        [
          '定位：治療 / 支援輔助心法',
          '適用流派：牽絲霖',
          '基礎效果：偏向補足治療循環或團隊支援效果',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '牽絲蠱',
        [
          '定位：牽絲治療 / 支援心法',
          '適用流派：牽絲霖',
          '基礎效果：偏向牽絲系治療或蠱系支援效果',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      ),
      createMindsetEntry(
        '忘川絕響',
        [
          '定位：破竹輸出心法',
          '適用流派：破竹風',
          '基礎效果：偏向提升破竹系爆發或核心技能傷害',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：新版本流派強度排名', url: sources.taptapBuildRank },
      ),
      createMindsetEntry(
        '心彌泥魚',
        [
          '定位：破竹輸出 / 爆發輔助心法',
          '適用流派：破竹風',
          '基礎效果：偏向補強破竹風爆發循環',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：新版本流派強度排名', url: sources.taptapBuildRank },
      ),
      createMindsetEntry(
        '極樂泣血',
        [
          '定位：高風險輸出心法',
          '適用流派：破竹風、爆發輸出配置',
          '基礎效果：名稱與配置方向偏向犧牲或換取更高爆發，實際機制待核對',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：新版本流派強度排名', url: sources.taptapBuildRank },
      ),
      createMindsetEntry(
        '扶搖直上',
        [
          '定位：破竹鳶輸出心法',
          '適用流派：破竹鳶',
          '基礎效果：偏向提升手甲 / 破竹輸出循環',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
      ),
      createMindsetEntry(
        '擒天勢',
        [
          '定位：破竹鳶輸出增益心法',
          '適用流派：破竹鳶',
          '基礎效果：偏向提升手甲核心技能、控制或爆發窗口輸出',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
      ),
      createMindsetEntry(
        '三窮致知',
        [
          '定位：破竹鳶輸出 / 循環輔助心法',
          '適用流派：破竹鳶',
          '基礎效果：偏向補強破竹鳶輸出循環或技能銜接',
          '第一重：待人工核對',
          '第二重：待人工核對',
          '第三重：待人工核對',
          '第四重：待人工核對',
          '第五重：待人工核對',
          '第六重：待人工核對',
          '取得方式：待補國際服中文路徑',
        ],
        { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
      ),
    ],
  },
  {
    title: '奇術資料',
    description: '整理常用奇術的定位、核心效果與取得方向，供資料查詢與配置編輯器選擇。',
    items: [
      {
        name: '獅吼正聲',
        summary: '範圍輸出與減傷型奇術，適合清怪與承壓時補傷害。',
        details: [
          '分類：攻擊型',
          '用途：範圍輸出 / 承傷',
          '核心效果：敲鐘造成範圍傷害，後續吼聲可多段命中，並提供減傷與霸體類效果。',
          'PVE 建議：可作為群怪或高壓環境的補傷害選項。',
          '取得方式：清河區域敲響四口大鐘後取得。',
        ],
        tags: ['奇術', '攻擊型', '範圍', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '金蟾騰躍',
        summary: '多段位移打擊與蟾毒效果，偏輸出與控制銜接。',
        details: [
          '分類：攻擊型',
          '用途：補循環 / 擊退 / 毒傷',
          '核心效果：後翻擊退後突進攻擊，可連續施放並疊加蟾毒，第三段轉為範圍砸擊。',
          'PVE 建議：適合需要短位移與補段數的場合。',
          '取得方式：將軍祠附近觀察跳蟾者與蟾蜍，完成偷師類小遊戲取得。',
        ],
        tags: ['奇術', '攻擊型', '位移', '毒傷'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '百鬼打穴手',
        summary: '群體定身與破真氣點控制奇術。',
        details: [
          '分類：攻擊型 / 控制型',
          '用途：群控 / 破點',
          '核心效果：可閃至敵人面前，對多個目標造成定身與傷害，並可破壞真氣要害；強敵與玩家有抗性限制。',
          'PVE 建議：適合小怪控場與需要短暫打斷的場合。',
          '取得方式：開封荒棄區屋內觸發相關對話與任務後取得。',
        ],
        tags: ['奇術', '控制型', '定身', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '韋陀正法',
        summary: '空中下砸與範圍掌擊奇術。',
        details: [
          '分類：攻擊型',
          '用途：範圍輸出 / 擊退',
          '核心效果：向地面重擊造成範圍傷害；從一定高度施放時會轉為更強的下墜掌擊並擊退目標。',
          'PVE 建議：可搭配位移或跳躍類奇術使用，處理聚怪時較好發揮。',
          '取得方式：千佛谷相關支線完成後取得。',
        ],
        tags: ['奇術', '攻擊型', '範圍', '擊退'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '流星墜火',
        summary: '範圍爆發型奇術，偏 PVE 清怪與爆發。',
        details: [
          '分類：攻擊型',
          '用途：群怪爆發 / 高壓清場',
          '核心效果：向前衝鋒後躍起投擲火焰長槍，再墜地造成範圍傷害，施放中提供減傷與霸體類效果。',
          'PVE 建議：適合副本群怪、精英聚集或需要爆發清場的場合。',
          '取得方式：菩提海擊敗萬業山相關首領後，完成挑戰進度取得。',
        ],
        tags: ['奇術', '攻擊型', '爆發', '範圍', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '神龍吐火',
        summary: '火焰持續傷害奇術，可與醉酒系效果聯動。',
        details: [
          '分類：攻擊型',
          '用途：持續傷害 / 單體補傷',
          '核心效果：進入醉意狀態後噴吐火焰造成多段傷害並附加燃燒類效果，施放中提供減傷與霸體類效果。',
          'PVE 建議：可與太白醉月搭配，適合首領或高血量目標。',
          '取得方式：開封城相關支線中與指定人物互動後取得。',
        ],
        tags: ['奇術', '攻擊型', '火傷', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '太白醉月',
        summary: '醉酒連擊型奇術，適合搭配神龍吐火。',
        details: [
          '分類：攻擊型',
          '用途：連擊補傷 / 酒氣聯動',
          '核心效果：飲酒進入醉意後可連續出拳攻擊，每段消耗精元並附加醉意相關效果。',
          'PVE 建議：與神龍吐火組合時可形成持續傷害與爆發銜接。',
          '取得方式：向酒商購買並飲用指定酒品，觸發醉酒與酒毒狀態後取得。',
        ],
        tags: ['奇術', '攻擊型', '連擊', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '葉龍鏢首',
        summary: '快速突進打擊奇術，偏單體爆發。',
        details: [
          '分類：攻擊型',
          '用途：單體爆發 / 收尾',
          '核心效果：高速突進並施展強力打擊，偏短時間輸出。',
          'PVE 建議：適合補足技能空窗或處理需要快速壓血的目標。',
          '取得方式：取得一定數量奇術後解鎖。',
        ],
        tags: ['奇術', '攻擊型', '單體'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '鷹爪連鑿',
        summary: '破防連擊奇術，用於打破防禦姿態。',
        details: [
          '分類：控制型',
          '用途：破防 / 補段數',
          '核心效果：抓擊目標破除防禦後追加多段攻擊。',
          'PVE 建議：面對防禦姿態較多的敵人時可作為破防手段。',
          '取得方式：春秋別館後方懸崖鳥窩附近完成偷師類小遊戲取得。',
        ],
        tags: ['奇術', '控制型', '破防'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '藥叉破魔',
        summary: '突進與擊飛型控制奇術。',
        details: [
          '分類：控制型',
          '用途：打斷 / 擊飛',
          '核心效果：突進攻擊並造成擊飛或破防類效果。',
          'PVE 建議：可用於打斷部分敵人節奏，並補足技能空窗。',
          '取得方式：完成田英相關戰鬥後取得。',
        ],
        tags: ['奇術', '控制型', '擊飛'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '自在無礙',
        summary: '偏反制與高壓輸出的控制奇術。',
        details: [
          '分類：控制型',
          '用途：擊飛 / 對護盾增傷',
          '核心效果：對目標造成擊飛，並可對玩家或氣血護盾目標造成額外效果。',
          'PVE 建議：若副本敵人有護盾或需要控制窗口，可作為候選。',
          '取得方式：通過田英後重複挑戰累積進度取得。',
        ],
        tags: ['奇術', '控制型', '護盾'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '狗嘴奪食',
        summary: '踩踏與擊倒型奇術，兼具探索跳躍與戰鬥控制。',
        details: [
          '分類：控制型 / 探索型',
          '用途：踩踏 / 擊倒 / 機制位移',
          '核心效果：可高跳或跳至標記位置；戰鬥中可踩踏敵人肩部，對騎兵或不穩定架勢目標效果較好。',
          'PVE 建議：常用於躲招、追擊、處理騎兵或補控制。',
          '取得方式：清河俠卷與主線路線相關寶箱取得。',
        ],
        tags: ['奇術', '控制型', '探索', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '騎龍回馬',
        summary: '打斷與突進控制奇術，PVE/PVP 都常被推薦。',
        details: [
          '分類：控制型',
          '用途：打斷 / 位移 / 減療',
          '核心效果：快速突進並攻擊目標，可打斷敵人技能節奏並造成減療類效果。',
          'PVE 建議：適合需要機動與打斷的首領戰。',
          '取得方式：開封武成王廟大殿房梁頂取得。',
        ],
        tags: ['奇術', '控制型', '位移', 'PVE'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '紅塵障目',
        summary: '致盲與干擾型輔助奇術。',
        details: [
          '分類：輔助型',
          '用途：致盲 / 干擾 / 控場',
          '核心效果：使目標短時間失去視野或戰鬥能力，創造輸出或撤退窗口。',
          'PVE 建議：副本實用性需依首領抗性確認，較偏功能型。',
          '取得方式：丹崖湖邊與指定人物對話後取得。',
        ],
        tags: ['奇術', '輔助型', '控制'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '螢光暉夜',
        summary: '照明與探索輔助奇術。',
        details: [
          '分類：輔助型 / 探索型',
          '用途：照明 / 探索',
          '核心效果：照亮周圍環境，方便探索暗處或解謎。',
          'PVE 建議：主要為探索用途，戰鬥配置優先度較低。',
          '取得方式：捕捉指定數量螢火後取得。',
        ],
        tags: ['奇術', '輔助型', '探索'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '清風霽月',
        summary: '反制與削弱耐力恢復的通用奇術。',
        details: [
          '分類：輔助型 / 通用型',
          '用途：反擊 / 耐力壓制',
          '核心效果：防禦敵方招式後可反擊，並降低目標耐力恢復。',
          'PVE 建議：適合熟悉防反節奏的配置。',
          '取得方式：天賦基礎分支投入指定點數後解鎖。',
        ],
        tags: ['奇術', '輔助型', '反擊', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '杳無形',
        summary: '潛行與隱蔽輔助奇術。',
        details: [
          '分類：輔助型',
          '用途：潛行 / 探索',
          '核心效果：提升自身隱蔽性，降低被發現機率。',
          'PVE 建議：偏探索與潛入玩法，副本戰鬥優先度較低。',
          '取得方式：太平鐘樓偷師任務取得。',
        ],
        tags: ['奇術', '輔助型', '探索'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '無相金身',
        summary: '生存型奇術，可提供護盾與真氣恢復。',
        details: [
          '分類：輔助型 / 生存型',
          '用途：護盾 / 容錯',
          '核心效果：提供護盾與真氣恢復，提升承傷與續戰能力。',
          'PVE 建議：適合新手開荒、高壓副本或需要提高容錯的配置。',
          '取得方式：午時前往開封大相國寺相關事件取得。',
        ],
        tags: ['奇術', '生存', '護盾', 'PVE'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '陰陽迷蹤步',
        summary: '閃避消耗降低的機動輔助奇術。',
        details: [
          '分類：輔助型',
          '用途：位移 / 生存',
          '核心效果：降低閃避耐力消耗，提升機動與容錯。',
          'PVE 建議：適合需要頻繁閃避的首領戰。',
          '取得方式：天工地窖擊敗相關首領後取得。',
        ],
        tags: ['奇術', '輔助型', '位移', 'PVE'],
        source: { label: '中文奇術整理', url: sources.oslinkMysticGuide },
      },
      {
        name: '金玉手',
        summary: '點穴與定身類探索/控制奇術。',
        details: [
          '分類：探索型 / 控制型',
          '用途：點穴 / 定身',
          '核心效果：可點穴並有機會造成特殊效果；戰鬥中可定身與破真氣點，但強敵有抗性限制。',
          'PVE 建議：適合探索互動與小怪控制。',
          '取得方式：石淙灘附近與嚴奇人相關任務取得。',
        ],
        tags: ['奇術', '探索', '控制', '定身'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '太極',
        summary: '牽引與反制型奇術，可互動場景物件。',
        details: [
          '分類：探索型 / 攻擊型',
          '用途：場景互動 / 拉拽 / 反制',
          '核心效果：可聚葉、泛水或牽引敵人；戰鬥中能拉轉敵人，對持盾敵人較有效。',
          'PVE 建議：適合處理特殊敵人與探索互動。',
          '取得方式：地圖解鎖後觀察熊取蜂巢事件並完成時機領悟小遊戲取得。',
        ],
        tags: ['奇術', '探索', '攻擊型', '反制'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '凌雲踏',
        summary: '高跳與踩踏型探索/戰鬥奇術。',
        details: [
          '分類：探索型 / 控制型',
          '用途：高跳 / 踩踏 / 躲招',
          '核心效果：可大幅跳起或跳向標記點；戰鬥中踩踏敵人肩部，對騎兵或架勢不穩目標較有效。',
          'PVE 建議：很適合用來躲避地面招式、追擊或處理機制位置。',
          '取得方式：清河俠卷相關流程或洞穴探索取得。',
        ],
        tags: ['奇術', '探索', '位移', 'PVE'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
      {
        name: '擒星拿月',
        summary: '隔空取物與奪械型探索/戰鬥奇術。',
        details: [
          '分類：探索型 / 攻擊型',
          '用途：隔空取物 / 奪械 / 反擊',
          '核心效果：可拉取遠處物件；戰鬥中可奪取敵人武器並反擊，傷害與武器重量相關。',
          'PVE 建議：探索便利性高，戰鬥中可作為特殊反制工具。',
          '取得方式：神仙渡與仇月海相關探索任務完成後取得。',
        ],
        tags: ['奇術', '探索', '功能', '反制'],
        source: { label: '國際服奇術名單', url: sources.game8MysticSkills },
      },
    ],
  },
  {
    title: '武庫資料',
    description: '先建立武庫選擇方向，之後可與配置編輯器流派綁定。',
    items: [
      {
        name: '鳴金武庫',
        summary: '供鳴金虹、鳴金影等鳴金輸出配置使用。',
        details: ['加成方向：目前背包裡鳴金流派武器傷害', '資料狀態：陸服 TapTap 機制參考'],
        tags: ['武庫', '鳴金', 'PVE'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
      {
        name: '裂石武庫',
        summary: '供裂石威坦向或抗壓配置使用。',
        details: ['加成方向：裂石流派相關武器', '資料狀態：待補造詣門檻與成長表'],
        tags: ['武庫', '裂石', '坦'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
      {
        name: '牽絲武庫',
        summary: '供牽絲玉輸出與牽絲霖治療配置使用。',
        details: ['加成方向：牽絲流派相關武器', '資料狀態：待補造詣門檻與成長表'],
        tags: ['武庫', '牽絲', 'PVE'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
      {
        name: '破竹武庫',
        summary: '供破竹風、破竹鳶輸出配置使用。',
        details: ['加成方向：破竹流派相關武器', '資料狀態：待補造詣門檻與成長表'],
        tags: ['武庫', '破竹', 'PVE'],
        source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
      },
    ],
  },
]

const facePresets: FacePreset[] = [
  {
    name: '深雪',
    author: '水咲',
    code: 'ARTZ2+TGEBa4Rgec96w',
    imageUrl: 'images/faces/shenxue.jpg',
    style: ['女角', '冷感', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '點絳唇',
    author: '幻闕歌',
    code: 'ARTZ3K/SqmG8gckuoLD',
    imageUrl: 'images/faces/dianjiangchun.jpg',
    style: ['女角', '古典', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '自用',
    author: '泠芳攜',
    code: 'ARTZ3ZcUFevCyC1qg2i',
    imageUrl: 'images/faces/ziyou-lingfangxie.jpg',
    style: ['男角', '俊逸', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '很像啊',
    author: '望兮子',
    code: 'ARTZ24QV/e4DVnCJ/qM',
    imageUrl: 'images/faces/henxiang-a.jpg',
    style: ['女角', '華麗', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '寧姚',
    author: '風翎絮',
    code: 'ARTZ2+cZpK56JcOuaD2',
    imageUrl: 'images/faces/ningyao.jpg',
    style: ['女角', '俐落', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '浣溪沙',
    author: '幻闕歌',
    code: 'ARTZ3Zfs6mG8vgjMgMb',
    imageUrl: 'images/faces/huanxisha.jpg',
    style: ['女角', '柔和', '萬相集公開'],
    sourceNote: '複製口令後可於遊戲內識別匯入；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '淡妝',
    author: '沈知書',
    code: 'ARTZ3I2ZOaX8IXNg+Ti',
    imageUrl: 'images/faces/danzhuang.jpg',
    style: ['女角', '淡雅', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '自用',
    author: '鶴歸歸',
    code: 'ARTZ26HTM62H3IbG5Sm',
    imageUrl: 'images/faces/ziyou-heguigui.jpg',
    style: ['男角', '冷感', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '楚楚可憐小狐狸',
    author: '祈雪千千鈴',
    code: 'ARTZ25R4Prt2QLTTu9f',
    imageUrl: 'images/faces/fox.jpg',
    style: ['女角', '可愛', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '風',
    author: '聶莫黎',
    code: 'ARTZ24NlI29q4QFFThj',
    imageUrl: 'images/faces/feng.jpg',
    style: ['女角', '清冷', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '倉鼠飛輪2號',
    author: '北冥晴雪',
    code: 'ARTZ24PHx8yFYQdAriJ',
    imageUrl: 'images/faces/hamster-wheel-2.jpg',
    style: ['女角', '柔和', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '嫂嫂',
    author: '雯少',
    code: 'ARTZ3KXQ/wuiToh9YDy',
    imageUrl: 'images/faces/saosao.jpg',
    style: ['男角', '俊逸', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '自用',
    author: '邪惡小比嘎',
    code: 'ARTZ3CP+pUD3lbGfUgd',
    imageUrl: 'images/faces/ziyou-xiee.jpg',
    style: ['女角', '甜美', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '看我',
    author: '吃象象',
    code: 'ARTZ3LMvCm7cCEL3NAC',
    imageUrl: 'images/faces/kanwo.jpg',
    style: ['男角', '冷感', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '12',
    author: '藺琳霖',
    code: 'ARTZ2+NKAOckRDd67uN',
    imageUrl: 'images/faces/twelve.jpg',
    style: ['女角', '成熟', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '芊芊',
    author: '月搖情',
    code: 'ARTZ26vNvc5dpX+W4sB',
    imageUrl: 'images/faces/qianqian.jpg',
    style: ['女角', '華麗', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '123',
    author: '和隹之',
    code: 'ARTZ28gLFFEId36uQEf',
    imageUrl: 'images/faces/one-two-three.jpg',
    style: ['男角', '俊逸', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '無量',
    author: '頂流',
    code: 'ARTZ3Vy6yFfdcK5p4mi',
    imageUrl: 'images/faces/wuliang.jpg',
    style: ['男角', '冷感', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '無',
    author: '葉念安',
    code: 'ARTZ25EymjoQSLHLXlT',
    imageUrl: 'images/faces/wu.jpg',
    style: ['男角', '俊逸', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '少先行',
    author: '御刀郎',
    code: 'ARTZ3V4VGH+VJgG5CkC',
    imageUrl: 'images/faces/shaoxianxing.jpg',
    style: ['男角', '俊逸', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '坐小孩那桌',
    author: '薛岱淵',
    code: 'ARTZ3fSS668wJ7+fP9K',
    imageUrl: 'images/faces/kid-table.jpg',
    style: ['女角', '俐落', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '師姐',
    author: '晚聲',
    code: 'ARTZ3EFpifzWpUiyVRS',
    imageUrl: 'images/faces/shijie.jpg',
    style: ['女角', '成熟', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '予江湖',
    author: '予牽機',
    code: 'ARTZ25y85K56IYOUL4i',
    imageUrl: 'images/faces/yujianghu.jpg',
    style: ['男角', '華麗', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理；圖片為同篇捏臉預覽。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
]

const getFaceSourceStatus = (item: FacePreset): FaceSourceStatus =>
  item.source.url === sources.taptapFaces || item.source.url === sources.taptapFaceCollection
    ? '陸服來源未驗證'
    : '國際服確認'

const musicEntries: MusicEntry[] = [
  {
    title: '戲樂模式入門',
    type: '模式教學',
    useCase: '第一次使用戲樂、找不到入口或不清楚作品如何套用時。',
    steps: ['開啟遊戲選單', '進入戲樂模式', '選擇單人或多人演出', '套用動作後開始表演'],
    tags: ['入門', '單人', '多人'],
    source: { label: '17173 戲樂模式圖文攻略', url: sources.musicGuide },
  },
  {
    title: '自定義動作上傳',
    type: '動作資料',
    useCase: '想把影片或動作素材轉成戲樂動作。',
    steps: ['準備短影片或動作素材', '在戲樂入口選擇上傳', '等待系統解析動作', '儲存後進入演出'],
    tags: ['自定義', '上傳', '素材'],
    source: { label: '巴哈：用電腦動畫玩戲樂系統', url: sources.musicForum },
  },
  {
    title: '戲樂荟搜尋動作',
    type: '作品套用',
    useCase: '想直接套用玩家已發布的熱門動作。',
    steps: ['打開戲樂模式', '進入戲樂荟', '搜尋動作名稱或作者', '套用作品並開始表演'],
    tags: ['戲樂荟', '套用', '搜尋'],
    source: { label: '游俠網抚剑動作流程', url: 'https://gl.ali213.net/html/2026-1/1737285.html' },
  },
  {
    title: '多人情境與姿態',
    type: '官方修復',
    useCase: '多人戲樂或情境套用後動作異常時，用來檢查版本狀態。',
    steps: ['更新遊戲版本', '重新登入', '重新套用多人情境', '確認角色姿態是否正常'],
    tags: ['多人', '情境', '版本'],
    source: { label: '官方 2026-06-09 修復公告', url: sources.officialFix },
  },
]

const martialBuilds: MartialBuild[] = [
  {
    name: '鳴金虹',
    weapons: '無名劍法 + 無名槍法',
    role: '陸服 TapTap 參考 / PVE 通用',
    difficulty: '低',
    gearSet: ['玉斗 4 件套', '其餘部位依副本掉落補強'],
    statLines: ['鳴金攻擊', '外功攻擊', '會意率 / 會意傷害', '蓄力或核心技能增傷'],
    hearts: ['易水歌', '無名心法', '千山法', '威猛歌'],
    scenes: ['大世界探索', '團本副本', '非競速日常'],
    notes: 'PVE 重點是劍氣循環、鳴金屬攻與蓄力輸出。TapTap 版本排行文提過玉斗套與蒼龍訣配置；目前先保留無名槍劍常用心法組，後續再依完整 PVE 套裝文細修。',
    source: { label: 'TapTap：無名劍法全方位玩法解析', url: sources.taptapWumingBuild },
  },
  {
    name: '鳴金影',
    weapons: '積矩九劍 + 九曲驚神槍',
    role: '陸服 TapTap 參考 / 連段輸出',
    difficulty: '中',
    gearSet: ['PVE 輸出套裝待補', '先以鳴金 / 外功輸出部位過渡'],
    statLines: ['鳴金攻擊', '外功攻擊', '會意率 / 會意傷害', '技能增傷'],
    hearts: ['易水歌', '劍氣縱橫', '逐狼心經', '凝神章'],
    scenes: ['大世界探索', '團本副本', '連段練習'],
    notes: 'PVE 以九劍槍連段和穩定輸出為主。套裝與詞條先按鳴金輸出方向整理，後續找到 TapTap PVE 套裝文再補完整名稱。',
    source: { label: 'TapTap：燕雲河西最強流派推薦', url: sources.taptapRiverWestBuild },
  },
  {
    name: '裂石威',
    weapons: '嗟夫刀法 + 八方風雷槍',
    role: '陸服 TapTap 參考 / 坦度抗壓',
    difficulty: '中',
    gearSet: ['坦向套裝待補', '可先用生存 / 仇恨向部位過渡'],
    statLines: ['最大外功攻擊', '氣血 / 減傷', '裂石攻擊', '護盾或仇恨相關詞條'],
    hearts: ['困獸心經', '抗造大法', '磐石決', '山河絕韻'],
    scenes: ['副本抗壓', '日常探索', '團本 T 位備選'],
    notes: 'PVE 定位偏坦與副本抗壓，嗟夫刀法、八方風雷槍可形成護盾、嘲諷與霸體反擊節奏。',
    source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
  },
  {
    name: '牽絲玉',
    weapons: '青山執筆 + 九重春色',
    role: '陸服 TapTap 參考 / 遠程輸出',
    difficulty: '低',
    gearSet: ['牽絲輸出套裝待補', '先以牽絲 / 外功輸出部位過渡'],
    statLines: ['牽絲攻擊', '外功攻擊', '會意率 / 會意傷害', '遠程或核心技能增傷'],
    hearts: ['易水歌', '花下月令', '征人歸', '縱地摘星'],
    scenes: ['大世界探索', '團本副本', '安全距離輸出'],
    notes: 'PVE 走安全距離輸出，青山執筆與九重春色為核心搭配；詞條先以牽絲輸出與會意方向整理。',
    source: { label: 'TapTap：牽絲玉萌新建議', url: sources.taptapQiansiYu },
  },
  {
    name: '牽絲霖',
    weapons: '明川藥典 + 千香引魂蠱',
    role: '陸服 TapTap 參考 / 團隊治療',
    difficulty: '中',
    gearSet: ['治療套裝待補', '先以治療量 / 團隊支援部位過渡'],
    statLines: ['治療效果', '氣血 / 生存', '牽絲相關加成', '奇術或治療技能增益'],
    hearts: ['君臣藥', '杏花不見', '指玄篇注', '牽絲蠱'],
    scenes: ['團本純奶', '多人副本', '支援位'],
    notes: 'PVE 定位為純奶與團隊支援。明川藥典與千香引魂蠱是治療核心，裝備詞條優先治療量與生存容錯。',
    source: { label: 'TapTap：武庫與定音攻略', url: sources.taptapWukuDingyin },
  },
  {
    name: '破竹風',
    weapons: '泥犁三垢 + 粟子游塵',
    role: '陸服 TapTap 參考 / 爆發機動',
    difficulty: '高',
    gearSet: ['破竹輸出套裝待補', '先以破竹 / 外功爆發部位過渡'],
    statLines: ['破竹攻擊', '外功攻擊', '會意率 / 會意傷害', '爆發或核心技能增傷'],
    hearts: ['易水歌', '忘川絕響', '心彌泥魚', '極樂泣血'],
    scenes: ['大世界探索', '團本副本', '爆發輸出'],
    notes: 'PVE 走爆發與機動輸出。套裝與詞條先按破竹輸出方向整理，後續再依 TapTap PVE 套裝配置細化。',
    source: { label: 'TapTap：新版本流派強度排名', url: sources.taptapBuildRank },
  },
  {
    name: '破竹鳶',
    weapons: '天志垂象 + 千機鎖天',
    role: '陸服 TapTap 參考 / 手甲輸出',
    difficulty: '中',
    gearSet: ['破竹輸出套裝待補', '手甲爆發部位優先'],
    statLines: ['破竹攻擊', '外功攻擊', '會意率 / 會意傷害', '手甲核心技能增傷'],
    hearts: ['易水歌', '扶搖直上', '擒天勢', '三窮致知'],
    scenes: ['大世界探索', '團本副本', '泛用輸出'],
    notes: 'PVE 核心武學為手甲「天志垂象」與繩鏢「千機鎖天」。目前先補心法與詞條方向，套裝名稱待找到完整 PVE 配置後再精準更新。',
    source: { label: 'TapTap：破竹鳶武學與心法取得攻略', url: sources.taptapPozhuYuan },
  },
]

const dataSections: DataSection[] = [
  {
    title: '流派配置',
    description: '原武學流派頁內容已整理到此分類，只保留 PVE 方向，包含武器、套裝、詞條、心法與適合場景。',
    items: martialBuilds.map((item) => ({
      name: item.name,
      summary: `${item.weapons}｜${item.role}`,
      details: [
        `難度：${item.difficulty}`,
        `武器：${item.weapons}`,
        `裝備套裝：${item.gearSet.join('、')}`,
        `詞條：${item.statLines.join('、')}`,
        `心法：${item.hearts.join('、')}`,
        `適合場景：${item.scenes.join('、')}`,
        item.notes,
      ],
      tags: ['流派配置', 'PVE', item.name, item.difficulty, ...item.hearts, ...item.statLines],
      source: item.source,
    })),
  },
  ...buildDataSections,
]

const builderGearSlots = ['武器 1', '武器 2', '冠', '衣', '腕', '帶', '褲', '鞋', '環', '佩']

const getDataSectionItems = (title: string) =>
  dataSections.find((section) => section.title === title)?.items ?? []

const getItemNames = (title: string) => getDataSectionItems(title).map((item) => item.name)

const getWeaponMartialOptions = (weaponName: string) => {
  const weapon = getDataSectionItems('武器資料').find((item) => item.name === weaponName)

  if (!weapon) {
    return []
  }

  return weapon.details
    .filter((detail) => detail.startsWith('可用武學：'))
    .map((detail) => detail.replace('可用武學：', '').trim())
}

const isOffensiveGearSlot = (slot: string) => ['武器 1', '武器 2', '環', '佩'].includes(slot)

const getGearSetOptionsForSlot = (slot: string) =>
  getDataSectionItems('裝備套裝').filter((item) =>
    item.tags.includes(isOffensiveGearSlot(slot) ? '攻擊套裝' : '防禦套裝'),
  )

const getAffixOptionsForSlot = (slot: string, selectedValues: string[] = []) => {
  const allowed = getSlotAffixes(slot)
  const merged = [...allowed, ...selectedValues.filter(Boolean)]

  return Array.from(new Set(merged))
}

const getTuningOptionsForSlot = (slot: string, selectedValues: string[] = []) => {
  const baseOptions = isOffensiveGearSlot(slot)
    ? ['外攻穿透', '無相穿透', '武學技增傷', '蓄力技增傷', '特殊技增傷']
    : ['外攻抗性', '外攻穿透', '無相穿透']
  const merged = [...baseOptions, ...selectedValues.filter(Boolean)]

  return Array.from(new Set(merged))
}

const getDataEntryByName = (sectionTitle: string, name: string) =>
  getDataSectionItems(sectionTitle).find((item) => item.name === name)

const normalizeGearSetName = (value: string) =>
  getItemNames('裝備套裝').find((name) => value.includes(name)) ?? ''

const getDetailValue = (item: DataEntry | undefined, label: string) => {
  const detail = item?.details.find((entry) => entry.startsWith(`${label}：`))

  return detail ? splitDetail(detail).value : ''
}

const getDataStatusTags = (item: DataEntry) => {
  const text = [...item.details, ...item.tags, item.summary].join(' ')
  const statuses = []

  if (text.includes('已確認') || text.includes('國際服參考')) {
    statuses.push('已確認')
  }

  if (text.includes('待人工核對')) {
    statuses.push('待人工核對')
  }

  if (text.includes('待補')) {
    statuses.push('待補資料')
  }

  if (text.includes('架構已建立')) {
    statuses.push('架構已建立')
  }

  return Array.from(new Set(statuses))
}

const formatDataEntry = (sectionTitle: string, item: DataEntry) =>
  [
    `分類：${sectionTitle}`,
    `名稱：${item.name}`,
    `摘要：${item.summary}`,
    '詳細：',
    ...item.details.map((detail) => `- ${detail}`),
    `標籤：${item.tags.join('、')}`,
    `來源：${item.source.label}`,
  ].join('\n')

const createCodeReportUrl = (code: string, topic: CodeReportTopic, message: string) => {
  const title = `回報兌換碼${topic}：${code || '未填寫兌換碼'}`
  const body = [
    '## 兌換碼回報',
    '',
    `回報主題：${topic}`,
    `兌換碼：${code || '未填寫'}`,
    `留言：${message || '未填寫'}`,
    '',
    '- 測試日期：',
    '- 遊戲伺服器：國際服 / 台港澳 / 全球服',
    '- 遊戲內提示：',
    '',
    `網站頁面：${window.location.href}`,
  ].join('\n')
  const params = new URLSearchParams({
    title,
    body,
    labels: '兌換碼,回報',
  })

  return `${sources.githubExpiredReport}?${params.toString()}`
}

const createEmptyGearSelection = (): BuilderGearSelection => ({
  set: '',
  affixA: '',
  affixB: '',
  tuning: '',
})

const createDefaultBuilderGear = () =>
  Object.fromEntries(builderGearSlots.map((slot) => [slot, createEmptyGearSelection()]))

const defaultBuilderState: BuilderState = {
  title: '未命名配置',
  buildName: martialBuilds[0]?.name ?? '',
  equipmentTier: '91 階裝備',
  mainWeapon: getItemNames('武器資料')[0] ?? '',
  mainMartial: getWeaponMartialOptions(getItemNames('武器資料')[0] ?? '')[0] ?? '',
  subWeapon: getItemNames('武器資料')[1] ?? '',
  subMartial: getWeaponMartialOptions(getItemNames('武器資料')[1] ?? '')[0] ?? '',
  arsenal: getItemNames('武庫資料')[0] ?? '',
  gear: createDefaultBuilderGear(),
  mindsets: ['', '', '', ''],
  miracles: ['', '', ''],
  notes: '',
}

const redeemCodes: RedeemCode[] = [
  {
    code: 'WWMQC1 ~ WWMQC30',
    date: '2026-05-03',
    expiresAt: '2026-05-31 23:59 (UTC+8)',
    reward: '官方 KOL 活動碼，每組可領一次；官方公告至 2026-05-31 23:59 失效。',
    status: '可能過期',
    source: { label: '官方兌換碼問題處理公告', url: sources.officialCodes },
  },
  {
    code: 'WWMXATM0501',
    date: '2026-05-01',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群彙整：長鳴玉/通寶類獎勵，實際以遊戲內為準。',
    status: '社群彙整',
    source: { label: '巴哈兌換碼分享串', url: sources.bahaCodes },
  },
  {
    code: 'HAPPY515',
    date: '2026-05-15',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群彙整：長鳴玉、通寶、心法箱類獎勵。',
    status: '社群彙整',
    source: { label: '社群搜尋結果彙整', url: sources.bahaCodes },
  },
  {
    code: 'HEXI0306',
    date: '2026-06-03',
    expiresAt: '已過期',
    reward: '回響玉 100、共鳴旋律 x1、錢幣 x20,000。',
    status: '已過期',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'QINCHUAN0430',
    date: '2026-06-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 100、共鳴旋律 x1、錢幣 x20,000。',
    status: '社群彙整',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'MEETINHEXI',
    date: '2026-06-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 50、內道筆記寶箱 x2、振盪玉 x2、錢幣 x20,000。',
    status: '社群彙整',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'QINCHUANGOGO',
    date: '2026-06-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 50、內道筆記寶箱 x2、錢幣 x20,000。',
    status: '社群彙整',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'GOOSENEWS',
    date: '2026-06-03',
    expiresAt: '已過期',
    reward: '回響玉 40、內道筆記寶箱 x1。',
    status: '已過期',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'LIANGZHOUGO',
    date: '2026-06-03',
    expiresAt: '已過期',
    reward: '回響玉 30、內道筆記寶箱 x1、錢幣 x3,000。',
    status: '已過期',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'XDKHDDPPKN',
    date: '2026-06-18',
    expiresAt: '已過期',
    reward: '6/18 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '已過期',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'YQTWNQKJJE',
    date: '2026-06-19',
    expiresAt: '已過期',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '已過期',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'KTJWN6EQR6',
    date: '2026-06-19',
    expiresAt: '已過期',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '已過期',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'ESJCRRJC64',
    date: '2026-06-19',
    expiresAt: '已過期',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '已過期',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'HOMESTEAD0625',
    date: '2026-06-25',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '家園版本相關兌換碼，獎勵以遊戲內為準。',
    status: '社群彙整',
    source: { label: '巴哈兌換碼分享串', url: sources.bahaCodes },
  },
  {
    code: 'GOHOME123',
    date: '2026-06-25',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '家園版本相關兌換碼，獎勵以遊戲內為準。',
    status: '社群彙整',
    source: { label: '巴哈兌換碼分享串', url: sources.bahaCodes },
  },
  {
    code: 'TPCF3FEN6Y',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'NK4AJFPDWC',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'JJXDTKCD8Y',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'SWCQQQHWAE',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'SY3KQQE8KR',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'KPC346C44A',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'PJCXEP4MFT',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'FHHXEYRJAN',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'APE6NNXY4K',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'NDETCQEXHF',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'CP8WMH8W4C',
    date: '2026-07-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/3 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/3 序號', url: sources.bahaCodes },
  },
  {
    code: 'XM8AQFRCPX',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'QSFXR8EE8D',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'MQECJKF7AR',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'TP78EF43YH',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'NEDEPQ3N6F',
    date: '2026-07-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/5 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/5 序號', url: sources.bahaCodes },
  },
  {
    code: 'QCMHYH34NJ',
    date: '2026-07-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/5 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/5 序號', url: sources.bahaCodes },
  },
  {
    code: 'TRAC6YKC8P',
    date: '2026-07-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/5 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/5 序號', url: sources.bahaCodes },
  },
  {
    code: 'FAFDMF4ME7',
    date: '2026-07-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/5 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/5 序號', url: sources.bahaCodes },
  },
  {
    code: 'JXT3CTJHWP',
    date: '2026-07-09',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '長鳴玉 x3、通寶 x5,000、心法心得·散本 x1。',
    status: '社群彙整',
    source: { label: '阿冷 Arlen 國際服兌換碼整理', url: sources.arlenCodes },
  },
  {
    code: 'MX8MYAYJ4Q',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '長鳴玉 x3、通寶 x5,000、心法心得·散本 x1。',
    status: '社群彙整',
    source: { label: 'YouTube / 社群 7/10 近期禮包碼彙整', url: sources.youtubeJulyCodes },
  },
  {
    code: 'WWMGLyoutube',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉、通寶、心法箱類獎勵，實際以遊戲內為準。',
    status: '社群彙整',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGLtiktok',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉、通寶類獎勵，實際以遊戲內為準。',
    status: '社群彙整',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGO1114',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉、共鳴旋律類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWM251115',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉、通寶、名牌類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGO1115',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'DEVLOG2601',
    date: '2026-01-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '社群國際服彙整：長鳴玉、通寶類獎勵。',
    status: '可能過期',
    source: { label: 'Facebook DEVLOG2601 兌換碼貼文', url: sources.facebookDevlog },
  },
  {
    code: 'tf33hxjmjc',
    date: '2026-03-06',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：長鳴玉、通寶、心法箱、振玉類獎勵。',
    status: '可能過期',
    source: { label: 'Facebook 國際服用戶專享貼文', url: 'https://www.facebook.com/groups/1057723138635101/posts/1507640713643339/' },
  },
  {
    code: 'WWMDEVTALK',
    date: '2026-01-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '國際服社群彙整：長鳴玉 40、通寶 20,000。',
    status: '可能過期',
    source: { label: 'Facebook WWMDEVTALK 貼文', url: sources.facebookWwmDevTalk },
  },
  {
    code: 'WWMBind01',
    date: '2026-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '國際服社群貼文彙整：長鳴玉、共鳴旋律、通寶類獎勵。',
    status: '社群彙整',
    source: { label: 'Facebook WWMBind01 貼文', url: sources.facebookWwmBind },
  },
  {
    code: 'PALACEGO',
    date: '2026-05-22',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際版社群彙整：長鳴玉、通寶、心法箱、振玉類獎勵；部分社群已回報可能失效。',
    status: '可能過期',
    source: { label: 'Facebook PALACEGO / PALACE0528 貼文', url: sources.facebookPalace },
  },
  {
    code: 'PALACE0528',
    date: '2026-05-22',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際版社群彙整：長鳴玉、通寶、共鳴旋律類獎勵；部分社群已回報可能失效。',
    status: '可能過期',
    source: { label: 'Facebook PALACEGO / PALACE0528 貼文', url: sources.facebookPalace },
  },
  {
    code: 'WWMREDDIT0625',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FHKD7HHWRJ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HD8PHDX443',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NKTTCPETYC',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KAAYFMX7HP',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'MKTQJR3DMA',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RNTF3MMTMR',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HSWW3NCEKY',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HSM84QD8DQ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'PXYR8M4AJJ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FXA7WPXP6C',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HD4CRCHPTN',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'WH7PRYFFPA',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'MAWQA8HR48',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'ARN8KQJAET',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RP68WW3NY6',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'QSD4JECMQD',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NSAHT7AHKJ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'YY3NQAJ7WJ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FN6AHA3T7N',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'SE3RNWEDAT',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RYCDP8MMNH',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KERYF4RXM4',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KJ4YF433MN',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KWAFCWDFJF',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'XQFWEQMKMX',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KRDA7X3AXY',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'CW4AP7AA6T',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NY4TTJKEKQ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'PAM46YAQ86',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'EKMW673Q8A',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HK367A6FDJ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'DTXHCJ6DNN',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'TD8XMRKJMK',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'THMQNAFXQC',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'YYP4QNC7NQ',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HH6AM6C8RF',
    date: '2026-06-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RN8T4EWWD7',
    date: '2026-07-11',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供 7/11 序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/11 序號', url: sources.bahaCodes },
  },
  {
    code: 'NQP4YKKFJ4',
    date: '2026-07-11',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供 7/11 序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/11 序號', url: sources.bahaCodes },
  },
  {
    code: 'JPP8WCWPHE',
    date: '2026-07-12',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供 7/12 兌換碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/12 兌換碼', url: sources.bahaCodes },
  },
  {
    code: 'SCK3JFTF7M',
    date: '2026-07-12',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供 7/12 兌換碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/12 兌換碼', url: sources.bahaCodes },
  },
  {
    code: 'WJ8N4AHDMK',
    date: '2026-07-12',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供 7/12 兌換碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/12 兌換碼', url: sources.bahaCodes },
  },
]

const tabMeta: Record<Tab, { label: string; hint: string }> = {
  home: { label: '公告', hint: '最新公告與網站更新' },
  data: { label: '資料庫', hint: '配置編輯器基礎資料' },
  builder: { label: '配置編輯器', hint: '武器、裝備、心法配置' },
  faces: { label: '捏臉數據', hint: '官方萬相集公開口令與使用說明' },
  music: { label: '戲樂數據', hint: '戲樂模式、動作套用與版本狀態' },
  codes: { label: '兌換碼', hint: `整理範圍：2026-05 到 ${today}` },
  converter: { label: '轉碼工具', hint: '陸服臉碼轉國際服待驗證流程' },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [query, setQuery] = useState('')
  const [copiedCodes, setCopiedCodes] = useState<string[]>([])
  const [faceGenderFilter, setFaceGenderFilter] = useState<'all' | '女角' | '男角'>('all')
  const [cnFaceCode, setCnFaceCode] = useState('')
  const [globalFaceCode, setGlobalFaceCode] = useState('')
  const [codesPage, setCodesPage] = useState(1)
  const [codeYearFilter, setCodeYearFilter] = useState('all')
  const [codeMonthFilter, setCodeMonthFilter] = useState('all')
  const [codeExpiryFilter, setCodeExpiryFilter] = useState<CodeExpiryFilter>('all')
  const [codeReportCode, setCodeReportCode] = useState('')
  const [codeReportTopic, setCodeReportTopic] = useState<CodeReportTopic>('過期')
  const [codeReportMessage, setCodeReportMessage] = useState('')
  const [activeDataSection, setActiveDataSection] = useState('all')
  const [equipmentTierFilter, setEquipmentTierFilter] = useState('all')
  const [dataStatusFilter, setDataStatusFilter] = useState<DataStatusFilter>('all')
  const [expandedDataEntry, setExpandedDataEntry] = useState('')
  const [builder, setBuilder] = useState<BuilderState>(defaultBuilderState)
  const [savedBuilds, setSavedBuilds] = useState<SavedBuilderBuild[]>([])
  const [buildImportText, setBuildImportText] = useState('')
  const [buildImportMessage, setBuildImportMessage] = useState('')
  const [savedBuildQuery, setSavedBuildQuery] = useState('')
  const [quickAttackSet, setQuickAttackSet] = useState('')
  const [quickDefenseSet, setQuickDefenseSet] = useState('')
  const homeBackgroundUrl = `${import.meta.env.BASE_URL}images/home-background.jpg`

  const queryText = query.trim().toLowerCase()
  const weaponOptions = getItemNames('武器資料')
  const equipmentTierOptions = getItemNames('裝備等階')
  const mindsetOptions = getItemNames('心法資料')
  const miracleOptions = getItemNames('奇術資料')
  const arsenalOptions = getItemNames('武庫資料')
  const attackGearSetOptions = getDataSectionItems('裝備套裝').filter((item) =>
    item.tags.includes('攻擊套裝'),
  )
  const defenseGearSetOptions = getDataSectionItems('裝備套裝').filter((item) =>
    item.tags.includes('防禦套裝'),
  )
  const mainMartialOptions = getWeaponMartialOptions(builder.mainWeapon)
  const subMartialOptions = getWeaponMartialOptions(builder.subWeapon)
  const selectedBuild = martialBuilds.find((item) => item.name === builder.buildName)
  const selectedEquipmentTierEntry = getDataEntryByName('裝備等階', builder.equipmentTier)
  const selectedArsenalEntry = getDataEntryByName('武庫資料', builder.arsenal)
  const selectedMindsetEntries = builder.mindsets
    .filter(Boolean)
    .map((name) => getDataEntryByName('心法資料', name))
    .filter((item): item is DataEntry => Boolean(item))
  const selectedMiracleEntries = builder.miracles
    .filter(Boolean)
    .map((name) => getDataEntryByName('奇術資料', name))
    .filter((item): item is DataEntry => Boolean(item))
  const gearSetCounts = builderGearSlots.reduce<Record<string, number>>((counts, slot) => {
    const setName = builder.gear[slot].set

    if (!setName) {
      return counts
    }

    return {
      ...counts,
      [setName]: (counts[setName] ?? 0) + 1,
    }
  }, {})
  const activeGearSetEntries = Object.entries(gearSetCounts)
    .map(([name, count]) => ({ entry: getDataEntryByName('裝備套裝', name), count }))
    .filter((item): item is { entry: DataEntry; count: number } => Boolean(item.entry))
  const gearSlotsWithSet = builderGearSlots.filter((slot) => builder.gear[slot].set).length
  const gearSlotsWithAffixes = builderGearSlots.filter(
    (slot) => builder.gear[slot].affixA && builder.gear[slot].affixB,
  ).length
  const gearSlotsWithTuning = builderGearSlots.filter((slot) => builder.gear[slot].tuning).length
  const builderRequiredFields = [
    builder.buildName,
    builder.equipmentTier,
    builder.mainWeapon,
    builder.mainMartial,
    builder.subWeapon,
    builder.subMartial,
    builder.arsenal,
    ...builder.mindsets,
    ...builderGearSlots.flatMap((slot) => [
      builder.gear[slot].set,
      builder.gear[slot].affixA,
      builder.gear[slot].affixB,
      builder.gear[slot].tuning,
    ]),
  ]
  const builderCompletion = Math.round(
    (builderRequiredFields.filter(Boolean).length / builderRequiredFields.length) * 100,
  )
  const builderWarnings = [
    activeGearSetEntries.some((item) => item.entry.tags.includes('攻擊套裝') && item.count >= 4)
      ? ''
      : '尚未啟用 4 件攻擊套裝。',
    activeGearSetEntries.some((item) => item.entry.tags.includes('防禦套裝') && item.count >= 4)
      ? ''
      : '尚未啟用 4 件防禦套裝。',
    builder.mindsets.filter(Boolean).length >= 4 ? '' : '心法尚未選滿 4 個。',
    gearSlotsWithAffixes >= builderGearSlots.length ? '' : `還有 ${builderGearSlots.length - gearSlotsWithAffixes} 個部位未選滿 2 條詞綴。`,
    gearSlotsWithTuning >= builderGearSlots.length ? '' : `還有 ${builderGearSlots.length - gearSlotsWithTuning} 個部位未選定音。`,
  ].filter(Boolean)
  const builderCheckItems = [
    { label: '流派', value: builder.buildName ? '已選擇' : '未選擇' },
    { label: '裝備等階', value: builder.equipmentTier ? '已選擇' : '未選擇' },
    { label: '套裝部位', value: `${gearSlotsWithSet}/${builderGearSlots.length}` },
    { label: '詞綴部位', value: `${gearSlotsWithAffixes}/${builderGearSlots.length}` },
    { label: '定音部位', value: `${gearSlotsWithTuning}/${builderGearSlots.length}` },
    { label: '心法', value: `${builder.mindsets.filter(Boolean).length}/4` },
    { label: '奇術', value: `${builder.miracles.filter(Boolean).length}/3` },
  ]
  const filteredSavedBuilds = savedBuilds.filter((item) =>
    [item.title, item.buildName, item.equipmentTier, item.mainWeapon, item.subWeapon]
      .join(' ')
      .toLowerCase()
      .includes(savedBuildQuery.trim().toLowerCase()),
  )
  const builderSummary = [
    `配置名稱：${builder.title || '未命名配置'}`,
    `流派：${builder.buildName || '未選擇'}`,
    `裝備等階：${builder.equipmentTier || '未選擇'}`,
    `主武器：${builder.mainWeapon || '未選擇'} / ${builder.mainMartial || '未選擇'}`,
    `副武器：${builder.subWeapon || '未選擇'} / ${builder.subMartial || '未選擇'}`,
    `武庫：${builder.arsenal || '未選擇'}`,
    `完整度：${builderCompletion}%`,
    `裝備完成：套裝 ${gearSlotsWithSet}/${builderGearSlots.length}、詞綴 ${gearSlotsWithAffixes}/${builderGearSlots.length}、定音 ${gearSlotsWithTuning}/${builderGearSlots.length}`,
    `心法：${builder.mindsets.filter(Boolean).join('、') || '未選擇'}`,
    `奇術：${builder.miracles.filter(Boolean).join('、') || '未選擇'}`,
    `套裝啟用：${activeGearSetEntries
      .map(({ entry, count }) => `${entry.name} ${count} 件`)
      .join('、') || '未選擇'}`,
    '裝備：',
    ...builderGearSlots.map((slot) => {
      const gear = builder.gear[slot]
      const values = [gear.set, gear.affixA, gear.affixB, gear.tuning].filter(Boolean).join(' / ')

      return `- ${slot}：${values || '未設定'}`
    }),
    builder.notes.trim() ? `備註：${builder.notes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const updateBuilder = <Key extends keyof BuilderState>(key: Key, value: BuilderState[Key]) => {
    setBuilder((current) => ({ ...current, [key]: value }))
  }

  const saveCurrentBuild = () => {
    const title = builder.title.trim() || '未命名配置'
    const savedBuild: SavedBuilderBuild = {
      ...builder,
      title,
      savedAt: new Date().toISOString(),
    }

    setSavedBuilds((current) => [
      savedBuild,
      ...current.filter((item) => item.title !== title),
    ])
    setBuilder((current) => ({ ...current, title }))
  }

  const loadSavedBuild = (title: string) => {
    const savedBuild = savedBuilds.find((item) => item.title === title)

    if (!savedBuild) {
      return
    }

    const { savedAt: _savedAt, ...build } = savedBuild
    setBuilder(build)
  }

  const deleteSavedBuild = (title: string) => {
    setSavedBuilds((current) => current.filter((item) => item.title !== title))
  }

  const duplicateSavedBuild = (title: string) => {
    const savedBuild = savedBuilds.find((item) => item.title === title)

    if (!savedBuild) {
      return
    }

    const nextTitle = `${savedBuild.title} 副本`
    setSavedBuilds((current) => [
      {
        ...savedBuild,
        title: nextTitle,
        savedAt: new Date().toISOString(),
      },
      ...current.filter((item) => item.title !== nextTitle),
    ])
  }

  const formatSavedAt = (value: string) => {
    if (!value) {
      return '未記錄時間'
    }

    return new Intl.DateTimeFormat('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  const downloadBuildJson = (filename: string, builds: SavedBuilderBuild[]) => {
    const blob = new Blob([JSON.stringify(builds, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCurrentBuild = () => {
    const title = builder.title.trim() || '未命名配置'
    downloadBuildJson(`${title}.json`, [
      {
        ...builder,
        title,
        savedAt: new Date().toISOString(),
      },
    ])
  }

  const exportSavedBuilds = () => {
    downloadBuildJson('燕雲配置備份.json', savedBuilds)
  }

  const exportSummaryText = () => {
    const title = builder.title.trim() || '未命名配置'
    const blob = new Blob([builderSummary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${title}-摘要.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBuilds = () => {
    try {
      const parsed = JSON.parse(buildImportText) as SavedBuilderBuild | SavedBuilderBuild[]
      const imported = (Array.isArray(parsed) ? parsed : [parsed]).filter(
        (item) => item && typeof item.title === 'string' && item.gear && Array.isArray(item.mindsets),
      )
      const normalizedImported = imported.map((item) => ({
        ...defaultBuilderState,
        ...item,
        gear: {
          ...createDefaultBuilderGear(),
          ...item.gear,
        },
        mindsets: [...item.mindsets, '', '', '', ''].slice(0, 4),
        miracles: [...(item.miracles ?? []), '', '', ''].slice(0, 3),
        savedAt: item.savedAt || new Date().toISOString(),
      }))

      if (normalizedImported.length === 0) {
        setBuildImportMessage('沒有找到可匯入的配置。')
        return
      }

      setSavedBuilds((current) => [
        ...normalizedImported,
        ...current.filter((item) => !normalizedImported.some((importedItem) => importedItem.title === item.title)),
      ])
      const firstImported = normalizedImported[0]
      if (firstImported) {
        const { savedAt: _savedAt, ...build } = {
          ...firstImported,
        }
        setBuilder(build)
      }
      setBuildImportText('')
      setBuildImportMessage(`已匯入 ${normalizedImported.length} 筆配置。`)
    } catch {
      setBuildImportMessage('匯入失敗，請確認貼上的內容是配置 JSON。')
    }
  }

  const updateBuilderGear = (
    slot: string,
    key: keyof BuilderGearSelection,
    value: string,
  ) => {
    setBuilder((current) => ({
      ...current,
      gear: {
        ...current.gear,
        [slot]: {
          ...current.gear[slot],
          [key]: value,
        },
      },
    }))
  }

  const applyQuickGearSet = (setName: string, slots: string[]) => {
    if (!setName) {
      return
    }

    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            set: slots.includes(slot) ? setName : current.gear[slot].set,
          },
        ]),
      ),
    }))
  }

  const clearGearSets = () => {
    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            set: '',
          },
        ]),
      ),
    }))
  }

  const applyRecommendedAffixes = () => {
    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => {
          const options = getAffixOptionsForSlot(slot, [current.gear[slot].affixA, current.gear[slot].affixB])

          return [
            slot,
            {
              ...current.gear[slot],
              affixA: options[0] ?? current.gear[slot].affixA,
              affixB: options[1] ?? current.gear[slot].affixB,
            },
          ]
        }),
      ),
    }))
  }

  const applyRecommendedTunings = () => {
    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            tuning: getTuningOptionsForSlot(slot, [current.gear[slot].tuning])[0] ?? current.gear[slot].tuning,
          },
        ]),
      ),
    }))
  }

  const applySelectedBuildHearts = () => {
    if (!selectedBuild) {
      return
    }

    setBuilder((current) => ({
      ...current,
      mindsets: [...selectedBuild.hearts, '', '', '', ''].slice(0, 4),
    }))
  }

  const applySelectedBuildAffixes = () => {
    if (!selectedBuild) {
      return
    }

    const affixes = selectedBuild.statLines.slice(0, 2)

    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            affixA: affixes[0] ?? current.gear[slot].affixA,
            affixB: affixes[1] ?? current.gear[slot].affixB,
          },
        ]),
      ),
    }))
  }

  const clearGearAffixes = () => {
    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            affixA: '',
            affixB: '',
          },
        ]),
      ),
    }))
  }

  const clearGearTunings = () => {
    setBuilder((current) => ({
      ...current,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            tuning: '',
          },
        ]),
      ),
    }))
  }

  const updateBuilderArray = (
    key: 'mindsets' | 'miracles',
    index: number,
    value: string,
  ) => {
    setBuilder((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }))
  }

  const applyMartialBuild = (buildName: string) => {
    const build = martialBuilds.find((item) => item.name === buildName)

    if (!build) {
      updateBuilder('buildName', buildName)
      return
    }

    const martialNames = build.weapons.split('+').map((name) => name.trim())
    const findWeaponByMartial = (martialName: string) =>
      weaponOptions.find((weaponName) => getWeaponMartialOptions(weaponName).includes(martialName)) ??
      ''
    const nextMainMartial = martialNames[0] ?? ''
    const nextSubMartial = martialNames[1] ?? ''
    const preferredAffixes = build.statLines.slice(0, 2)
    const preferredGearSetNames = build.gearSet.map(normalizeGearSetName).filter(Boolean)

    setBuilder((current) => ({
      ...current,
      buildName,
      mainWeapon: findWeaponByMartial(nextMainMartial) || current.mainWeapon,
      mainMartial: nextMainMartial || current.mainMartial,
      subWeapon: findWeaponByMartial(nextSubMartial) || current.subWeapon,
      subMartial: nextSubMartial || current.subMartial,
      arsenal:
        arsenalOptions.find((name) => `${build.name} ${build.role}`.includes(name.replace('武庫', ''))) ??
        current.arsenal,
      gear: Object.fromEntries(
        builderGearSlots.map((slot) => [
          slot,
          {
            ...current.gear[slot],
            set:
              preferredGearSetNames.find((name) =>
                getGearSetOptionsForSlot(slot).some((item) => item.name === name),
              ) ?? current.gear[slot].set,
            affixA: preferredAffixes[0] ?? current.gear[slot].affixA,
            affixB: preferredAffixes[1] ?? current.gear[slot].affixB,
          },
        ]),
      ),
      mindsets: current.mindsets.map((item, index) => build.hearts[index] ?? item),
    }))
  }

  useEffect(() => {
    setCodesPage(1)
  }, [queryText, codeYearFilter, codeMonthFilter, codeExpiryFilter])

  useEffect(() => {
    const saved = window.localStorage.getItem('yanyun-builder-builds')

    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved) as SavedBuilderBuild[]
      setSavedBuilds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSavedBuilds([])
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('yanyun-builder-builds', JSON.stringify(savedBuilds))
  }, [savedBuilds])

  useEffect(() => {
    setExpandedDataEntry('')
  }, [activeDataSection, queryText])

  const filteredFaces = useMemo(
    () =>
      facePresets.filter((item) => {
        const matchesQuery = [
          item.name,
          item.author,
          item.code,
          ...item.style,
          item.sourceNote,
          getFaceSourceStatus(item),
        ]
          .join(' ')
          .toLowerCase()
          .includes(queryText)
        const matchesGender = faceGenderFilter === 'all' || item.style.includes(faceGenderFilter)

        return matchesQuery && matchesGender
      }),
    [faceGenderFilter, queryText],
  )

  const filteredMusic = useMemo(
    () =>
      musicEntries.filter((item) =>
        [item.title, item.type, item.useCase, ...item.steps, ...item.tags]
          .join(' ')
          .toLowerCase()
          .includes(queryText),
      ),
    [queryText],
  )

  const filteredDataSections = useMemo(
    () =>
      dataSections
        .filter((section) => activeDataSection === 'all' || section.title === activeDataSection)
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const matchesQuery = [
              section.title,
              section.description,
              item.name,
              item.summary,
              ...item.details,
              ...item.tags,
              item.source.label,
            ]
              .join(' ')
              .toLowerCase()
              .includes(queryText)
            const matchesTier =
              section.title !== '裝備等階' ||
              equipmentTierFilter === 'all' ||
              item.name === equipmentTierFilter
            const statusTags = getDataStatusTags(item)
            const matchesStatus =
              dataStatusFilter === 'all' ||
              (dataStatusFilter === 'confirmed' && statusTags.includes('已確認')) ||
              (dataStatusFilter === 'needsReview' && statusTags.includes('待人工核對')) ||
              (dataStatusFilter === 'missing' && statusTags.includes('待補資料')) ||
              (dataStatusFilter === 'scaffold' && statusTags.includes('架構已建立'))

            return matchesQuery && matchesTier && matchesStatus
          }),
        }))
        .filter((section) => section.items.length > 0),
    [activeDataSection, dataStatusFilter, equipmentTierFilter, queryText],
  )

  const codeYearOptions = useMemo(
    () => Array.from(new Set(redeemCodes.map((item) => item.date.slice(0, 4)))).sort().reverse(),
    [],
  )

  const codeMonthOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, '0'),
  )
  const newestCodeDate = redeemCodes
    .map((item) => item.date)
    .sort()
    .at(-1)
  const codeStatusSummary = {
    active: redeemCodes.filter((item) => item.status === '官方確認' || item.status === '社群彙整').length,
    expired: redeemCodes.filter((item) => item.status === '已過期').length,
    uncertain: redeemCodes.filter((item) => item.status === '可能過期').length,
    copied: redeemCodes.filter((item) => copiedCodes.includes(item.code)).length,
  }

  const filteredCodes = useMemo(
    () =>
      redeemCodes
        .filter((item) => {
          const matchesQuery = [
            item.code,
            item.date,
            item.expiresAt,
            item.reward,
            item.status,
            item.source.label,
          ]
            .join(' ')
            .toLowerCase()
            .includes(queryText)
          const matchesYear = codeYearFilter === 'all' || item.date.startsWith(codeYearFilter)
          const matchesMonth = codeMonthFilter === 'all' || item.date.slice(5, 7) === codeMonthFilter
          const matchesExpiry =
            codeExpiryFilter === 'all' ||
            (codeExpiryFilter === 'active' &&
              (item.status === '官方確認' || item.status === '社群彙整')) ||
            (codeExpiryFilter === 'expired' && item.status === '已過期') ||
            (codeExpiryFilter === 'uncertain' && item.status === '可能過期')

          return matchesQuery && matchesYear && matchesMonth && matchesExpiry
        })
        .sort(
          (first, second) =>
            second.date.localeCompare(first.date) || first.code.localeCompare(second.code),
        ),
    [codeExpiryFilter, codeMonthFilter, codeYearFilter, queryText],
  )

  const totalCodePages = Math.max(1, Math.ceil(filteredCodes.length / codesPerPage))
  const safeCodesPage = Math.min(codesPage, totalCodePages)
  const pagedCodes = filteredCodes.slice(
    (safeCodesPage - 1) * codesPerPage,
    safeCodesPage * codesPerPage,
  )
  const visibleFaces = filteredFaces.slice(0, facesDisplayLimit)

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedCodes((current) => (current.includes(text) ? current : [...current, text]))
  }

  const fillCodeReport = (code: string) => {
    setCodeReportCode(code)
    setCodeReportTopic('過期')
    setCodeReportMessage('')
  }

  const openCodeReport = () => {
    window.open(
      createCodeReportUrl(codeReportCode.trim(), codeReportTopic, codeReportMessage.trim()),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const codePagination = (
    <div className="pagination">
      <p>
        共 {filteredCodes.length} 組，依日期由新到舊排序，每頁顯示 {codesPerPage} 組。
      </p>
      <div>
        <button
          disabled={safeCodesPage === 1}
          onClick={() => setCodesPage((page) => Math.max(1, page - 1))}
          type="button"
        >
          上一頁
        </button>
        <span>
          第 {safeCodesPage} / {totalCodePages} 頁
        </span>
        <button
          disabled={safeCodesPage === totalCodePages}
          onClick={() => setCodesPage((page) => Math.min(totalCodePages, page + 1))}
          type="button"
        >
          下一頁
        </button>
      </div>
    </div>
  )

  return (
    <main>
      <header className="app-header">
        <img className="header-background" src={homeBackgroundUrl} alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">燕雲十六聲查詢</p>
          <h1>燕雲十六聲資料查詢</h1>
          <p className="subtitle">
            捏臉、戲樂、配置資料庫、臉碼轉換流程與 2026 年 5 月至今兌換碼整理。資料逐步補完中，兌換碼有效性仍以遊戲內為準。
          </p>
        </div>
        <div className="status-panel" aria-label="資料狀態">
          <span>最後整理</span>
          <strong>{today}</strong>
        </div>
      </header>

      <section className="toolbar" aria-label="查詢工具">
        <div className="tabs" role="tablist" aria-label="資料分類">
          {(Object.keys(tabMeta) as Tab[]).map((tab) => (
            <button
              className={activeTab === tab ? 'active' : ''}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              <span>{tabMeta[tab].label}</span>
              <small>{tabMeta[tab].hint}</small>
            </button>
          ))}
        </div>
        <label className="search">
          <span>搜尋</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="輸入代碼、流派、作者、心法或關鍵字"
            value={query}
          />
        </label>
      </section>

      {activeTab === 'home' && (
        <section className="content-grid home-grid">
          <Notice title="公告" text="家園改版" />
        </section>
      )}

      {activeTab === 'data' && (
        <section className="content-grid data-grid">
          <Notice
            title="資料庫說明"
            text="此頁整理配置編輯器會用到的流派配置、武器、裝備部位、裝備等階、套裝、詞綴、定音、心法、奇術與武庫資料。左側可切換分類，右側可配合搜尋快速查資料。"
          />
          <div className="data-quick-actions">
            <button
              type="button"
              onClick={() => {
                setActiveDataSection('all')
                setDataStatusFilter('missing')
              }}
            >
              只看待補資料
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDataSection('部位詞綴限制')
                setDataStatusFilter('all')
              }}
            >
              查看部位詞綴
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDataSection('定音資料')
                setDataStatusFilter('all')
              }}
            >
              查看定音資料
            </button>
          </div>
          <aside className="data-sidebar" aria-label="資料分類">
            <button
              className={activeDataSection === 'all' ? 'active' : ''}
              onClick={() => setActiveDataSection('all')}
              type="button"
            >
              全部資料
              <span>{dataSections.reduce((total, section) => total + section.items.length, 0)}</span>
            </button>
            {dataSections.map((section) => (
              <button
                className={activeDataSection === section.title ? 'active' : ''}
                key={section.title}
                onClick={() => setActiveDataSection(section.title)}
                type="button"
              >
                {section.title}
                <span>{section.items.length}</span>
              </button>
            ))}
          </aside>
          <div className="data-content">
            <div className="data-filter-bar" aria-label="資料狀態篩選">
              <span>資料狀態</span>
              {[
                ['all', '全部'],
                ['confirmed', '已確認'],
                ['needsReview', '待核對'],
                ['missing', '待補'],
                ['scaffold', '架構'],
              ].map(([value, label]) => (
                <button
                  className={dataStatusFilter === value ? 'active' : ''}
                  key={value}
                  onClick={() => setDataStatusFilter(value as DataStatusFilter)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            {(activeDataSection === 'all' || activeDataSection === '裝備等階') && (
              <div className="tier-filter-bar" aria-label="裝備等階篩選">
                <span>裝備等階</span>
                <button
                  className={equipmentTierFilter === 'all' ? 'active' : ''}
                  onClick={() => setEquipmentTierFilter('all')}
                  type="button"
                >
                  全部
                </button>
                {equipmentTierOptions.map((tier) => (
                  <button
                    className={equipmentTierFilter === tier ? 'active' : ''}
                    key={tier}
                    onClick={() => setEquipmentTierFilter(tier)}
                    type="button"
                  >
                    {tier.replace('裝備', '')}
                  </button>
                ))}
              </div>
            )}
            {filteredDataSections.length === 0 && (
              <article className="card empty-state">
                <h2>沒有找到資料</h2>
                <p>請換個關鍵字，或切回全部資料再搜尋。</p>
              </article>
            )}
            {filteredDataSections.map((section) => (
              <article className="card data-section-card" key={section.title}>
                <div className="data-section-heading">
                  <div>
                    <p className="kicker">{section.items.length} 筆資料</p>
                    <h2>{section.title}</h2>
                  </div>
                  <p>{section.description}</p>
                </div>
                <div className="data-entry-list">
                  {section.items.map((item) => (
                    <section className="data-entry" key={`${section.title}-${item.name}`}>
                      <div className="card-top">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.summary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDataEntry((current) =>
                              current === `${section.title}-${item.name}`
                                ? ''
                                : `${section.title}-${item.name}`,
                            )
                          }
                        >
                          {expandedDataEntry === `${section.title}-${item.name}` ? '收合' : '展開'}
                        </button>
                      </div>
                      <TagList tags={item.tags.slice(0, 6)} />
                      <DataStatusTags tags={getDataStatusTags(item)} />
                      {expandedDataEntry === `${section.title}-${item.name}` && (
                        <>
                          <DataDetails item={item} sectionTitle={section.title} />
                          <button
                            className="data-copy-button"
                            type="button"
                            onClick={() => copyText(formatDataEntry(section.title, item))}
                          >
                            {copiedCodes.includes(formatDataEntry(section.title, item)) ? '已複製資料' : '複製資料'}
                          </button>
                          {section.title !== '心法資料' && <SourceLink source={item.source} />}
                        </>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'builder' && (
        <section className="content-grid builder-grid">
          <Notice
            title="配置編輯器"
            text="第一版先提供本機編寫與複製摘要，選項會沿用資料庫目前已整理的武器、裝備、詞綴、定音、心法、奇術與武庫資料。"
          />
          <div className="builder-editor">
            <article className="card builder-card">
              <div className="builder-card-heading">
                <p className="kicker">配置</p>
                <h2>基本設定</h2>
              </div>
              <div className="builder-form-grid">
                <label>
                  <span>配置名稱</span>
                  <input
                    onChange={(event) => updateBuilder('title', event.target.value)}
                    placeholder="例如：破竹鳶 91 階副本配置"
                    value={builder.title}
                  />
                </label>
                <label>
                  <span>流派配置</span>
                  <select
                    onChange={(event) => applyMartialBuild(event.target.value)}
                    value={builder.buildName}
                  >
                    <option value="">不套用流派</option>
                    {martialBuilds.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>武庫</span>
                  <select
                    onChange={(event) => updateBuilder('arsenal', event.target.value)}
                    value={builder.arsenal}
                  >
                    <option value="">未選擇</option>
                    {arsenalOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>裝備等階</span>
                  <select
                    onChange={(event) => updateBuilder('equipmentTier', event.target.value)}
                    value={builder.equipmentTier}
                  >
                    <option value="">未選擇</option>
                    {equipmentTierOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>主武器</span>
                  <select
                    onChange={(event) => {
                      const weapon = event.target.value
                      updateBuilder('mainWeapon', weapon)
                      updateBuilder('mainMartial', getWeaponMartialOptions(weapon)[0] ?? '')
                    }}
                    value={builder.mainWeapon}
                  >
                    <option value="">未選擇</option>
                    {weaponOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>主武學</span>
                  <select
                    onChange={(event) => updateBuilder('mainMartial', event.target.value)}
                    value={builder.mainMartial}
                  >
                    <option value="">未選擇</option>
                    {mainMartialOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>副武器</span>
                  <select
                    onChange={(event) => {
                      const weapon = event.target.value
                      updateBuilder('subWeapon', weapon)
                      updateBuilder('subMartial', getWeaponMartialOptions(weapon)[0] ?? '')
                    }}
                    value={builder.subWeapon}
                  >
                    <option value="">未選擇</option>
                    {weaponOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>副武學</span>
                  <select
                    onChange={(event) => updateBuilder('subMartial', event.target.value)}
                    value={builder.subMartial}
                  >
                    <option value="">未選擇</option>
                    {subMartialOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {selectedBuild && (
                <div className="builder-build-note">
                  <strong>{selectedBuild.role}</strong>
                  <span>{selectedBuild.notes}</span>
                </div>
              )}
              {selectedEquipmentTierEntry && (
                <div className="builder-preview-card">
                  <strong>{selectedEquipmentTierEntry.name}</strong>
                  <span>{selectedEquipmentTierEntry.summary}</span>
                  <small>
                    {getDetailValue(selectedEquipmentTierEntry, '調律')} /{' '}
                    {getDetailValue(selectedEquipmentTierEntry, '定音')}
                  </small>
                </div>
              )}
              {selectedArsenalEntry && (
                <div className="builder-preview-card">
                  <strong>{selectedArsenalEntry.name}</strong>
                  <span>{selectedArsenalEntry.summary}</span>
                  <small>{getDetailValue(selectedArsenalEntry, '加成方向') || '詳細加成資料待補。'}</small>
                </div>
              )}
            </article>

            <article className="card builder-card">
              <div className="builder-card-heading">
                <p className="kicker">裝備</p>
                <h2>裝備配置</h2>
              </div>
              <div className="quick-set-panel">
                <label>
                  <span>攻擊套裝</span>
                  <select
                    onChange={(event) => setQuickAttackSet(event.target.value)}
                    value={quickAttackSet}
                  >
                    <option value="">選擇攻擊套裝</option>
                    {attackGearSetOptions.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => applyQuickGearSet(quickAttackSet, ['武器 1', '武器 2', '環', '佩'])}
                  disabled={!quickAttackSet}
                >
                  套用攻擊 4 件
                </button>
                <label>
                  <span>防禦套裝</span>
                  <select
                    onChange={(event) => setQuickDefenseSet(event.target.value)}
                    value={quickDefenseSet}
                  >
                    <option value="">選擇防禦套裝</option>
                    {defenseGearSetOptions.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => applyQuickGearSet(quickDefenseSet, ['冠', '衣', '腕', '褲'])}
                  disabled={!quickDefenseSet}
                >
                  套用防禦 4 件
                </button>
                <button type="button" onClick={clearGearSets}>
                  清除套裝
                </button>
                <button type="button" onClick={applyRecommendedAffixes}>
                  套用推薦詞綴
                </button>
                <button type="button" onClick={applySelectedBuildAffixes} disabled={!selectedBuild}>
                  套用流派詞綴
                </button>
                <button type="button" onClick={applyRecommendedTunings}>
                  套用推薦定音
                </button>
                <button type="button" onClick={clearGearAffixes}>
                  清除詞綴
                </button>
                <button type="button" onClick={clearGearTunings}>
                  清除定音
                </button>
              </div>
              <div className="builder-set-overview">
                {activeGearSetEntries.length === 0 && <p>尚未選擇套裝。</p>}
                {activeGearSetEntries.map(({ entry, count }) => {
                  const unlocked = count >= 4 ? '已啟用二件與四件效果' : count >= 2 ? '已啟用二件效果' : '尚未啟用套裝效果'

                  return (
                    <section key={entry.name}>
                      <div>
                        <strong>{entry.name}</strong>
                        <span>{count} 件</span>
                      </div>
                      <p>{unlocked}</p>
                      {count >= 2 && <small>{getDetailValue(entry, '二件效果')}</small>}
                      {count >= 4 && <small>{getDetailValue(entry, '四件效果')}</small>}
                    </section>
                  )
                })}
              </div>
              <div className="builder-gear-list">
                {builderGearSlots.map((slot) => (
                  <section className="builder-gear-row" key={slot}>
                    <div className="gear-slot-heading">
                      <h3>{slot}</h3>
                      <small>
                        詞綴：{getAffixOptionsForSlot(slot).slice(0, 2).join('、') || '待補'}｜定音：
                        {getTuningOptionsForSlot(slot).slice(0, 1).join('、') || '待補'}
                      </small>
                    </div>
                    <label>
                      <span>套裝</span>
                      <select
                        onChange={(event) => updateBuilderGear(slot, 'set', event.target.value)}
                        value={builder.gear[slot].set}
                      >
                        <option value="">未選擇</option>
                        {getGearSetOptionsForSlot(slot).map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>詞綴 1</span>
                      <select
                        onChange={(event) => updateBuilderGear(slot, 'affixA', event.target.value)}
                        value={builder.gear[slot].affixA}
                      >
                        <option value="">未選擇</option>
                        {getAffixOptionsForSlot(slot, [
                          builder.gear[slot].affixA,
                          builder.gear[slot].affixB,
                        ]).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>詞綴 2</span>
                      <select
                        onChange={(event) => updateBuilderGear(slot, 'affixB', event.target.value)}
                        value={builder.gear[slot].affixB}
                      >
                        <option value="">未選擇</option>
                        {getAffixOptionsForSlot(slot, [
                          builder.gear[slot].affixA,
                          builder.gear[slot].affixB,
                        ]).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>定音</span>
                      <select
                        onChange={(event) => updateBuilderGear(slot, 'tuning', event.target.value)}
                        value={builder.gear[slot].tuning}
                      >
                        <option value="">未選擇</option>
                        {getTuningOptionsForSlot(slot, [builder.gear[slot].tuning]).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                ))}
              </div>
            </article>

            <article className="card builder-card">
              <div className="builder-card-heading">
                <p className="kicker">技能</p>
                <h2>心法與奇術</h2>
              </div>
              <div className="skill-actions">
                <button type="button" onClick={applySelectedBuildHearts} disabled={!selectedBuild}>
                  套用流派心法
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBuilder((current) => ({
                      ...current,
                      mindsets: ['', '', '', ''],
                      miracles: ['', '', ''],
                    }))
                  }
                >
                  清除心法奇術
                </button>
              </div>
              <div className="builder-slot-grid">
                {builder.mindsets.map((value, index) => (
                  <label key={`mindset-${index + 1}`}>
                    <span>心法 {index + 1}</span>
                    <select
                      onChange={(event) => updateBuilderArray('mindsets', index, event.target.value)}
                      value={value}
                    >
                      <option value="">未選擇</option>
                      {mindsetOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                {builder.miracles.map((value, index) => (
                  <label key={`miracle-${index + 1}`}>
                    <span>奇術 {index + 1}</span>
                    <select
                      onChange={(event) => updateBuilderArray('miracles', index, event.target.value)}
                      value={value}
                    >
                      <option value="">未選擇</option>
                      {miracleOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <label className="builder-notes">
                <span>備註</span>
                <textarea
                  onChange={(event) => updateBuilder('notes', event.target.value)}
                  placeholder="可以記錄手法、替換方案、待確認資料或自己測試心得"
                  value={builder.notes}
                />
              </label>
              {(selectedMindsetEntries.length > 0 || selectedMiracleEntries.length > 0) && (
                <div className="builder-preview-list">
                  {selectedMindsetEntries.map((item) => (
                    <section className="builder-preview-card" key={item.name}>
                      <strong>{item.name}</strong>
                      <span>{getDetailValue(item, '定位') || item.summary}</span>
                      <small>{getDetailValue(item, '基礎效果') || '基礎效果待補。'}</small>
                    </section>
                  ))}
                  {selectedMiracleEntries.map((item) => (
                    <section className="builder-preview-card" key={item.name}>
                      <strong>{item.name}</strong>
                      <span>{item.summary}</span>
                      <small>{item.details[0] ?? '詳細資料待補。'}</small>
                    </section>
                  ))}
                </div>
              )}
            </article>
          </div>

          <aside className="builder-summary">
            <article className="card builder-card">
              <div className="card-top">
                <div>
                  <p className="kicker">摘要</p>
                  <h2>配置摘要</h2>
                </div>
                <button type="button" onClick={() => copyText(builderSummary)}>
                  {copiedCodes.includes(builderSummary) ? '已複製' : '複製'}
                </button>
              </div>
              <pre>{builderSummary}</pre>
              <div className="builder-quality">
                <div>
                  <strong>{builderCompletion}%</strong>
                  <span>配置完整度</span>
                </div>
                {builderWarnings.length > 0 ? (
                  <ul>
                    {builderWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p>主要欄位已完成，可接著人工核對數值與手法。</p>
                )}
              </div>
              <div className="builder-check-list">
                <h3>配置檢查</h3>
                <div>
                  {builderCheckItems.map((item) => (
                    <span key={item.label}>
                      <strong>{item.label}</strong>
                      {item.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="builder-actions">
                <button type="button" onClick={saveCurrentBuild}>
                  保存配置
                </button>
                <button type="button" onClick={exportSummaryText}>
                  匯出摘要
                </button>
                <button type="button" onClick={exportCurrentBuild}>
                  匯出目前配置
                </button>
                <button type="button" onClick={exportSavedBuilds} disabled={savedBuilds.length === 0}>
                  匯出全部
                </button>
                <button type="button" onClick={() => setBuilder(defaultBuilderState)}>
                  重設
                </button>
                <button type="button" onClick={() => setActiveTab('data')}>
                  查看資料
                </button>
              </div>
              <div className="saved-build-list">
                <h3>已保存配置</h3>
                <input
                  onChange={(event) => setSavedBuildQuery(event.target.value)}
                  placeholder="搜尋配置名稱、流派或等階"
                  value={savedBuildQuery}
                />
                {savedBuilds.length === 0 && <p>尚未保存配置。</p>}
                {savedBuilds.length > 0 && filteredSavedBuilds.length === 0 && <p>沒有符合的保存配置。</p>}
                {filteredSavedBuilds.map((item) => (
                  <section key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.buildName || '未選流派'}｜{item.equipmentTier || '未選等階'}</span>
                      <small>保存：{formatSavedAt(item.savedAt)}</small>
                    </div>
                    <div>
                      <button type="button" onClick={() => loadSavedBuild(item.title)}>
                        載入
                      </button>
                      <button type="button" onClick={() => duplicateSavedBuild(item.title)}>
                        複製
                      </button>
                      <button type="button" onClick={() => deleteSavedBuild(item.title)}>
                        刪除
                      </button>
                    </div>
                  </section>
                ))}
              </div>
              <div className="build-import-panel">
                <h3>匯入配置</h3>
                <textarea
                  onChange={(event) => {
                    setBuildImportText(event.target.value)
                    setBuildImportMessage('')
                  }}
                  placeholder="貼上先前匯出的配置 JSON"
                  value={buildImportText}
                />
                <div>
                  <button type="button" onClick={importBuilds} disabled={!buildImportText.trim()}>
                    匯入
                  </button>
                  {buildImportMessage && <span>{buildImportMessage}</span>}
                </div>
              </div>
            </article>
          </aside>
        </section>
      )}

      {activeTab === 'faces' && (
        <section className="content-grid">
          <Notice
            title="萬相集來源說明"
            text="官方公告確認遊戲可透過萬相集、二維碼或口令導入捏臉資料。TapTap 來源目前先標為陸服來源未驗證；若尚未轉換或未在國際服實測，請不要視為國際服可直接使用。"
          />
          <div className="face-filter-bar" aria-label="捏臉角色篩選">
            {(['all', '女角', '男角'] as const).map((option) => (
              <button
                className={faceGenderFilter === option ? 'active' : ''}
                key={option}
                onClick={() => setFaceGenderFilter(option)}
                type="button"
              >
                {option === 'all' ? '全部' : option}
              </button>
            ))}
            <span>
              目前顯示 {visibleFaces.length} / {filteredFaces.length} 筆
            </span>
          </div>
          {visibleFaces.map((item) => (
            <article className="card face-card" key={item.code}>
              <img className="face-preview" src={item.imageUrl} alt={`${item.name} 捏臉預覽`} />
              <div className="card-top">
                <div>
                  <p className="kicker">{item.author}</p>
                  <h2>{item.name}</h2>
                </div>
              </div>
              <span className={`face-source-status status-${getFaceSourceStatus(item)}`}>
                {getFaceSourceStatus(item)}
              </span>
              <div className="code-copy-row">
                <code>{item.code}</code>
                <button type="button" onClick={() => copyText(item.code)}>
                  {copiedCodes.includes(item.code) ? '已複製' : '複製'}
                </button>
              </div>
              <p>{item.sourceNote}</p>
              <TagList tags={item.style} />
              <SourceLink source={item.source} />
            </article>
          ))}
        </section>
      )}

      {activeTab === 'music' && (
        <section className="content-grid">
          {filteredMusic.map((item) => (
            <article className="card" key={item.title}>
              <p className="kicker">{item.type}</p>
              <h2>{item.title}</h2>
              <p>{item.useCase}</p>
              <ol>
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <TagList tags={item.tags} />
              <SourceLink source={item.source} />
            </article>
          ))}
        </section>
      )}

      {activeTab === 'codes' && (
        <section className="content-grid code-grid">
          <Notice
            title="兌換碼提醒"
            text="兌換路徑通常為：設定 -> 其他 -> 兌換碼。每筆兌換碼都會列出最後兌換時間；社群碼若未公告到期日，請以遊戲內回饋為準。回報表單會開啟 GitHub 回報單，仍需站長人工確認後更新。"
          />
          <div className="code-stats-grid">
            <section>
              <strong>{redeemCodes.length}</strong>
              <span>全部兌換碼</span>
            </section>
            <section>
              <strong>{codeStatusSummary.active}</strong>
              <span>未過期</span>
            </section>
            <section>
              <strong>{codeStatusSummary.uncertain}</strong>
              <span>未確定過期</span>
            </section>
            <section>
              <strong>{codeStatusSummary.expired}</strong>
              <span>已過期</span>
            </section>
            <section>
              <strong>{codeStatusSummary.copied}</strong>
              <span>已複製</span>
            </section>
            <section>
              <strong>{newestCodeDate ?? today}</strong>
              <span>最新日期</span>
            </section>
          </div>
          <div className="code-filter-bar">
            <label>
              <span>年份</span>
              <select
                onChange={(event) => setCodeYearFilter(event.target.value)}
                value={codeYearFilter}
              >
                <option value="all">全部年份</option>
                {codeYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year} 年
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>月份</span>
              <select
                onChange={(event) => setCodeMonthFilter(event.target.value)}
                value={codeMonthFilter}
              >
                <option value="all">全部月份</option>
                {codeMonthOptions.map((month) => (
                  <option key={month} value={month}>
                    {Number(month)} 月
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>狀態</span>
              <select
                onChange={(event) => setCodeExpiryFilter(event.target.value as CodeExpiryFilter)}
                value={codeExpiryFilter}
              >
                <option value="all">全部狀態</option>
                <option value="active">未過期</option>
                <option value="expired">已過期</option>
                <option value="uncertain">未確定過期</option>
              </select>
            </label>
          </div>
          <article className="card code-report-panel">
            <div>
              <p className="kicker">回報</p>
              <h2>回報兌換碼狀態</h2>
            </div>
            <div className="code-report-grid">
              <label>
                <span>回報主題</span>
                <select
                  onChange={(event) => setCodeReportTopic(event.target.value as CodeReportTopic)}
                  value={codeReportTopic}
                >
                  <option value="過期">過期</option>
                  <option value="無效">無效</option>
                  <option value="其他">其他</option>
                </select>
              </label>
              <label>
                <span>兌換碼</span>
                <input
                  onChange={(event) => setCodeReportCode(event.target.value.toUpperCase())}
                  placeholder="可貼上或點下方單筆填入"
                  value={codeReportCode}
                />
              </label>
            </div>
            <label className="code-report-message">
              <span>留言，最多 100 字</span>
              <textarea
                maxLength={100}
                onChange={(event) => setCodeReportMessage(event.target.value.slice(0, 100))}
                placeholder="例如：7/12 測試顯示已過期"
                value={codeReportMessage}
              />
              <small>{codeReportMessage.length} / 100</small>
            </label>
            <div className="code-report-actions">
              <button type="button" onClick={() => copyText(codeReportCode)} disabled={!codeReportCode.trim()}>
                複製回報碼
              </button>
              <button type="button" onClick={openCodeReport} disabled={!codeReportCode.trim()}>
                送出回報
              </button>
            </div>
          </article>
          {codePagination}
          {pagedCodes.map((item) => (
            <article className="card code-card" key={`${item.code}-${item.date}`}>
              <div className="card-top">
                <div>
                  <p className="kicker">{item.date}</p>
                  <h2>{item.code}</h2>
                </div>
                <button type="button" onClick={() => copyText(item.code)}>
                  {copiedCodes.includes(item.code) ? '已複製' : '複製'}
                </button>
              </div>
              <p>{item.reward}</p>
              <p className="expiry">
                <strong>最後兌換時間</strong>
                <span>{item.expiresAt}</span>
              </p>
              <span className={`status status-${item.status}`}>{item.status}</span>
              <button className="report-expired-link" type="button" onClick={() => fillCodeReport(item.code)}>
                填入回報
              </button>
              <SourceLink source={item.source} />
            </article>
          ))}
          {codePagination}
        </section>
      )}

      {activeTab === 'converter' && (
        <section className="content-grid converter-grid">
          <Notice
            title="臉碼轉換狀態"
            text="目前沒有官方公開的陸服轉國際服演算法或 API；此頁先作為待轉換與人工驗證流程。若之後取得可用轉換對照或可信工具，再把資料回填到國際服確認清單。"
          />
          <article className="card converter-card">
            <p className="kicker">陸服碼</p>
            <h2>陸服臉碼</h2>
            <textarea
              onChange={(event) => setCnFaceCode(event.target.value)}
              placeholder="貼上 TapTap / 陸服來源臉碼"
              value={cnFaceCode}
            />
            <button type="button" onClick={() => copyText(cnFaceCode)} disabled={!cnFaceCode.trim()}>
              {copiedCodes.includes(cnFaceCode) ? '已複製' : '複製陸服碼'}
            </button>
          </article>
          <article className="card converter-card">
            <p className="kicker">國際服碼</p>
            <h2>國際服臉碼</h2>
            <textarea
              onChange={(event) => setGlobalFaceCode(event.target.value)}
              placeholder="轉換後、且已在國際服確認可用的臉碼可暫存在這裡"
              value={globalFaceCode}
            />
            <button
              type="button"
              onClick={() => copyText(globalFaceCode)}
              disabled={!globalFaceCode.trim()}
            >
              {copiedCodes.includes(globalFaceCode) ? '已複製' : '複製國際服碼'}
            </button>
          </article>
          <article className="card converter-note">
            <p className="kicker">流程</p>
            <h2>建議流程</h2>
            <ol>
              <li>先把 TapTap 或陸服來源資料標成「陸服來源未驗證」。</li>
              <li>使用可信社群工具取得國際服碼。</li>
              <li>在國際服實際匯入確認可用。</li>
              <li>回填網站資料並改成「國際服確認」。</li>
            </ol>
            <TagList tags={['待轉換', '人工驗證', '可回填']} />
          </article>
          <article className="card converter-note">
            <p className="kicker">參考</p>
            <h2>參考工具</h2>
            <p>這些是社群工具或教學來源，不是官方轉碼 API；使用前仍建議自行確認安全性與可用性。</p>
            <SourceLink source={{ label: '社群臉碼轉換工具', url: sources.wwmPresets }} />
            <SourceLink source={{ label: '社群平台轉換工具說明', url: sources.steamPresetBot }} />
            <SourceLink source={{ label: '巴哈：陸服到國際服捏臉碼轉換分享', url: sources.bahaFaceConvert }} />
            <SourceLink source={{ label: 'YouTube：陸服捏臉碼轉國際服教學', url: sources.youtubeFaceConvert }} />
            <SourceLink source={{ label: '臉碼轉換工具社群', url: sources.wwmWorkshopDiscord }} />
          </article>
        </section>
      )}

      <footer className="site-footer">
        <button type="button" onClick={scrollToTop}>
          回到頁首
        </button>
      </footer>
    </main>
  )
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <aside className="notice">
      <h2>{title}</h2>
      <p>{text}</p>
    </aside>
  )
}

function DataDetails({ sectionTitle, item }: { sectionTitle: string; item: DataEntry }) {
  if (sectionTitle === '心法資料') {
    const levels = item.details.filter((detail) => /^第[一二三四五六]重：/.test(detail))
    const basics = item.details.filter((detail) => !/^第[一二三四五六]重：/.test(detail))

    return (
      <div className="data-detail-panel mindset-detail">
        <div className="data-detail-grid">
          {basics.map((detail) => {
            const { label, value } = splitDetail(detail)

            return (
              <div className="data-detail-field" key={detail}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            )
          })}
        </div>
        <div className="level-list">
          {levels.map((detail) => {
            const { label, value } = splitDetail(detail)

            return (
              <div className="level-row" key={detail}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (sectionTitle === '流派配置') {
    const summaryDetails = item.details.slice(0, 6)
    const note = item.details[6]

    return (
      <div className="data-detail-panel build-detail">
        <div className="data-detail-grid">
          {summaryDetails.map((detail) => {
            const { label, value } = splitDetail(detail)

            return (
              <div className="data-detail-field" key={detail}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            )
          })}
        </div>
        {note && <p className="build-note">{note}</p>}
      </div>
    )
  }

  if (sectionTitle === '裝備等階' || sectionTitle === '部位詞綴限制') {
    return (
      <div className="data-detail-panel equipment-tier-detail">
        <div className="data-detail-grid">
          {item.details.map((detail) => {
            const { label, value } = splitDetail(detail)

            return (
              <div className="data-detail-field" key={detail}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <ol>
      {item.details.map((detail) => (
        <li key={detail}>{detail}</li>
      ))}
    </ol>
  )
}

function splitDetail(detail: string) {
  const delimiter = detail.indexOf('：')

  if (delimiter === -1) {
    return { label: '說明', value: detail }
  }

  return {
    label: detail.slice(0, delimiter),
    value: detail.slice(delimiter + 1),
  }
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  )
}

function DataStatusTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="data-status-tags">
      {tags.map((tag) => (
        <span className={`data-status-${tag}`} key={tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}

function SourceLink({ source }: { source: Source }) {
  return (
    <a className="source-link" href={source.url} rel="noreferrer" target="_blank">
      來源：{source.label}
    </a>
  )
}

export default App
