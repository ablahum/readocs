import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { fi } from 'zod/locales'

const file = createUploadthing()

export const ourFileRouter = {
  documentUploader: file({
    pdf: {
      maxFileSize: '2MB',
      maxFileCount: 10,
    },
    'application/msword': {
      maxFileSize: '2MB',
      maxFileCount: 10,
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '2MB',
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      return { userId: 'anonymous' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // // Catatan: jika upload multiple, parameter 'file' akan berupa array
      // if (Array.isArray(file)) {
      //   file.forEach(f => {
      //     // console.log('Upload complete for userId:', metadata.userId)
      //     console.log('file', f)
      //   })
      // } else {
      //   // console.log('Upload complete for userId:', metadata.userId)
      //   console.log('file', file)
      // }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
