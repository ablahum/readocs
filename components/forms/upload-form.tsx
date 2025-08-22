'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUploadThing } from '@/utils/uploadthing'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { z } from 'zod'
import path from 'path'
import { useRouter } from 'next/navigation'

const acceptedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const acceptedExtensions = ['.pdf', '.doc', '.docx']
const MAX_FILE_SIZE = 2 * 1024 * 1024

const filesSchema = z
  .array(z.instanceof(File))
  .refine(
    fs =>
      fs.every(f => {
        const name = f.name.toLowerCase()
        const hasValidExt = acceptedExtensions.some(ext => name.endsWith(ext))
        const hasValidType = acceptedMimeTypes.has(f.type)

        return hasValidExt || hasValidType
      }),
    { message: 'Please select only PDF, DOC, or DOCX document.' },
  )
  .refine(fs => fs.every(f => f.size <= MAX_FILE_SIZE), {
    message: 'Each file must be 2MB or less.',
  })

export default function UploadForm({
  processFiles,
}: {
  processFiles: (params: {
    fileType: string
    fileUrl: string
  }) => Promise<unknown>
}) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const { startUpload } = useUploadThing('documentUploader', {
    onClientUploadComplete: async result => {
      try {
        for (const res of result) {
          const fileType = path.extname(res.name).toLowerCase().replace('.', '')
          const fileUrl = res.ufsUrl

          await processFiles({ fileType, fileUrl })
        }

        router.push('/ask')
      } catch (err) {
        console.error('Error occurred while processing the file:', err)
      }
    },
    onUploadError: err => {
      console.error('Error occurred while uploading', err)
    },
    onUploadBegin: () => {},
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])

    if (incoming.length === 0) return

    const validIncoming = incoming.filter(file => file.size <= MAX_FILE_SIZE)
    const invalidFiles = incoming.filter(file => file.size > MAX_FILE_SIZE)

    if (invalidFiles.length > 0) {
      setError('Failed to select all documents. Each file must be 2MB or less.')
    } else {
      setError(null)
    }

    const combinedFiles = (() => {
      const map = new Map<string, File>()

      for (const file of files)
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file)
      for (const file of validIncoming)
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file)

      return Array.from(map.values())
    })()

    const result = filesSchema.safeParse(combinedFiles)

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Document is invalid.')

      return
    }

    setFiles(combinedFiles)
    event.currentTarget.value = ''
  }

  const handleDelete = (index: number) =>
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      //* UPLOAD FILES ---------------------------------------------------
      if (files.length === 0) {
        setError('Please select at least 1 document.')

        return
      } else if (files.length > 10) {
        setError('Please only select less than 10 documents.')

        return
      }

      const result = await startUpload(files)

      if (!result) {
        setError('Failed to upload documents. Please try again.')

        return
      }

      setFiles([])
      setLoading(false)
    } catch (err) {
      console.error(err)

      setError('Failed to process documents. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full max-w-lg space-y-3 flex flex-col gap-4'
    >
      <div className='space-y-1 flex flex-col gap-2 m-0'>
        <label
          htmlFor='file'
          className='font-medium m-0'
        >
          Upload Documents
        </label>

        <Input
          id='file'
          type='file'
          accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          multiple
          onChange={e => handleChange(e)}
          className={error ? 'border-destructive' : ''}
        />

        {error && <p className='text-destructive font-semibold'>{error}</p>}

        {files.length > 0 && (
          <>
            <p className='font-medium m-0'>Documents to Upload</p>

            <ol className='list-decimal pl-5 flex flex-col gap-1 [&>li]:font-semibold'>
              {files.map((f, idx) => (
                <li key={`${f.name}-${idx}`}>
                  <div className='flex items-center justify-between'>
                    <span className='truncate max-w-[300px] block font-normal'>
                      {f.name}
                    </span>

                    <Button
                      onClick={() => handleDelete(idx)}
                      variant='outline'
                      size='icon'
                      className='hover:border-destructive hover:outline-destructive cursor-pointer hover:bg-transparent'
                    >
                      <X className='w-3 h-3' />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <Button
        type='submit'
        className='w-full uppercase tracking-widest flex items-center justify-center'
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
            Uploading...
          </>
        ) : (
          'Upload'
        )}
      </Button>
    </form>
  )
}
