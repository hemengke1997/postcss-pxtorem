export const filterPropList = {
  exact(list: string[]) {
    return list.filter((m) => m.match(/^[^*!]+$/))
  },
  contain(list: string[]) {
    return list.filter((m) => m.match(/^\*.+\*$/)).map((m) => m.substring(1, m.length - 1))
  },
  endWith(list: string[]) {
    return list.filter((m) => m.match(/^\*[^*]+$/)).map((m) => m.substring(1))
  },
  startWith(list: string[]) {
    return list.filter((m) => m.match(/^[^*!]+\*$/)).map((m) => m.substring(0, m.length - 1))
  },
  notExact(list: string[]) {
    return list.filter((m) => m.match(/^![^*].*$/)).map((m) => m.substring(1))
  },
  notContain(list: string[]) {
    return list.filter((m) => m.match(/^!\*.+\*$/)).map((m) => m.substring(2, m.length - 1))
  },
  notEndWith(list: string[]) {
    return list.filter((m) => m.match(/^!\*[^*]+$/)).map((m) => m.substring(2))
  },
  notStartWith(list: string[]) {
    return list.filter((m) => m.match(/^![^*]+\*$/)).map((m) => m.substring(1, m.length - 1))
  },
}
