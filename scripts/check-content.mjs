// 文档站的内容自检：把"构建不报错、页面上却是坏的"那类问题挡在前面。
//
//   node scripts/check-content.mjs
//
// 为什么需要它：这套站是中英双语的，页面成对出现，而 hope 的几种写法
// 出了错**不会报错**，只会静静地不生效 —— 真踩过的两次分别是：
//   · 提示框 `> [!note] 标题`：标记后面跟了字就不被识别，页面上直接显示字面量；
//   · 公告没写 path/match：构建成功，页面上什么都不出现。
// 所以这里逐个断言结构层面的东西，而不是靠人肉看页面。
//
// 退出码 0 表示通过。

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'src')

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) {
    console.log(`  [通过] ${name}${detail ? ' —— ' + detail : ''}`)
  } else {
    console.log(`  [失败] ${name}${detail ? ' —— ' + detail : ''}`)
    failures++
  }
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      return entry.name === '.vuepress' ? [] : walk(full)
    }
    return entry.name.endsWith('.md') ? [full] : []
  })

const pages = walk(src)
const rel = (file) => relative(src, file).split(sep).join('/')
const isEnglish = (file) => rel(file).startsWith('en/')
const zhPages = pages.filter((file) => !isEnglish(file))
const enPages = pages.filter(isEnglish)

/* ---------- 1. 提示框标记必须独占一行 ---------- */

console.log('提示框语法')
{
  const bad = []
  for (const file of pages) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      // 正确写法是 "> [!note]" 单独一行；后面跟了字就整块降级成普通引用
      if (/^>\s*\[![a-z]+\]\s*\S/i.test(line)) {
        bad.push(`${rel(file)}:${index + 1}`)
      }
    })
  }
  check('提示框标记独占一行', bad.length === 0, bad.join('、'))
}

/* ---------- 2. 中英页面一一对应，且结构一致 ---------- */

console.log('中英对照')
{
  const count = (text, pattern) => (text.match(pattern) || []).length

  const missing = []
  const mismatched = []

  for (const zh of zhPages) {
    const target = enPages.find((en) => rel(en) === `en/${rel(zh)}`)
    if (!target) {
      missing.push(rel(zh))
      continue
    }

    const a = readFileSync(zh, 'utf8')
    const b = readFileSync(target, 'utf8')
    // 比"所有级别的标题数"，不只是 H1 —— 只比 H1 的话，少译一整节也发现不了
    const h1a = count(a, /^#{1,6} /gm)
    const h1b = count(b, /^#{1,6} /gm)
    const fenceA = count(a, /^```/gm)
    const fenceB = count(b, /^```/gm)

    if (h1a !== h1b || fenceA !== fenceB) {
      mismatched.push(`${rel(zh)}（标题 ${h1a}/${h1b}，代码块 ${fenceA}/${fenceB}）`)
    }
  }

  // 反过来：英文页不该有孤儿
  const orphans = enPages
    .filter((en) => !zhPages.some((zh) => `en/${rel(zh)}` === rel(en)))
    .map((en) => rel(en))

  check('每个中文页都有对应的英文页', missing.length === 0, missing.join('、'))
  check('没有多余的英文页', orphans.length === 0, orphans.join('、'))
  check('中英页标题数与代码块数一致', mismatched.length === 0, mismatched.join('；'))
  check('中英页数量相等', zhPages.length === enPages.length, `${zhPages.length} / ${enPages.length}`)
}

/* ---------- 3. 侧边栏登记的页面必须真的存在 ---------- */

console.log('侧边栏')
{
  const readSidebar = (file) => {
    const text = readFileSync(join(src, '.vuepress', 'sidebar', file), 'utf8')
    const entries = []
    let base = null
    for (const line of text.split(/\r?\n/)) {
      const baseMatch = line.match(/^\s*"(\/[^"]*\/)":\s*\[/)
      if (baseMatch) {
        base = baseMatch[1]
        continue
      }
      const childMatch = line.match(/^\s*children:\s*\[(.*)\]/)
      if (childMatch && base) {
        for (const item of childMatch[1].split(',')) {
          const name = item.trim().replace(/^"|"$/g, '')
          if (name) entries.push(base + name)
        }
      }
    }
    return entries
  }

  for (const [file, label] of [
    ['zh.ts', '中文'],
    ['en.ts', '英文'],
  ]) {
    const missing = []
    for (const path of readSidebar(file)) {
      // /guide/README.md → src/guide/README.md；/guide/x.md → src/guide/x.md
      const target = join(src, path.replace(/^\//, ''))
      if (!existsSync(target)) missing.push(path)
    }
    check(`${label}侧边栏里的页面都存在`, missing.length === 0, missing.join('、'))
  }
}

/* ---------- 4. 站内链接不能指向不存在的页面 ---------- */

console.log('站内链接')
{
  // 页面在站点上的路径：README.md 变成目录本身，其余去掉 .md 扩展名
  const toPath = (file) => {
    let path = '/' + rel(file)
    if (path.endsWith('/README.md')) return path.slice(0, -'README.md'.length)
    return path.replace(/\.md$/, '')
  }
  const known = new Set(pages.map(toPath))
  const broken = []

  for (const file of pages) {
    const text = readFileSync(file, 'utf8')
    // 只查站内的 *.html 链接（外部链接、锚点、图片不管）
    for (const match of text.matchAll(/\]\((\/[^)\s]*\.html)(#[^)]*)?\)/g)) {
      let target = match[1]
      // 英文区的页面里写 /guide/x.html 是漏了前缀，反之亦然 —— 两种都当错误报出来
      const expectedPrefix = isEnglish(file) ? '/en/' : '/'
      if (!target.startsWith(expectedPrefix)) {
        broken.push(`${rel(file)} → ${target}（缺少 ${expectedPrefix} 前缀）`)
        continue
      }
      const asDir = target.replace(/\.html$/, '/')
      const bare = target.replace(/\.html$/, '').replace(/\/index$/, '/')
      const candidates = [target, bare, asDir, asDir + 'README.md', bare + 'README.md']
      if (!candidates.some((candidate) => known.has(candidate))) {
        broken.push(`${rel(file)} → ${target}`)
      }
    }
  }

  check('站内 .html 链接都能落到真实页面上', broken.length === 0, broken.slice(0, 8).join('、'))
}

console.log('')
if (failures > 0) {
  console.log(`存在 ${failures} 项失败。`)
  process.exit(1)
}
console.log('内容自检全部通过。')
