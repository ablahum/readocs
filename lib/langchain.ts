import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import mammoth from 'mammoth'

export async function parseFile({
  fileType,
  fileUrl,
}: {
  fileType: string
  fileUrl: string
}) {
  const res = await fetch(fileUrl)

  if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`)

  try {
    const blob = await res.blob()

    switch (fileType) {
      case 'pdf': {
        const loader = new PDFLoader(blob)
        const docs = await loader.load()
        return docs.map(doc => doc.pageContent).join('\n')
      }

      case 'docx': {
        const loader = new DocxLoader(blob)
        const docs = await loader.load()
        return docs.map(doc => doc.pageContent).join('\n')
      }

      case 'doc': {
        const arrayBuffer = await blob.arrayBuffer()
        const { value } = await mammoth.extractRawText({
          arrayBuffer,
        })
        return value
      }

      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (err) {
    console.error('Error parsing file:', err)

    throw err
  }
}

export async function chunkFile(parsed: string) {
  const chunk = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '.', ' ', ''],
  })

  return await chunk.splitText(parsed)
}
