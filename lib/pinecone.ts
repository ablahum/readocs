import { Pinecone } from '@pinecone-database/pinecone'
import { GoogleGenAI } from '@google/genai'

const gemini = new GoogleGenAI({})
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export async function upsertToPinecone({
  chunked,
  embedded,
  fileType,
  fileUrl,
}: {
  chunked: string[]
  embedded: number[][]
  fileType: string
  fileUrl: string
}) {
  const index = pinecone.index('readocs')

  try {
    const upsert = await index.upsert(
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

    return upsert
  } catch (err) {
    console.log('ERROR KETIKA UPSERT:', err)
  }
}

export async function retrieveFromPinecone(query: string, dims = 768) {
  const index = pinecone.index('readocs')

  try {
    const result = await gemini.models.embedContent({
      model: 'gemini-embedding-2',
      contents: query,
      config: { outputDimensionality: dims },
    })

    if (!result.embeddings || !Array.isArray(result.embeddings[0]?.values)) {
      throw new Error('Failed to embed query with Gemini')
    }
    const queryEmbedding = result.embeddings[0].values

    const searchResult = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    })

    return searchResult.matches
  } catch (err) {
    console.error('Error while retrieving from Pinecone:', err)
    return []
  }
}
