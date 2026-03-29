export const yokaiImageMap = {
  鬼: 'oni.png',
  提灯お化け: 'chouchin.png',
  招き猫: 'manekineko.png',
  傘地蔵: 'kasajizou.png',
  化け猫: 'bakeneko.png',
  唐傘おばけ: 'kasa_youkai.png',
  座敷童子: 'zashiki_warashi.png',
  狸: 'tanuki.png',
  河童: 'kappa.png',
  だるま: 'daruma_red.png',
  九尾: 'kyuubi.png',
  猫又: 'nekomata.png',
  おばけ: 'obake.png',
  一反木綿: 'ittanmomen.png',
  一つ目小僧: 'hitotsume_kozou.png',
  傘妖怪: 'kasa_youkai.png',
};

// カテゴリ名ごとのグループ
export const yokaiGroup = {
  火災警報器: ['河童', '一つ目小僧', '一反木綿'],
  冷蔵庫: ['九尾', '猫又'],
  電池: ['おばけ', '傘妖怪'],
  衛生用品: ['座敷童子'],
  掃除用品: ['狸'],
  家電: ['だるま'],
  食品: ['化け猫', '鬼', '提灯お化け'],
  その他: ['唐傘おばけ', '傘地蔵', '招き猫'],
};

// 全体リスト
export const yokaiList = Object.keys(yokaiImageMap);

// グループからランダムに妖怪を取得
export function getRandomYokaiByCategory(category) {
  const list = yokaiGroup[category] || yokaiList; // categoryがなければ全体から
  const name = list[Math.floor(Math.random() * list.length)];
  const image = yokaiImageMap[name];
  return { name, image };
}

// 全体からランダム
export function getRandomYokai() {
  const name = yokaiList[Math.floor(Math.random() * yokaiList.length)];
  const image = yokaiImageMap[name];
  return { name, image };
}