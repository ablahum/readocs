'use client'

import { FormEvent, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/*
  Penjelasan:
  Button dengan tulisan "Loading..." tidak muncul ketika handleSubmit dijalankan karena penggunaan prop `action` pada elemen <form>.
  Pada React/Next.js, jika kita menggunakan prop `action` pada <form> (fitur server actions), maka submit form akan langsung men-trigger function server (atau async function) dan tidak menjalankan event handler di client (misal: onSubmit).
  Akibatnya, state `loading` yang di-set di client (setLoading(true)) tidak pernah di-trigger sebelum server action berjalan, sehingga komponen tidak pernah merender kondisi loading di client.

  Solusi:
  - Jika ingin menampilkan loading di client, gunakan onSubmit pada <form> dan panggil handleSubmit dari situ, bukan lewat prop `action`.
  - Atau, jika ingin tetap menggunakan server action, loading hanya bisa di-handle di server, bukan di client-side state.

  Berikut contoh rewrite agar loading muncul (mengganti action={handleSubmit} menjadi onSubmit):

*/

export default function AskForm({
  handleAsk,
}: {
  handleAsk: (formData: FormData) => Promise<string>
}) {
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const question = formData.get('question')?.toString().trim()

    if (!question) {
      setLoading(false)
      setError("Question can't be empty.")
      return
    }

    try {
      const result = await handleAsk(formData)

      if (!result) {
        setError('No answer given.')
      } else {
        setAnswer(result)
        setLoading(false)
        setError(null)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to answer the question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-4 max-w-lg w-full'
    >
      {answer ? (
        <div className='mt-4 p-4 border-2 rounded border-dashed'>
          <p className='font-medium mb-4'>AI Answer:</p>

          <p className='italic text-center'>{answer}</p>
        </div>
      ) : (
        <p className='text-6xl'>What do you want to Ask?</p>
      )}

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
        className={error ? 'border-destructive' : ''}
      />

      {error && <p className='text-destructive font-semibold'>{error}</p>}

      <Button
        type='submit'
        className='w-full uppercase tracking-widest flex items-center justify-center cursor-pointer'
        disabled={loading}
      >
        {loading ? (
          <>
            <svg
              className='animate-spin h-5 w-5 mr-2 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
              ></path>
            </svg>
            Asking...
          </>
        ) : (
          'Ask'
        )}
      </Button>

      <Button
        variant='outline'
        className='cursor-pointer'
      >
        <Link href='/'>Upload Different Documents</Link>
      </Button>
    </form>
  )
}
