<template>
  <div class="page-box">
    <div v-if="page.cutBefore && !page.remove" class="divider-vert" data-content="CUT"></div>
    <div v-if="page.cutBefore && !page.remove" class="split-box">
      <div class="input-group">
        <input class="form-input" placeholder="filename" type="text" v-model="page.data.name" />
        <button
          @click="store.split({ page, split: false })"
          class="split-end btn btn-action btn-primary input-group-btn"
        >
          <i class="icon material-icons">content_cut</i>
        </button>
      </div>
    </div>
    <div class="page">
      <img
        :src="page.thumb"
        :class="{ remove: page.remove }"
        :style="{ transform: 'rotate3d(0, 0, 1, ' + page.angle + 'deg)' }"
      />
      <button
        v-if="!page.cutBefore"
        @click="store.split({ page, split: true })"
        class="split-start btn btn-action"
      >
        <i class="icon material-icons">content_cut</i>
      </button>
      <button @click="store.rotate({ page, angle: -90 })" class="rotate-left btn btn-action">
        <i class="icon material-icons">rotate_left</i>
      </button>
      <button
        @click="store.remove({ page, remove: true })"
        class="remove btn btn-action"
        v-if="!page.remove"
      >
        <i class="icon material-icons">visibility_off</i>
      </button>
      <button
        @click="store.remove({ page, remove: false })"
        class="remove btn btn-action"
        v-if="page.remove"
      >
        <i class="icon material-icons">visibility</i>
      </button>
      <button @click="store.rotate({ page, angle: 90 })" class="rotate-right btn btn-action">
        <i class="icon material-icons">rotate_right</i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePdfStore } from '@/stores'

defineProps({
  page: {
    type: Object,
    required: true,
  },
})

const store = usePdfStore()
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.page-box {
  display: flex;
  flex-direction: row;
  margin: 22px 22px;
}

.page-box .split-box {
  width: 150px;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  align-items: center;
  padding: 10px;
}

.page {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  flex-grow: 0;
}

.page img {
  transition: 0.3s;
  box-shadow:
    0 0 5px rgba(0, 0, 0, 0.2),
    inset 0 0 50px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  max-height: 100%;
}

.page img.remove {
  opacity: 0.2;
}

.page .btn {
  position: absolute;
}

.page .rotate-right {
  bottom: 0;
  right: 0;
}

.page .rotate-left {
  bottom: 0;
  left: 0;
}

.page .remove {
  top: 0;
  right: 0;
}

.page .split-start {
  top: 0;
  left: 0;
}
</style>
