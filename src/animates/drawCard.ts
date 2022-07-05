import gsap from 'gsap'

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
