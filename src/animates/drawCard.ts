import gsap from 'gsap'

/** 获取卡槽的位置（相对于GameDesktopView，因为过渡牌在View里），因为窗口大小改变后卡槽的位置会变，所以需要每次播放抽卡动画时实时获取 */
const getSlotPosition = () => {
  const position = {
    pile: { x: 0, y: 0, width: 0, height: 0 },
    hand1: { x: 0, y: 0, width: 0, height: 0 },
    hand2: { x: 0, y: 0, width: 0, height: 0 },
  }
  const pile = document.getElementById('pile-slot')
  const hand1 = document.getElementById('hand-slot-1')
  const hand2 = document.getElementById('hand-slot-2')
  if (!pile || !hand1 || !hand2) {
    throw new Error()
  }
  let { x, y, width, height } = pile.getBoundingClientRect()
  position.pile = { x, y, width, height }
  ;({ x, y, width, height } = hand1.getBoundingClientRect())
  // 因为手牌都是旋转了90°的，所以计算位置（左边缘和上边缘距离屏幕左侧和顶部的距离）时要进行转换
  position.hand1 = {
    x: x + (width - height) / 2,
    y: y - (width - height) / 2,
    width,
    height,
  }
  ;({ x, y, width, height } = hand2.getBoundingClientRect())
  position.hand2 = {
    x: x + (width - height) / 2,
    y: y - (width - height) / 2,
    width,
    height,
  }
  return position
}

/**抽卡动画，将过渡牌从牌堆移动到手牌的指定位置 */
const drawCard = async (hand: Hand) => {
  const position = getSlotPosition()
  const from = position.pile
  const to = hand === 'left' ? position.hand1 : position.hand2
  const timeline = gsap.timeline()
  await timeline
    .fromTo(
      '#transition-card',
      {
        left: from.x,
        top: from.y,
        visibility: 'visible',
        height: from.height,
        width: from.width,
        rotateY: 180,
        rotateZ: 0,
      },
      {
        left: '80vw',
        top: '20vh',
        height: to.width * 1.5,
        width: to.height * 1.5,
        rotateY: 0,
        rotateZ: 90,
        duration: 1.5,
      }
    )
    .to('#transition-card', {
      left: to.x,
      top: to.y,
      height: to.width,
      width: to.height,
      duration: 1.5,
      delay: 1,
    })
    .then(() => {
      gsap.set('#transition-card', {
        visibility: 'hidden',
      })
    })
}

export default drawCard
