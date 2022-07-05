/** 游戏阶段 —— 抽牌；选牌；出牌；结束 */
declare type GameStatus = 'draw' | 'pick' | 'play' | 'end' | 'transition'

/** 果树类型 —— 苹果、梨子、梅子 */
declare type TreeType = 'apple' | 'pear' | 'plum'

/** 果园地块类型 —— 苹果、梨子、梅子、坏果 */
declare type UnitType = TreeType | 'rot'

/** 卡面 */
declare interface CardData {
  index: number
  trees: TreeType[]
}

declare type Hand = 'left' | 'right'
