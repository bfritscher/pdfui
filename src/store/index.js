import Vue from 'vue';
import Vuex from 'vuex';
import rangeToNumberArray from '@/utils';
import * as types from './mutation-types';


Vue.use(Vuex);

// initial state
const initialState = {
  range: '1-n',
  mails: [],
  pages: [
    /*
    {
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
const gettersDefinition = {
  groups(state) {
    return state.pages.reduce((groups, page, i) => {
      if (i === 0 || page.cutBefore) {
        groups.push([]);
      }
      groups[groups.length - 1].push(page);
      return groups;
    }, []);
  },
};

// actions
const actions = {
  loadSessionData({ commit }) {
    return fetch('/session', { credentials: 'include' }).then(r => r.json()).then(pages => commit(types.LIST_UPDATE, pages));
  },
  fetchMail({ commit }, to) {
    return fetch(`/mail/${to}`, { credentials: 'include' }).then(r => r.json()).then(mails => commit(types.MAILS_SET, mails));
  },
  claim({ commit, dispatch }, mail) {
    return fetch('/claim', {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mail),
    }).then(r => r.json()).then((thumbs) => {
      commit(types.LIST_APPEND, thumbs);
      dispatch('fetchMail', mail.to);
    });
  },
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
          commit(types.PAGE_RENAME, {
            page: followingPage,
            name: payload.page.data.name,
          });
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
  batch({ commit, state, getters, dispatch }, payload) {
    getters.groups.forEach((subGroup) => {
      const relativePages = rangeToNumberArray(state.range, subGroup.length);
      relativePages.map(n => subGroup[n - 1]).forEach((page) => {
        const params = Object.assign({
          page,
        }, payload.params);
        dispatch(payload.action, params);
      });
    });
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
  [types.PAGE_RENAME](state, payload) {
    if (!payload.page.data) {
      payload.page.data = {};
    }
    payload.page.data.name = payload.name;
  },
  [types.LIST_UPDATE](state, pages) {
    state.pages = pages;
  },
  [types.LIST_APPEND](state, pages) {
    state.pages = state.pages.concat(pages);
  },
  [types.UPDATE_RANGE](state, range) {
    state.range = range;
  },
  [types.MAILS_SET](state, mails) {
    state.mails = mails;
  },
  [types.MAILS_APPEND](state, mail) {
    state.mails = state.mails.concat([mail]);
  },
};

export default new Vuex.Store({
  state: initialState,
  actions,
  getters: gettersDefinition,
  mutations,
  strict: true,
});
