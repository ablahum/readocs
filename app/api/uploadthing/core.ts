import { createUploadthing, type FileRouter } from 'uploadthing/next'

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
      return {}
    })
    .onUploadComplete(async () => {}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
