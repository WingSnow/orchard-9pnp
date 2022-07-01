<script setup lang="ts">
defineProps<{
  cardNum?: number | null
  showBack?: boolean
}>()
</script>

<template>
  <div class="card-container">
    <div class="card" :class="{ showBack: showBack }">
      <div class="front">
        <img
          v-if="Number.isInteger(cardNum)"
          :src="`/resource/cardFace/${cardNum}.jpg`"
        />
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
  border-radius: 10%;
  transform-style: preserve-3d;
}

.card {
  height: 100%;
  width: 100%;
  position: relative;
  transform-style: preserve-3d;

  .front,
  .back {
    height: 100%;
    width: 100%;
    position: absolute;
    border: 1px solid rgb(0 0 0);
    border-radius: 10%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .front {
    background-color: white;

    backface-visibility: hidden;
  }

  .back {
    transform: rotateY(180deg);
    backface-visibility: hidden;
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
