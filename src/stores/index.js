import { defineStore } from 'pinia'
import rangeToNumberArray from '@/utils'

function nextSplitName(previousName, fallbackPrefix = 'A') {
  const current = (previousName || '').trim()
  if (!current) {
    return `${fallbackPrefix}0`
  }

  const letterMatch = current.match(/^(.*?)([A-Za-z])$/)
  if (letterMatch) {
    const [, prefix, letter] = letterMatch
    if (letter === 'Z') {
      return `${prefix}A`
    }
    if (letter === 'z') {
      return `${prefix}a`
    }
    return `${prefix}${String.fromCharCode(letter.charCodeAt(0) + 1)}`
  }

  const numberMatch = current.match(/^(.*?)(\d+)$/)
  if (numberMatch) {
    const [, prefix, number] = numberMatch
    const normalizedPrefix = prefix || fallbackPrefix
    return `${normalizedPrefix}${Number.parseInt(number, 10) + 1}`
  }

  return `${current}1`
}

export const usePdfStore = defineStore('pdf', {
  state: () => ({
    range: '1-n',
    pages: [],
  }),
  getters: {
    groups(state) {
      return state.pages.reduce((groups, page, i) => {
        if (i === 0 || page.cutBefore) {
          groups.push([])
        }
        groups[groups.length - 1].push(page)
        return groups
      }, [])
    },
  },
  actions: {
    async loadSessionData() {
      const pages = await fetch('/session', { credentials: 'include' }).then((r) => r.json())
      this.pages = pages
    },
    rotate({ page, angle }) {
      page.angle += angle
    },
    remove({ page, remove }) {
      if (page.cutBefore && remove) {
        const pageIndex = this.pages.indexOf(page)
        if (pageIndex >= 0 && pageIndex < this.pages.length - 1) {
          const followingPage = this.pages[pageIndex + 1]
          if (!followingPage.cutBefore) {
            this.rename({
              page: followingPage,
              name: page.data.name,
            })
            this.split({
              page: followingPage,
              split: true,
              preserveName: true,
            })
          }
        }
      }
      page.remove = remove
    },
    split({ page, split, preserveName = false }) {
      if (split && !page.cutBefore && !preserveName) {
        const pageIndex = this.pages.indexOf(page)
        let previousSplitName = ''

        for (let i = pageIndex - 1; i >= 0; i -= 1) {
          if (i === 0 || this.pages[i].cutBefore) {
            previousSplitName = this.pages[i].data?.name || ''
            break
          }
        }

        if (!page.data) {
          page.data = {}
        }
        page.data.name = nextSplitName(previousSplitName, page.src || 'A')
      }
      page.cutBefore = split
    },
    rename({ page, name }) {
      if (!page.data) {
        page.data = {}
      }
      page.data.name = name
    },
    updateList(pages) {
      this.pages = pages
    },
    appendPages(pages) {
      this.pages = this.pages.concat(pages)
    },
    updateRange(range) {
      this.range = range
    },
    batch(payload) {
      this.groups.forEach((subGroup) => {
        const relativePages = rangeToNumberArray(this.range, subGroup.length)
        relativePages
          .map((n) => subGroup[n - 1])
          .forEach((page) => {
            const params = {
              page,
              ...payload.params,
            }
            this[payload.action](params)
          })
      })
    },
  },
})
