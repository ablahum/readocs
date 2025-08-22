import AskForm from '@/components/forms/ask-form'
import { answerQuestion } from '@/lib/openai'

export default function Page() {
  async function handleAsk(formData: FormData): Promise<string> {
    'use server'

    const question = formData.get('question') as string
    if (!question) return 'Question is empty.'

    const answer = await answerQuestion(question)
    return answer ?? 'No answer.'
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <AskForm handleAsk={handleAsk} />
    </div>
  )
}
