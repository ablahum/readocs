import OpenAI from 'openai'
import { pinecone } from './pinecone'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function embedWithOpenAI(chunked: string[], dims = 512) {
  const embeddings = []

  for (const chunk of chunked) {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk,
      dimensions: dims,
    })

    embeddings.push(res.data[0].embedding)
  }

  return embeddings
}

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
}

async function retrieveFromPinecone(query: string, dims = 512) {
  const index = pinecone.index('readocs')

  //* EMBED USER'S QUESTION WITH OPENAI ----------------------------------
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    dimensions: dims,
  })

  //* QUERY TO PINECONE USING EMBEDDED QUESTION --------------------------
  const results = await index.query({
    topK: 5,
    vector: embedding.data[0].embedding,
    includeMetadata: true,
  })

  return results.matches
}

export async function answerQuestion(query: string) {
  const matches = await retrieveFromPinecone(query)

  const context = matches.map(m => m.metadata?.text).join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          "You are a highly intelligent and professional AI assistant. Your job is to answer user questions accurately, clearly, and relevantly based solely on the information contained in the uploaded document. If an answer isn't found within the context of the document, be honest about the lack of information. Don't add or fabricate answers outside the context of the document. Answer in formal, easy-to-understand English.",
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\Question: ${query}`,
      },
    ],
  })

  return completion.choices[0].message.content
}
