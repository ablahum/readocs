import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

//? METHOD GET UNTUK APA?
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
})
