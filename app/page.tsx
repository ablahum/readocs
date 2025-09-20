export const dynamic = 'force-dynamic'

import UploadForm from '@/components/forms/upload-form'
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
        'An error occurred while processing the file. Please ensure the uploaded file is in a supported format.',
      )
    }

    //* 2. CHUNK PARSED TEXT ---------------------------------------------
    let chunked

    try {
      chunked = await chunkFile(parsed)
    } catch (err) {
      console.error('Failed to chunk parsed text:', err)

      throw new Error(
        'An error occurred while splitting the file into smaller chunks.',
      )
    }

    //* 3. EMBED CHUNKED TEXT --------------------------------------------
    let embedded

    try {
      embedded = await embedWithOpenAI(chunked)
    } catch (err) {
      console.error('Failed to embed chunked text:', err)

      throw new Error('An error occurred while embedding the data.')
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

      throw new Error('An error occurred while saving data to the database.')
    }
  } catch (err) {
    console.error('An error occurred during the upload process:', err)

    throw err
  }
}

export default async function Home() {
  //* DELETE ALL INDEX FROM PINECONE -------------------------------------
  const index = pinecone.index('readocs')

  const stats = await index.describeIndexStats()
  if ((stats.totalRecordCount ?? 0) > 0) {
    await index.deleteAll()
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <UploadForm processFiles={processFiles} />
    </div>
  )
}
