/** 游戏阶段 —— 抽牌；选牌；出牌；结束 */
declare type GameStatus = 'draw' | 'pick' | 'play' | 'end'

declare type TreeType = 'apple' | 'pear' | 'plum'

declare interface Card {
  index: number
  trees: TreeType[]
}

declare type Hand = 'left' | 'right'
