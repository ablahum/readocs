import UploadForm from '@/components/upload/upload-form'
import { chunkFile, parseFile } from '@/lib/langchain'
import { answerQuestion, embedWithOpenAI } from '@/lib/openai'
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
    const parsed = await parseFile({ fileType, fileUrl })

    //* 2. CHUNK PARSED TEXT ---------------------------------------------
    const chunked = await chunkFile(parsed)

    //* 3. EMBED CHUNKED TEXT --------------------------------------------
    const embedded = await embedWithOpenAI(chunked)

    //* 3. INSERT/UPSERT EMBEDDED VECTOR DB ------------------------------
    const index = pinecone.index('readocs')

    await index.upsert(
      embedded.map((vector, idx) => ({
        id: `chunk-${Date.now()}-${idx}`,
        values: vector,
        metadata: {
          text: chunked[idx],
          file: fileUrl,
          type: fileType,
        },
      })),
    )

    // console.log('✅ Data berhasil disimpan ke Pinecone')
    const result = await answerQuestion(
      'Apa bahasa yang dikuasai oleh Rizky Pratama?',
      // 'Berapakah skor penilaian untuk materi pengembangan karir dan apa deskripsinya?',
    )

    console.log(result)
  } catch (err) {
    console.error(err)
  }
}

export default function Page() {
  return (
    <div className='min-h-screen flex items-center justify-center p-8'>
      <UploadForm processFiles={processFiles} />
    </div>
  )
}
