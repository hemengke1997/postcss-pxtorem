// excluding regex trick: http://www.rexegg.com/regex-best-trick.html

// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit

export function getUnitRegexp(unit: string) {
  return new RegExp(`"[^"]+"|'[^']+'|url\\([^\\)]+\\)|--[\\w-]+|(\\d*\\.?\\d+)${unit}`, 'g')
}
