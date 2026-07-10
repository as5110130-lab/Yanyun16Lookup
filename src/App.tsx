import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab = 'faces' | 'music' | 'martial' | 'codes'
type Source = { label: string; url: string }

type FacePreset = {
  name: string
  author: string
  code: string
  style: string[]
  sourceNote: string
  source: Source
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
  status: '官方確認' | '社群彙整' | '可能過期'
  source: Source
}

const today = '2026-07-10'
const codesPerPage = 10

const sources = {
  officialFace:
    'https://www.yysls.cn/news/official/20250107/37780_1204881.html',
  officialFix: 'https://www.yysls.cn/news/update/20260529/40412_1302289.html',
  taptapFaces: 'https://www.taptap.cn/moment/626025738641869176',
  taptapGuide: 'https://www.taptap.cn/moment/625904977906240486',
  gamersky: 'https://www.gamersky.com/handbook/202601/2073807.shtml',
  threeDm: 'https://www.3dmgame.com/gl/3976209.html',
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
  arlenCodes: 'https://www.arlenfuture.com/games/where-winds-meet-codes/',
  youtubeJulyCodes: 'https://www.youtube.com/post/UgkxDtv_rgo58IPJSaOVp0nYQKHF_co1Fy5Y',
  musicGuide: 'https://news.17173.com/content/11022025/192549381.shtml',
  musicForum: 'https://forum.gamer.com.tw/C.php?bsn=75703&snA=6014',
}

const facePresets: FacePreset[] = [
  {
    name: '深雪',
    author: '水咲',
    code: 'ARTZ2+TGEBa4Rgec96w',
    style: ['女角', '冷感', '萬相集公開'],
    sourceNote: 'TapTap 轉載標註：資料來自遊戲內萬相集公開資料。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '點絳唇',
    author: '幻闕歌',
    code: 'ARTZ3K/SqmG8gckuoLD',
    style: ['女角', '古典', '萬相集公開'],
    sourceNote: '官方公告確認可透過萬相集、二維碼或口令匯入捏臉資料。',
    source: { label: '官方萬相集匯入說明', url: sources.officialFace },
  },
  {
    name: '寧姚',
    author: '風翎絮',
    code: 'ARTZ2+cZpK56JcOuaD2',
    style: ['女角', '俐落', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '浣溪沙',
    author: '幻闕歌',
    code: 'ARTZ3Zfs6mG8vgjMgMb',
    style: ['女角', '柔和', '萬相集公開'],
    sourceNote: '複製口令後可於遊戲內識別匯入。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '淡妝',
    author: '沈知書',
    code: 'ARTZ3I2ZOaX8IXNg+Ti',
    style: ['女角', '淡雅', '萬相集公開'],
    sourceNote: '若萬相集作品被設為不可套用，請以遊戲內狀態為準。',
    source: { label: '官方萬相集修復公告', url: sources.officialFix },
  },
  {
    name: '楚楚可憐小狐狸',
    author: '祈雪千千鈴',
    code: 'ARTZ25R4Prt2QLTTu9f',
    style: ['女角', '可愛', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '風',
    author: '聶莫黎',
    code: 'ARTZ24NlI29q4QFFThj',
    style: ['女角', '清冷', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
  {
    name: '師姐',
    author: '晚聲',
    code: 'ARTZ3EFpifzWpUiyVRS',
    style: ['女角', '成熟', '萬相集公開'],
    sourceNote: '來自遊戲內萬相集公開資料整理。',
    source: { label: 'TapTap 萬相集公開捏臉整理', url: sources.taptapFaces },
  },
]

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
    role: '新手穩定 / PVE 通用',
    difficulty: '低',
    hearts: ['易水歌', '無名心法', '千山法', '威猛歌'],
    scenes: ['大世界探索', '團本副本', '非競速日常'],
    notes: '容錯率高，適合剛入坑先熟悉卸勢、蓄力與切武學節奏。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '鳴金影',
    weapons: '積矩九劍 + 九曲驚神槍',
    role: '連段輸出 / 帥氣操作',
    difficulty: '中',
    hearts: ['易水歌', '劍氣縱橫', '逐狼心經', '凝神章'],
    scenes: ['大世界探索', '團本副本', '連段練習'],
    notes: '操作感強，適合喜歡切槍接連段與追求手感的玩家。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '裂石威',
    weapons: '嗟夫刀法 + 八方風雷槍',
    role: '坦度 / 近戰抗壓',
    difficulty: '中',
    hearts: ['易水歌', '山河絕韻', '抗造大法', '威猛歌'],
    scenes: ['副本抗壓', '日常探索', '團本 T 位備選'],
    notes: '若走坦位可改抗造大法、磐石決、明晦同塵、丹心篆。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '牽絲玉',
    weapons: '青山執筆 + 九重春色',
    role: '遠程 / 新手友善',
    difficulty: '低',
    hearts: ['易水歌', '花上月令', '縱地摘星', '明晦同塵'],
    scenes: ['大世界探索', '團本副本', '安全距離輸出'],
    notes: '飛天玉和走地玉都可用；征人歸通常需要較高重數再替換。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '牽絲霖',
    weapons: '明川藥典 + 千香引魂蠱',
    role: '治療 / 團隊支援',
    difficulty: '中',
    hearts: ['易水歌', '君臣藥', '杏花不見', '牽絲蠱'],
    scenes: ['團本純奶', '多人副本', '支援位'],
    notes: '日常可改火拳奶玩法，但純奶團本仍以治療心法為核心。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '破竹風',
    weapons: '泥犁三垢 + 粟子游塵',
    role: '爆發 / 機動',
    difficulty: '高',
    hearts: ['易水歌', '忘川絕響', '心彌泥魚', '極樂泣血'],
    scenes: ['大世界探索', '團本副本', '爆發輸出'],
    notes: '追求競速可考慮斷石之構，但通常要求重數門檻。',
    source: { label: '游民星空 PVE 心法搭配', url: sources.gamersky },
  },
  {
    name: '破竹鳶',
    weapons: '天志垂象 + 千機鎖天',
    role: '泛用輸出 / 版本熱門',
    difficulty: '中',
    hearts: ['易水歌', '扶搖直上', '擒天勢', '三窮致知'],
    scenes: ['大世界探索', '團本副本', '泛用輸出'],
    notes: '3DM 與游民星空都列出此組心法，適合想補足泛用輸出的玩家。',
    source: { label: '3DM 全流派心法整理', url: sources.threeDm },
  },
]

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
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 100、共鳴旋律 x1、錢幣 x20,000。',
    status: '社群彙整',
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
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 40、內道筆記寶箱 x1。',
    status: '社群彙整',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'LIANGZHOUGO',
    date: '2026-06-03',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '回響玉 30、內道筆記寶箱 x1、錢幣 x3,000。',
    status: '社群彙整',
    source: { label: 'BlueStacks 2026-06 禮包碼整理', url: sources.blueStacks },
  },
  {
    code: 'XDKHDDPPKN',
    date: '2026-06-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '6/18 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'YQTWNQKJJE',
    date: '2026-06-19',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'KTJWN6EQR6',
    date: '2026-06-19',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '社群近期禮包碼彙整', url: sources.bahaCodes },
  },
  {
    code: 'ESJCRRJC64',
    date: '2026-06-19',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '6/19 社群彙整碼，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
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
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'NK4AJFPDWC',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'JJXDTKCD8Y',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'swcqqqhwae',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'KPC346C44A',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'PJCXEP4MFT',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'FHHXEYRJAN',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'APE6NNXY4K',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'NDETCQEXHF',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
  },
  {
    code: 'CP8WMH8W4C',
    date: '2026-07-04',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '7/4 社群提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供 7/4 序號', url: sources.bahaCodes },
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
    reward: 'Facebook 國際服彙整：Echo Jade、通寶、心法箱類獎勵，實際以遊戲內為準。',
    status: '社群彙整',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGLtiktok',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：Echo Jade、通寶類獎勵，實際以遊戲內為準。',
    status: '社群彙整',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGO1114',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：Echo Jade、共鳴旋律類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWM251115',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：Echo Jade、通寶、名牌類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'WWMGO1115',
    date: '2025-11-18',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：Echo Jade 類獎勵，實際以遊戲內為準。',
    status: '可能過期',
    source: { label: 'Facebook 國際服兌換碼彙整', url: sources.facebookGlobalCodes },
  },
  {
    code: 'DEVLOG2601',
    date: '2026-01-29',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook 國際服彙整：長鳴玉 / Echo Jade、通寶類獎勵。',
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
    reward: 'Facebook / Where Winds Meet 社群彙整：Echo Jade 40、通寶 20,000。',
    status: '可能過期',
    source: { label: 'Facebook WWMDEVTALK 貼文', url: sources.facebookWwmDevTalk },
  },
  {
    code: 'WWMBind01',
    date: '2026-05',
    expiresAt: '未公告，請以遊戲內為準',
    reward: 'Facebook Where Winds Meet 貼文彙整：Echo Jade、共鳴旋律、通寶類獎勵。',
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
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FHKD7HHWRJ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HD8PHDX443',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NKTTCPETYC',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KAAYFMX7HP',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'MKTQJR3DMA',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RNTF3MMTMR',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HSWW3NCEKY',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HSM84QD8DQ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'PXYR8M4AJJ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FXA7WPXP6C',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HD4CRCHPTN',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'WH7PRYFFPA',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'MAWQA8HR48',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'ARN8KQJAET',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RP68WW3NY6',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'QSD4JECMQD',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NSAHT7AHKJ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'YY3NQAJ7WJ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'FN6AHA3T7N',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'SE3RNWEDAT',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'RYCDP8MMNH',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KERYF4RXM4',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KJ4YF433MN',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KWAFCWDFJF',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'XQFWEQMKMX',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'KRDA7X3AXY',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'CW4AP7AA6T',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'NY4TTJKEKQ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'PAM46YAQ86',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'EKMW673Q8A',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HK367A6FDJ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'DTXHCJ6DNN',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'TD8XMRKJMK',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'THMQNAFXQC',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'YYP4QNC7NQ',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
  {
    code: 'HH6AM6C8RF',
    date: '2026-07-10',
    expiresAt: '未公告，請以遊戲內為準',
    reward: '使用者提供序號，獎勵以遊戲內收件匣為準。',
    status: '社群彙整',
    source: { label: '使用者提供序號', url: sources.bahaCodes },
  },
]

const tabMeta: Record<Tab, { label: string; hint: string }> = {
  faces: { label: '捏臉數據', hint: '官方萬相集公開口令與使用說明' },
  music: { label: '戲樂數據', hint: '戲樂模式、動作套用與版本狀態' },
  martial: { label: '武學流派', hint: '主副武學、心法、場景與難度' },
  codes: { label: '兌換碼', hint: `整理範圍：2026-05 到 ${today}` },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('codes')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const [codesPage, setCodesPage] = useState(1)

  const queryText = query.trim().toLowerCase()

  useEffect(() => {
    setCodesPage(1)
  }, [queryText])

  const filteredFaces = useMemo(
    () =>
      facePresets.filter((item) =>
        [item.name, item.author, item.code, ...item.style, item.sourceNote]
          .join(' ')
          .toLowerCase()
          .includes(queryText),
      ),
    [queryText],
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

  const filteredBuilds = useMemo(
    () =>
      martialBuilds.filter((item) =>
        [
          item.name,
          item.weapons,
          item.role,
          item.difficulty,
          item.notes,
          ...item.hearts,
          ...item.scenes,
        ]
          .join(' ')
          .toLowerCase()
          .includes(queryText),
      ),
    [queryText],
  )

  const filteredCodes = useMemo(
    () =>
      redeemCodes
        .filter((item) =>
          [item.code, item.date, item.expiresAt, item.reward, item.status, item.source.label]
            .join(' ')
            .toLowerCase()
            .includes(queryText),
        )
        .sort(
          (first, second) =>
            second.date.localeCompare(first.date) || first.code.localeCompare(second.code),
        ),
    [queryText],
  )

  const totalCodePages = Math.max(1, Math.ceil(filteredCodes.length / codesPerPage))
  const safeCodesPage = Math.min(codesPage, totalCodePages)
  const pagedCodes = filteredCodes.slice(
    (safeCodesPage - 1) * codesPerPage,
    safeCodesPage * codesPerPage,
  )

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    window.setTimeout(() => setCopied(''), 1500)
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Where Winds Meet Lookup</p>
          <h1>燕雲十六聲資料查詢</h1>
          <p className="subtitle">
            捏臉、戲樂、武學流派與 2026 年 5 月至今兌換碼整理。資料已標註來源，兌換碼有效性仍以遊戲內為準。
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

      {activeTab === 'faces' && (
        <section className="content-grid">
          <Notice
            title="萬相集來源說明"
            text="官方公告確認遊戲可透過萬相集、二維碼或口令導入捏臉資料。下列口令取自標註為「遊戲內萬相集公開資料」的公開整理；若作品後續被作者改為不可套用，請以遊戲內顯示為準。"
          />
          {filteredFaces.map((item) => (
            <article className="card face-card" key={item.code}>
              <div className="card-top">
                <div>
                  <p className="kicker">{item.author}</p>
                  <h2>{item.name}</h2>
                </div>
                <button type="button" onClick={() => copyText(item.code)}>
                  {copied === item.code ? '已複製' : '複製'}
                </button>
              </div>
              <code>{item.code}</code>
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

      {activeTab === 'martial' && (
        <section className="content-grid">
          {filteredBuilds.map((item) => (
            <article className="card build-card" key={item.name}>
              <div className="card-top">
                <div>
                  <p className="kicker">{item.role}</p>
                  <h2>{item.name}</h2>
                </div>
                <span className="pill">難度 {item.difficulty}</span>
              </div>
              <p className="weapons">{item.weapons}</p>
              <div>
                <h3>心法</h3>
                <TagList tags={item.hearts} />
              </div>
              <div>
                <h3>適合場景</h3>
                <TagList tags={item.scenes} />
              </div>
              <p>{item.notes}</p>
              <SourceLink source={item.source} />
            </article>
          ))}
        </section>
      )}

      {activeTab === 'codes' && (
        <section className="content-grid code-grid">
          <Notice
            title="兌換碼提醒"
            text="兌換路徑通常為：設定 -> 其他 -> 兌換碼。每筆兌換碼都會列出最後兌換時間；社群碼若未公告到期日，請以遊戲內回饋為準。"
          />
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
          {pagedCodes.map((item) => (
            <article className="card code-card" key={`${item.code}-${item.date}`}>
              <div className="card-top">
                <div>
                  <p className="kicker">{item.date}</p>
                  <h2>{item.code}</h2>
                </div>
                <button type="button" onClick={() => copyText(item.code)}>
                  {copied === item.code ? '已複製' : '複製'}
                </button>
              </div>
              <p>{item.reward}</p>
              <p className="expiry">
                <strong>最後兌換時間</strong>
                <span>{item.expiresAt}</span>
              </p>
              <span className={`status status-${item.status}`}>{item.status}</span>
              <SourceLink source={item.source} />
            </article>
          ))}
        </section>
      )}
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

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
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
