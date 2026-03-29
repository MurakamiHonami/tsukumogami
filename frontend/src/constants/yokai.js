export const yokaiImageMap = {
  河童: 'kappa.png',
  九尾: 'kyuubi.png',
  猫又: 'nekomata.png',
  おばけ: 'obake.png',
  一反木綿: 'ittanmomen.png',
  一つ目小僧: 'hitotsume_kozou.png',
  傘妖怪: 'kasa_youkai.png',
};

// グループ分け（A/B/C）
export const yokaiGroup = {
  A: ['河童', '一つ目小僧', '一反木綿'],
  B: ['九尾', '猫又'],
  C: ['おばけ', '傘妖怪'],
};

// 全体リスト（既存用）
export const yokaiList = Object.keys(yokaiImageMap);

// 全体ランダム（ヘッダー用）
export function getRandomYokai() {
  return yokaiList[Math.floor(Math.random() * yokaiList.length)];
}

//  カテゴリ別ランダム
export function getRandomYokaiByCategory(category) {
  const list = yokaiGroup[category] || yokaiList;
  return list[Math.floor(Math.random() * list.length)];
}