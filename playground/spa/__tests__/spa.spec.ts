import { getFontsize, getRem, page, viteTestUrl } from '~utils'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

declare module 'vitest' {
  export interface TestContext {
    rem: string
  }
}

describe('pxtorem - width 700', () => {
  beforeAll(async () => {
    await page.setViewportSize({
      width: 700,
      height: 1000,
    })
    await page.goto(viteTestUrl)
  })

  beforeEach(async (ctx) => {
    ctx.rem = await getRem()
  })

  test('should 1rem to be 16px', ({ rem }) => {
    expect(rem).toBe('16px')
  })

  test('should a_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#a_1')
    expect(fontSize).toBe(rem)
  })

  test('should a_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#a_2')
    expect(fontSize).toBe('16px')
  })

  test('should b_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#b_1')
    expect(fontSize).toBe(rem)
  })

  test('should b_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#b_2')
    expect(fontSize).toBe('16px')
  })

  test('should c_1 fontsize be half rem', async ({ rem }) => {
    const fontSize = await getFontsize('#c_1')
    expect(fontSize).toBe(`${Number.parseFloat(rem) / 2}px`)
  })
})

describe('pxtorem - width 1120', () => {
  beforeAll(async () => {
    await page.setViewportSize({
      width: 1120,
      height: 1120,
    })
    await page.goto(viteTestUrl)
  })

  beforeEach(async (ctx) => {
    ctx.rem = await getRem()
  })

  test('should 1rem to be 14px', ({ rem }) => {
    expect(rem).toBe('14px')
  })

  test('should a_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#a_1')
    expect(fontSize).toBe(rem)
  })

  test('should a_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#a_2')
    expect(fontSize).toBe('16px')
  })

  test('should b_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#b_1')
    expect(fontSize).toBe(rem)
  })

  test('should b_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#b_2')
    expect(fontSize).toBe('16px')
  })

  test('should c_1 fontsize be half rem', async ({ rem }) => {
    const fontSize = await getFontsize('#c_1')
    expect(fontSize).toBe(`${Number.parseFloat(rem) / 2}px`)
  })
})

describe('pxtorem - width 1960', () => {
  beforeAll(async () => {
    await page.setViewportSize({
      width: 1960,
      height: 1960,
    })
    await page.goto(viteTestUrl)
  })

  beforeEach(async (ctx) => {
    ctx.rem = await getRem()
  })

  test('should 1rem to be 16px', ({ rem }) => {
    expect(rem).toBe('16px')
  })

  test('should a_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#a_1')
    expect(fontSize).toBe(rem)
  })

  test('should a_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#a_2')
    expect(fontSize).toBe('16px')
  })

  test('should b_1 fontsize be 1rem', async ({ rem }) => {
    const fontSize = await getFontsize('#b_1')
    expect(fontSize).toBe(rem)
  })

  test('should b_2 fontsize be 16px', async () => {
    const fontSize = await getFontsize('#b_2')
    expect(fontSize).toBe('16px')
  })

  test('should c_1 fontsize be half rem', async ({ rem }) => {
    const fontSize = await getFontsize('#c_1')
    expect(fontSize).toBe(`${Number.parseFloat(rem) / 2}px`)
  })
})
