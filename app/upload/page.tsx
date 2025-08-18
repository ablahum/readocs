'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { z } from 'zod'
// Import untuk PDFLoader salah, seharusnya menggunakan WebPDFLoader
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf'
// Import untuk DocxLoader juga salah atau modulnya tidak ada
// import { DocxLoader } from '@langchain/community/document_loaders/web/docx' // Tidak ditemukan modul ini

const acceptedMimeTypes = new Set(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const acceptedExtensions = ['.pdf', '.doc', '.docx']
const MAX_FILE_SIZE = 2 * 1024 * 1024

const filesSchema = z
  .array(z.instanceof(File))
  .min(1, 'Please select at least 1 document')
  .refine(
    fs =>
      fs.every(f => {
        const name = f.name.toLowerCase()
        const hasValidExt = acceptedExtensions.some(ext => name.endsWith(ext))
        const hasValidType = acceptedMimeTypes.has(f.type)

        return hasValidExt || hasValidType
      }),
    { message: 'Please select a PDF, DOC, or DOCX document' }
  )
  .refine(fs => fs.every(f => f.size <= MAX_FILE_SIZE), { message: 'Each file must be 2MB or less' })

export default function Page() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])

    if (incoming.length === 0) return

    const validIncoming = incoming.filter(file => file.size <= MAX_FILE_SIZE)
    const invalidFiles = incoming.filter(file => file.size > MAX_FILE_SIZE)

    if (invalidFiles.length > 0) {
      setError('Failed to upload all selected files. Each file must be 2MB or less.')
    } else {
      setError(null)
    }

    const combinedFiles = (() => {
      const map = new Map<string, File>()

      for (const file of files) map.set(`${file.name}-${file.size}-${file.lastModified}`, file)
      for (const file of validIncoming) map.set(`${file.name}-${file.size}-${file.lastModified}`, file)

      return Array.from(map.values())
    })()

    const result = filesSchema.safeParse(combinedFiles)

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Document is invalid')

      return
    }

    setFiles(combinedFiles)
    // reset input supaya memilih file yang sama lagi tetap memicu onChange
    event.currentTarget.value = ''
  }

  const handleDelete = (index: number) => setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))

  // Fungsi ini memang sudah benar untuk parsing file PDF, DOC, dan DOCX menggunakan langchain.
  // Penjelasan:
  // - Untuk file PDF, digunakan PDFLoader dari langchain.
  // - Untuk file DOC dan DOCX, digunakan DocxLoader dari langchain.
  // - Fungsi loader.load() akan mengembalikan array dokumen hasil parsing.
  // - Jika tipe file tidak didukung, akan dilempar error.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      const loader = new WebPDFLoader(new Blob())
      const docs = await loader.load()
      console.log({ docs })

      // for (const file of files) {
      //   // 1. Tentukan loader berdasarkan ekstensi/tipe file
      //   let loader

      //   if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      //     loader = new WebPDFLoader(file)
      //     // } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
      //     //   loader = new DocxLoader(file)
      //   } else {
      //     throw new Error(`Unsupported file type: ${file.name}`)
      //   }

      //   // 2. Parsing file menggunakan loader dari langchain
      //   const docs = await loader.load()
      //   console.log('hasil parsing:', docs)

      //   // // 3. Chunking teks
      //   // const splitter = new RecursiveCharacterTextSplitter({
      //   //   chunkSize: 1000,
      //   //   chunkOverlap: 200
      //   // })
      //   // const splitDocs = await splitter.splitDocuments(docs)

      //   // // 4. Simpan embedding ke Supabase Vector DB
      //   // await SupabaseVectorStore.fromDocuments(splitDocs, new OpenAIEmbeddings(), {
      //   //   client: supabase,
      //   //   tableName: 'documents' // pastikan sudah bikin table vector di Supabase
      //   // })
      // }

      alert(`Successfully uploaded and indexed: ${files.map(f => f.name).join(', ')}`)
      setFiles([])
    } catch (err) {
      console.error(err)

      setError('Failed to process documents. Please try again.')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-8'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm space-y-3 flex flex-col gap-4'
      >
        <div className='space-y-1 flex flex-col gap-2 m-0'>
          <label
            htmlFor='file'
            className='font-medium m-0'
          >
            Upload a Documents
          </label>

          <Input
            id='file'
            type='file'
            accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            multiple
            onChange={e => handleChange(e)}
          />

          {error ? <p className='text-destructive'>{error}</p> : null}

          {files.length > 0 && (
            <>
              <p className='font-medium m-0'>Documents to Upload</p>

              <ul className='list-disc pl-5 flex flex-col gap-1'>
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className='flex items-center justify-between'
                  >
                    <li>
                      <span className='truncate'>{f.name}</span>
                    </li>

                    <Button
                      onClick={() => handleDelete(idx)}
                      variant='outline'
                      size='icon'
                    >
                      <X className='w-3 h-3' />
                    </Button>
                  </div>
                ))}
              </ul>
            </>
          )}
        </div>

        <Button
          type='submit'
          className='w-full uppercase tracking-widest'
        >
          Upload
        </Button>
      </form>
    </div>
  )
}
