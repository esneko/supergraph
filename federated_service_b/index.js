const { buildSubgraphSchema, printSchema } = require('@apollo/federation')
const { ApolloServer, gql } = require('apollo-server-express')
const express = require('express')
const { json } = require('body-parser')
const request = require('request-promise-native')

const typeDefs = gql`
  type Query {
    world: String
  }
`

typeDefs.toString = function () {
  return this.loc.source.body
}

const resolvers = {
  Query: {
    world: () => 'Mundo',
  },
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
})

const app = express()
const router = express.Router()

app.use(router)
router.use(json())

app.listen({ port: 6102 }, () => {
  console.log(`🚀 Server ready at http://localhost:6102`)
})

// TODO
;(async () => {
  try {
    console.log('Starting server', server.graphqlPath)
    await server.start()
    server.applyMiddleware({ app })

    console.log('Registering schema', typeDefs.toString())
    await request({
      timeout: 5000,
      baseUrl: 'http://localhost:6001',
      url: '/schema/push',
      method: 'POST',
      json: true,
      body: {
        name: 'service_b',
        version: 'v1',
        type_defs: typeDefs.toString(),
        url: 'http://localhost:6102',
      },
    })
    console.info('Schema registered successfully!')
  } catch (err) {
    console.error(`Schema registration failed: ${err.message}`)
  }
})()
