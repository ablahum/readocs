// import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf' //

// export async function fetchAndExtract(fileUrl: string) {
//   const response = await fetch(fileUrl)
//   if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`)

//   const blob = await response.blob()
//   const loader = new PDFLoader(blob)
//   const docs = await loader.load()

//   return docs.map(doc => doc.pageContent).join('\n')
// }

export async function parsePdf(file: File | Blob) {
  const loader = new WebPDFLoader(file)
  const docs = await loader.load()

  const asd = docs.map(doc => doc.pageContent).join('\n')
  console.log(asd)
  // return docs.map(doc => doc.pageContent).join('\n')
}
