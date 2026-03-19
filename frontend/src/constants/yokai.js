export const yokaiImageMap = {
  河童: 'kappa.png',
  九尾: 'kyuubi.png',
  猫又: 'nekomata.png',
  おばけ: 'obake.png',
  一反木綿: 'ittanmomen.png',
  一つ目小僧: 'hitotsume_kozou.png',
  傘妖怪: 'kasa_youkai.png',
}

export const yokaiList = Object.keys(yokaiImageMap)

export function getRandomYokai() {
  return yokaiList[Math.floor(Math.random() * yokaiList.length)]
}
