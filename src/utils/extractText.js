export async function extractFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return await extractFromPDF(file)
  } else if (ext === 'docx' || ext === 'doc') {
    return await extractFromDOCX(file)
  } else if (ext === 'txt') {
    return await file.text()
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`)
  }
}

async function extractFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  if (!fullText.trim()) {
    throw new Error('Could not extract text from this PDF. It may be a scanned image.')
  }

  return fullText.trim()
}

async function extractFromDOCX(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })

  if (!result.value.trim()) {
    throw new Error('Could not extract text from this document.')
  }

  return result.value.trim()
}

const CORS_PROXIES = [
  async (url) => {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('allorigins failed')
    const data = await res.json()
    if (!data.contents) throw new Error('allorigins empty')
    return data.contents
  },
  async (url) => {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('corsproxy failed')
    return await res.text()
  },
  async (url) => {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('codetabs failed')
    return await res.text()
  },
]

export async function extractFromURL(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  let html = null
  let lastError = ''

  for (const proxy of CORS_PROXIES) {
    try {
      html = await proxy(url)
      if (html && html.length > 200) break
    } catch (err) {
      lastError = err.message
      continue
    }
  }

  if (!html || html.length < 200) {
    throw new Error(
      'Could not fetch that URL through any proxy. ' +
      'This can happen with sites that block bots (like Google). ' +
      'Try downloading the page and uploading it as a PDF, or paste the text directly.'
    )
  }

  const text = stripHTML(html)

  if (text.length < 200) {
    throw new Error('Not enough readable text found at that URL. Try pasting the text directly.')
  }

  return text
}

function stripHTML(html) {
  const div = document.createElement('div')
  div.innerHTML = html

  const scripts = div.querySelectorAll('script, style, nav, header, footer')
  scripts.forEach(el => el.remove())

  return div.textContent
    .replace(/\s+/g, ' ')
    .trim()
}
