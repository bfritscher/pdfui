<template>
  <div id="app">
    <header>
      <section class="container grid-960">
        <nav class="navbar">
          <section class="navbar-section">
            <a href="#" class="navbar-brand mr-10">PDF UI</a>
            <a href="https://github.com/bfritscher/pdfui" class="btn btn-link">GitHub</a>
          </section>
          <section class="navbar-center">
            <div class="input-group">
              <span class="input-group-addon">Batch</span>
              <input type="text" class="form-input" v-model="range" />
              <button
                @click="store.batch({ action: 'rotate', params: { angle: -90 } })"
                class="rotate-left btn btn-action input-group-btn"
              >
                <i class="icon material-icons">rotate_left</i>
              </button>
              <button
                @click="store.batch({ action: 'rotate', params: { angle: 90 } })"
                class="rotate-right btn btn-action input-group-btn"
              >
                <i class="icon material-icons">rotate_right</i>
              </button>
              <button
                @click="store.batch({ action: 'remove', params: { remove: true } })"
                class="remove btn btn-action input-group-btn"
              >
                <i class="icon material-icons">visibility_off</i>
              </button>
              <button
                @click="store.batch({ action: 'remove', params: { remove: false } })"
                class="remove btn btn-action input-group-btn"
              >
                <i class="icon material-icons">visibility</i>
              </button>
            </div>
          </section>
          <section class="navbar-section">
            <button
              class="btn btn-primary btn-lg ml-10"
              :disabled="store.pages.length === 0"
              @click="exportPdf"
            >
              Export PDFs
            </button>
            <button class="btn btn-action ml-10" title="reset" @click="reset">
              <i class="icon material-icons">restore_page</i>
            </button>
          </section>
        </nav>
      </section>
    </header>
    <div class="content container grid-960">
      <div class="toast toast-error" v-if="errors.length > 0">
        <p v-for="e in errors" :key="e.message">
          <strong>{{ e.type }} (row: {{ e.row }}):</strong> {{ e.message }}.
        </p>
      </div>
      <div ref="dropzoneElement" id="myVueDropzone" class="dropzone"></div>
      <div class="pages" ref="pagesRef">
        <page
          v-for="page in dndPages"
          :key="page.src + page.page"
          :page="page"
          @preview="openPreview"
        ></page>
      </div>
    </div>
    <div class="modal" :class="{ active: showPreviewModal }">
      <div class="modal-overlay" @click="showPreviewModal = false"></div>
      <div class="modal-container preview-modal-container">
        <div class="modal-header">
          <button class="btn btn-clear float-right" @click="showPreviewModal = false"></button>
          <div class="modal-title">Page Preview</div>
        </div>
        <div class="modal-body preview-modal-body">
          <img v-if="previewSrc" :src="previewSrc" class="preview-image" />
        </div>
      </div>
    </div>
    <div class="modal" :class="{ active: showModal }">
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <button class="btn btn-clear float-right" @click="showModal = false"></button>
          <div class="modal-title">Export PDFs</div>
        </div>
        <div class="modal-body">
          <div class="loading" v-show="exportFiles.length === 0"></div>
          <div class="form-group" v-for="file in exportFiles" :key="file.name">
            <label class="form-checkbox">
              <input type="checkbox" v-model="zipFiles" :value="file.name" />
              <i class="form-icon"></i> <a :href="file.href" target="_blank">{{ file.name }}</a>
            </label>
          </div>
          <button
            class="btn btn-lg btn-primary btn-block"
            v-show="exportFiles.length"
            @click="postTo('/zip')"
          >
            Download ZIP
          </button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-block" v-show="exportFiles.length > 0" @click="postTo('/mafp')">
            Send to Moodle Assignment Feedback Packager
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Dropzone from '@deltablot/dropzone'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import '@deltablot/dropzone/dist/dropzone.css'

import Page from './components/Page.vue'
import { usePdfStore } from './stores'

const store = usePdfStore()
const errors = ref([])
const exportFiles = ref([])
const zipFiles = ref([])
const showModal = ref(false)
const showPreviewModal = ref(false)
const previewSrc = ref('')
const dropzoneElement = ref(null)
const pagesRef = ref(null)
const dndPages = ref([])

let dropzone

const range = computed({
  get: () => store.range,
  set: (value) => store.updateRange(value),
})

function uploadSuccess(_file, list) {
  const pages = Array.isArray(list) ? list : JSON.parse(list)
  store.appendPages(pages)
}

function progress(file, uploadProgress) {
  if (uploadProgress === 100) {
    file.previewElement.getElementsByClassName('dz-progress')[0].innerHTML =
      '<p>Extracting pages...</p><div class="loading"></div>'
  }
}

async function reset() {
  if (dropzone) {
    dropzone.removeAllFiles()
  }
  await fetch('/reset', {
    method: 'GET',
    credentials: 'include',
  })
  store.updateList([])
}

function openPreview(page) {
  previewSrc.value = page.thumb
  showPreviewModal.value = true
}

function postTo(action) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  form.target = '_blank'
  const txt = document.createElement('textarea')
  txt.name = 'json'
  txt.value = JSON.stringify(zipFiles.value)
  form.appendChild(txt)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

async function exportPdf() {
  exportFiles.value = []
  showModal.value = true
  try {
    const res = await fetch('/export', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store.pages),
    })
    if (!res.ok) {
      throw Error(await res.text())
    }
    const data = await res.json()
    exportFiles.value = data.map((f) => ({ name: f.split('/').pop(), href: f }))
    zipFiles.value = exportFiles.value.map((f) => f.name)
  } catch (e) {
    errors.value = [e]
  }
}

watch(
  () => store.pages,
  (pages) => {
    dndPages.value = pages
  },
  { deep: true, immediate: true },
)

watch(
  dndPages,
  (pages) => {
    if (pages !== store.pages) {
      store.updateList(pages)
    }
  },
  { deep: true },
)

onMounted(async () => {
  await store.loadSessionData()

  dragAndDrop({
    parent: pagesRef,
    values: dndPages,
    config: {
      draggable: (child) => child.classList.contains('page-box'),
      onSort: () => {
        store.updateList(dndPages.value)
      },
    },
  })

  dropzone = new Dropzone(dropzoneElement.value, {
    url: '/upload',
    withCredentials: true,
    maxFilesize: 20,
    maxFiles: 26,
    addRemoveLinks: false,
  })
  dropzone.on('success', uploadSuccess)
  dropzone.on('uploadprogress', progress)
})

onBeforeUnmount(() => {
  if (dropzone) {
    dropzone.destroy()
  }
})
</script>

<style>
header {
  padding: 1rem 0.5rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 200;
  background: #f8f9fa;
  color: #667189;
}

.content {
  padding: 7rem 0;
}

.navbar-brand {
  color: #50596c;
}

.btn-link {
  color: #667189;
  padding-left: 0.6rem;
  padding-right: 0.6rem;
}

.pages {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.dropzone .dz-preview.dz-processing .dz-progress {
  width: 80%;
  left: 0;
  margin-left: 10%;
  height: 70px;
  text-align: center;
  padding: 5px;
}
.vue-dropzone .dz-preview .dz-error-mark,
.vue-dropzone .dz-preview .dz-success-mark {
  left: 38%;
}
.dz-complete .dz-size,
.dropzone .dz-preview.dz-complete .dz-image {
  display: none;
}
.dropzone .dz-preview {
  width: 200px;
  min-height: 30px;
}

.vue-dropzone.dz-started {
  padding: 0;
}
.vue-dropzone .dz-preview .dz-details {
  background-color: #5764c6;
}

.vue-dropzone .dz-preview.dz-complete .dz-details {
  padding: 5px;
}

.vue-dropzone .dz-preview.dz-complete.dz-error {
  min-height: 180px;
}

.vue-dropzone.dropzone {
  min-height: 0;
}

.preview-modal-container {
  max-width: 90vw;
  width: auto;
}

.preview-modal-body {
  max-height: 80vh;
  overflow: auto;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 75vh;
}
</style>
