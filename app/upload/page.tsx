import UploadForm from '@/components/upload/upload-form'
import { chunkFile, parseFile } from '@/lib/langchain'
import { embedWithOpenAI, upsertToPinecone } from '@/lib/openai'
import { pinecone } from '@/lib/pinecone'

async function processFiles({
  fileType,
  fileUrl,
}: {
  fileType: string
  fileUrl: string
}) {
  'use server'

  try {
    //* 1. PARSE FILE ----------------------------------------------------
    let parsed

    try {
      parsed = await parseFile({ fileType, fileUrl })
    } catch (err) {
      console.error('Failed to parse file:', err)

      throw new Error(
        'Terjadi kesalahan saat memproses file. Pastikan file yang diupload sesuai format yang didukung.',
      )
    }

    //* 2. CHUNK PARSED TEXT ---------------------------------------------
    let chunked

    try {
      chunked = await chunkFile(parsed)
    } catch (err) {
      console.error('Failed to chunk parsed text:', err)

      throw new Error(
        'Terjadi kesalahan saat memecah file menjadi bagian-bagian kecil.',
      )
    }

    //* 3. EMBED CHUNKED TEXT --------------------------------------------
    let embedded

    try {
      embedded = await embedWithOpenAI(chunked)
    } catch (err) {
      console.error('Failed to embed chunked text:', err)

      throw new Error('Terjadi kesalahan saat melakukan embedding pada data.')
    }

    //* 4. INSERT/UPSERT EMBEDDED VECTOR DB ------------------------------
    try {
      await upsertToPinecone({
        chunked,
        embedded,
        fileType,
        fileUrl,
      })
    } catch (err) {
      console.error('Failed to store data to Pinecone:', err)

      throw new Error('Terjadi kesalahan saat menyimpan data ke database.')
    }
  } catch (err) {
    console.error('Terjadi error pada proses upload:', err)

    throw err
  }
}

export default async function Page() {
  //* DELETE ALL INDEX FROM PINECONE -------------------------------------
  const index = pinecone.index('readocs')

  await index.deleteAll()

  return (
    <div className='min-h-screen flex items-center justify-center p-8'>
      <UploadForm processFiles={processFiles} />
    </div>
  )
}
