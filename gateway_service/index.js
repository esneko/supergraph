const express = require('express')
const { json } = require('body-parser')

const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway')
const { ApolloServerBase } = require('apollo-server-core')

const { handleGraphqlRequest } = require('./helpers')

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'service_a', url: 'http://localhost:6101/graphql' },
      { name: 'service_b', url: 'http://localhost:6102/graphql' },
    ],
  }),
  pollIntervalInMs: 10000,
  debug: true,
})

const apolloServer = new ApolloServerBase({
  gateway,
  subscriptions: false,
  debug: true,
})

const app = express()
const router = express.Router()

app.use(router)
router.use(json())

router.post('/graphql', (req, res, next) => {
  Promise.resolve(handleGraphqlRequest(req, res, apolloServer)).catch(next)
})

app.all('*', (req, res) => {
  return res.status(404).send('404: Not found')
})

app.listen(6100, () => {
  console.info('Server listening on port: 6100')
})

// TODO: wait until all services are available before starting the gateway server
;(async () => {
  try {
    console.log(`Starting server: ${apolloServer.graphqlPath}`)
    await apolloServer.start()
  } catch (err) {
    console.error(`Server failed to start: ${err.message}`)
  }
})()
