import Vue from 'vue';
import Vuex from 'vuex';
import * as types from './mutation-types';

Vue.use(Vuex);

// initial state
const initialState = {
  pages: [
/*    {
      src: 'BD.pdf',
      page: 1,
      thumb: 'static/test/output-000.jpg',
      cutBefore: true,
      remove: false,
      angle: 90,
      data: {
        name: 'BD.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 2,
      thumb: 'static/test/output-001.jpg',
      cutBefore: false,
      remove: false,
      angle: 0,
      data: {
        name: 'BD.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 3,
      thumb: 'static/test/output-002.jpg',
      cutBefore: true,
      remove: false,
      angle: 0,
      data: {
        name: 'test.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 4,
      thumb: 'static/test/output-003.jpg',
      cutBefore: false,
      remove: false,
      angle: 0,
      data: {
        name: 'BD.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 4,
      thumb: 'static/test/output-003.jpg',
      cutBefore: false,
      remove: false,
      angle: 0,
      data: {
        name: 'BD.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 4,
      thumb: 'static/test/output-003.jpg',
      cutBefore: false,
      remove: false,
      angle: 0,
      data: {
        name: 'BD.pdf',
      },
    },
    {
      src: 'BD.pdf',
      page: 4,
      thumb: 'static/test/output-003.jpg',
      cutBefore: false,
      remove: false,
      angle: 0,
      data: {
        name: 'BD.pdf',
      },
    },
  */
  ],
};

// getters
const getters = {
};

// actions
const actions = {
  rotate({ commit }, payload) {
    commit(types.PAGE_ROTATE, payload);
  },
  remove({ commit, state }, payload) {
    // if isCutBefore and remove check if we need to transfer cut to following
    if (payload.page.cutBefore && payload.remove) {
      const pageIndex = state.pages.indexOf(payload.page);
      if (pageIndex >= 0 && pageIndex < state.pages.length - 1) {
        const followingPage = state.pages[pageIndex + 1];
        if (!followingPage.cutBefore) {
          // TODO commit as a mutation? check data initalized?
          followingPage.data.name = payload.page.data.name;
          commit(types.PAGE_SPLIT, {
            page: followingPage,
            split: true,
          });
        }
      }
    }
    commit(types.PAGE_REMOVE, payload);
  },
  split({ commit }, payload) {
    commit(types.PAGE_SPLIT, payload);
  },
};

// mutations
/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  [types.PAGE_ROTATE](state, payload) {
    payload.page.angle += payload.angle;
  },
  [types.PAGE_REMOVE](state, payload) {
    payload.page.remove = payload.remove;
  },
  [types.PAGE_SPLIT](state, payload) {
    payload.page.cutBefore = payload.split;
  },
  [types.LIST_UPDATE](state, pages) {
    state.pages = pages;
  },
  [types.LIST_APPEND](state, pages) {
    state.pages = state.pages.concat(pages);
  },
};

export default new Vuex.Store({
  state: initialState,
  actions,
  getters,
  mutations,
  strict: true,
});
