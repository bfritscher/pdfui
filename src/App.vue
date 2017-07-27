<template>
  <div id="app">
    <header>
      <section class="container grid-960">
        <nav class="navbar">
          <section class="navbar-section">
            <a href="#" class="navbar-brand mr-10">PDF UI</a>
            <a href="https://github.com/bfritscher/pdfui" class="btn btn-link">GitHub</a>
          </section>
          <section class="navbar-section">
            <button class="btn btn-primary btn-lg ml-10" :disabled="$store.state.pages.length === 0" @click="exportPdf">
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
        <p v-for="e in errors">
          <strong>{{e.type}} (row: {{e.row}}):</strong> {{e.message}}.</p>
      </div>
      <dropzone ref="dropzone" id="myVueDropzone" url="/upload" :maxFileSizeInMB="20" :maxNumberOfFiles="26" @vdropzone-success="uploadSuccess" @vdropzone-mounted="configureDropzone"	:show-remove-link="false">
      </dropzone>
      <draggable class="pages" v-model="pages" :options="{draggable: '.page-box', animation: 150}">
        <page v-for="page in $store.state.pages" :key="page.src + page.page" :page="page"></page>
      </draggable>
    </div>
    <div class="modal" :class="{active: showModal}">
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <button class="btn btn-clear float-right" @click="showModal = false"></button>
          <div class="modal-title">Export PDFs</div>
        </div>
        <div class="modal-body">
            <div class="loading" v-show="exportFiles.length === 0"></div>
            <div class="form-group" v-for="file in exportFiles">
              <label class="form-checkbox">
                <input type="checkbox" v-model="zipFiles" :value="file.name" />
                <i class="form-icon"></i> <a :href="file.href" target="_blank">{{file.name}}</a>
              </label>
            </div>
            <button class="btn btn-lg btn-primary btn-block" v-show="exportFiles.length" @click="postTo('/zip')">Download ZIP</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-block" v-show="exportFiles.length > 0" @click="postTo('/mafp')">Send to Moodle Assignment Feedback Packager</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropzone from 'vue2-dropzone';
import Draggable from 'vuedraggable';

import Page from './components/Page';
import { LIST_UPDATE, LIST_APPEND } from './store/mutation-types';

export default {
  name: 'app',
  data() {
    return {
      errors: [],
      exportFiles: [],
      zipFiles: [],
      showModal: false,
    };
  },
  methods: {
    uploadSuccess(file, list) {
      this.$store.commit(LIST_APPEND, list);
    },
    configureDropzone() {
      // add missing listeners
      this.$refs.dropzone.dropzone.on('uploadprogress', this.progress);
    },
    progress(file, progress) {
      if (progress === 100) {
        // eslint-disable-next-line
        file.previewElement.getElementsByClassName('dz-progress')[0]
        .innerHTML = '<p>Extracting pages...</p><div class="loading"></div>';
      }
    },
    reset() {
      this.$refs.dropzone.dropzone.removeAllFiles();
      this.$store.commit(LIST_UPDATE, []);
    },
    exportPdf() {
      this.exportFiles = [];
      this.showModal = true;
      fetch('/export', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.$store.state.pages),
      })
      .then((res) => {
        if (!res.ok) {
          throw Error(res.json());
        }
        return res.json();
      })
      .then((data) => {
        this.exportFiles = data.map(f => ({ name: f.split('/').pop(), href: f }));
        this.zipFiles = this.exportFiles.map(f => f.name);
      }).catch((e) => {
        this.errors = [e];
      });
    },
    postTo(action) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = action;
      form.target = '_blank';
      const txt = document.createElement('textarea');
      txt.name = 'json';
      txt.value = JSON.stringify(this.zipFiles);
      form.appendChild(txt);
      document.body.appendChild(form);
      form.submit();
      document.removeChild(form);
    },
  },
  computed: {
    pages: {
      get() {
        return this.$store.state.pages;
      },
      set(value) {
        this.$store.commit(LIST_UPDATE, value);
      },
    },
  },
  components: {
    Page,
    Dropzone,
    Draggable,
  },
};
</script>

<style>
header {
  padding: 1rem .5rem;
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
  padding-left: .6rem;
  padding-right: .6rem;
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

</style>
