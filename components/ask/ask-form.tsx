'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AskForm({
  handleAsk,
}: {
  handleAsk: (formData: FormData) => Promise<string>
}) {
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await handleAsk(formData)
      if (!result) {
        setError('Tidak ada jawaban yang diberikan.')
      } else {
        setAnswer(result)
        setError(null)
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat menjawab pertanyaan.')
    }
  }

  return (
    <div>
      {answer && (
        <div className='mt-4 p-4 border rounded bg-gray-50'>
          <h2 className='font-medium mb-2'>Answer:</h2>

          <p>{answer}</p>
        </div>
      )}

      <form
        action={handleSubmit}
        className='flex flex-col gap-4 max-w-sm w-full'
      >
        <label
          htmlFor='question'
          className='font-medium'
        >
          Ask a Question
        </label>
        <Input
          id='question'
          name='question'
          type='text'
          placeholder='Write your question...'
        />

        {error && <p className='text-red-500'>{error}</p>}

        <Button
          type='submit'
          className='uppercase tracking-widest'
        >
          Ask
        </Button>
      </form>
    </div>
  )
}
