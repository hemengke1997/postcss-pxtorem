export const filterPropList = {
  exact(list: string[]) {
    return list.filter((m) => m.match(/^[^!*]+$/))
  },
  contain(list: string[]) {
    return list.filter((m) => m.match(/^\*.+\*$/)).map((m) => m.slice(1, -1))
  },
  endWith(list: string[]) {
    return list.filter((m) => m.match(/^\*[^*]+$/)).map((m) => m.slice(1))
  },
  startWith(list: string[]) {
    return list.filter((m) => m.match(/^[^!*]+\*$/)).map((m) => m.slice(0, Math.max(0, m.length - 1)))
  },
  notExact(list: string[]) {
    return list.filter((m) => m.match(/^![^*].*$/)).map((m) => m.slice(1))
  },
  notContain(list: string[]) {
    return list.filter((m) => m.match(/^!\*.+\*$/)).map((m) => m.slice(2, -1))
  },
  notEndWith(list: string[]) {
    return list.filter((m) => m.match(/^!\*[^*]+$/)).map((m) => m.slice(2))
  },
  notStartWith(list: string[]) {
    return list.filter((m) => m.match(/^![^*]+\*$/)).map((m) => m.slice(1, -1))
  },
}
