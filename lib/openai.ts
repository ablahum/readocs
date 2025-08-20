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

export async function retrieveFromPinecone(query: string, dims = 512) {
  //* 1. EMBED USER'S QUESTION
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    dimensions: dims, // harus sama dengan index kamu
  })

  //* 2. QUERY PINECONE
  const index = pinecone.index('readocs')

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
          // 'You are an internal AI assistant. Please answer based on the given context:',
          'Kamu adalah asisten AI internal perusahaan. Jawab berdasarkan konteks berikut.',
      },
      {
        role: 'user',
        content: `Konteks:\n${context}\n\nPertanyaan: ${query}`,
      },
    ],
  })

  return completion.choices[0].message.content
}
