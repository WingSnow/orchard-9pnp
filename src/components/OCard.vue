<script setup lang="ts">
defineProps<{
  cardNum: number
  showBack?: boolean
}>()
</script>

<template>
  <div class="card-container">
    <div class="card" :class="{ showBack: showBack }">
      <div class="front">
        <img :src="`/resource/cardFace/${cardNum}.jpg`" />
      </div>
      <div class="back">
        <img src="/resource/cardBack.jpg" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  height: 150px;
  width: 100px;
}

.card {
  height: 100%;
  width: 100%;
  position: relative;

  .front,
  .back {
    height: 100%;
    width: 100%;
    backface-visibility: hidden;
    position: absolute;
    border: 1px solid black;
    transition: all 1s ease-in-out;
    border-radius: 10%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .front {
    background-color: white;
    transform: rotateY(0deg);
  }

  .back {
    transform: rotateY(-180deg);
  }

  &.showBack {
    .front {
      background-color: white;
      transform: rotateY(180deg);
    }

    .back {
      transform: rotateY(0deg);
    }
  }
}
</style>
