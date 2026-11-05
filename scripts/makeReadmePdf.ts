/**
 * Turns README.md into docs/DropWise-documentation.pdf with a small Markdown converter and headless Chrome.
 *
 *   node scripts/makeReadmePdf.ts
 *
 * Set CHROME to the path of chrome.exe if it is not in the default place. The converter handles what the README uses:
 * headings, paragraphs, lists, tables, fenced code, inline code, bold, italic, links, images and raw <img> lines.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const chrome = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(raw: string): string {
  const codes: string[] = []
  let s = raw.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${esc(c)}</code>`)
    return `${codes.length - 1}`
  })
  s = esc(s)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?![\w*])/g, '$1<i>$2</i>')
  return s.replace(/(\d+)/g, (_, i: string) => codes[Number(i)])
}

function convert(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let paragraph: string[] = []
  const flush = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('```')) {
      flush()
      const code: string[] = []
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) code.push(lines[i])
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
    } else if (/^#{1,6} /.test(line)) {
      flush()
      const level = line.match(/^#+/)![0].length
      out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`)
    } else if (/^---+$/.test(line.trim())) {
      flush()
      out.push('<hr>')
    } else if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      flush()
      const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const head = cells(line)
      const body: string[][] = []
      for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) body.push(cells(lines[i]))
      i--
      const th = head.map((c) => `<th>${inline(c)}</th>`).join('')
      const tr = body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')
      out.push(`<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`)
    } else if (/^\s*([-*]|\d+\.) /.test(line)) {
      flush()
      const ordered = /^\s*\d+\./.test(line)
      const items: string[] = []
      for (; i < lines.length; i++) {
        const l = lines[i]
        if (/^\s*([-*]|\d+\.) /.test(l)) items.push(l.replace(/^\s*([-*]|\d+\.) /, ''))
        else if (/^\s{2,}\S/.test(l) && items.length) items[items.length - 1] += ' ' + l.trim()
        else break
      }
      i--
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`)
    } else if (line.trim().startsWith('<img')) {
      flush()
      out.push(`<p>${line}</p>`)
    } else if (line.trim() === '') {
      flush()
    } else {
      paragraph.push(line.trim())
    }
  }
  flush()
  return out.join('\n')
}

const css = `
  @page { size: A4; margin: 1.8cm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.4; color: #111; }
  h1 { font-size: 22pt; margin: 0 0 8pt; } h2 { font-size: 15pt; margin: 18pt 0 6pt; border-bottom: 1px solid #ccc; padding-bottom: 3pt; } h3 { font-size: 12pt; margin: 12pt 0 4pt; }
  p { margin: 0 0 7pt; } a { color: #0b4fb3; text-decoration: none; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 9pt; page-break-inside: auto; }
  tr { page-break-inside: avoid; } th, td { border: 0.5pt solid #999; padding: 3pt 5pt; vertical-align: top; text-align: left; } th { background: #eef2f7; }
  code { font-family: Consolas, monospace; font-size: 9pt; background: #f2f2f2; padding: 0 2pt; } pre { background: #f2f2f2; padding: 6pt; overflow: hidden; white-space: pre-wrap; font-size: 8.5pt; } pre code { background: none; padding: 0; }
  img { max-width: 100%; height: auto; } ul, ol { margin: 0 0 8pt; padding-left: 18pt; } li { margin-bottom: 2pt; } hr { border: 0; border-top: 1px solid #ccc; margin: 12pt 0; }
`

const markdown = readFileSync(join(root, 'README.md'), 'utf8')
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${pathToFileURL(root).href}"><title>DropWise documentation</title><style>${css}</style></head><body>${convert(markdown)}</body></html>`
const work = mkdtempSync(join(tmpdir(), 'dropwise-readme-'))
const page = join(work, 'readme.html')
writeFileSync(page, html)
if (process.env.KEEP_HTML) writeFileSync(process.env.KEEP_HTML, html) // for looking at the converted page
const pdf = join(root, 'docs', 'DropWise-documentation.pdf')
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(page).href], { stdio: 'ignore' })
console.log(`wrote ${pdf}`)
