import { retrieveFromPinecone } from './pinecone'
import { GoogleGenAI } from '@google/genai'

const gemini = new GoogleGenAI({})

export async function embedChunks(
  chunked: string[],
  dims = 768,
): Promise<number[][]> {
  try {
    const embeddings: number[][] = []
    for (const chunk of chunked) {
      const result = await gemini.models.embedContent({
        model: 'gemini-embedding-2',
        contents: chunk,
        config: { outputDimensionality: dims },
      })

      if (result.embeddings && Array.isArray(result.embeddings[0]?.values))
        embeddings.push(result.embeddings[0].values)
      else throw new Error('Failed to retrieve embedding from Gemini.')
    }
    return embeddings
  } catch (err) {
    console.error('Error while embed chuked text.', err)

    throw new Error('An error occured while embedding the data.')
  }
}

export async function answerQuestion(query: string) {
  try {
    const matches = await retrieveFromPinecone(query)
    const context = Array.isArray(matches)
      ? matches
          .map(
            (match: { metadata?: { text?: string } }) => match?.metadata?.text,
          )
          .join('\n\n')
      : ''

    const systemPrompt = `You are a highly intelligent and professional AI assistant. Your job is to answer user questions accurately, clearly, and relevantly based solely on the information contained in the uploaded document. If an answer isn't found within the context of the document, be honest about the lack of information. Don't add or fabricate answers outside the context of the document. Answer in formal, easy-to-understand English.
    Answer formatting rules:
    - Use valid Markdown.
    - For lists, use a numbered list with each point on a separate line (start with "1. ", "2. ", etc.).
    - Do not combine all points into one paragraph.
    - Use **bold** only for important terms, not for entire sentences.
    `

    const prompt = `Context:\n${context}\n\nQuestion: ${query}`

    const answer = await gemini.interactions.create({
      model: 'gemini-3.8-flash',
      input: `${systemPrompt}\n\n${prompt}`,
    })

    return answer.output_text
  } catch (err) {
    console.error(err)
  }
}
