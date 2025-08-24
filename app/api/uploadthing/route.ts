import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

export const { POST } = createRouteHandler({
  router: ourFileRouter,
})
