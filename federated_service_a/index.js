const { buildSubgraphSchema, printSchema } = require('@apollo/federation')
const { ApolloServer, gql } = require('apollo-server-express')
const express = require('express')
const { json } = require('body-parser')
const request = require('request-promise-native')

const typeDefs = gql`
  type Query {
    hello: String
  }
`

typeDefs.toString = function () {
  return this.loc.source.body
}

const resolvers = {
  Query: {
    hello: () => 'Hola',
  },
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
})

const app = express()
const router = express.Router()

app.use(router)
router.use(json())

app.listen({ port: 6101 }, () => {
  console.log(`Server ready at http://localhost:6101`)
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
        name: 'service_a',
        version: 'v1',
        type_defs: typeDefs.toString(),
        url: 'http://localhost:6101',
      },
    })
    console.info('Schema registered successfully!')
  } catch (err) {
    console.error(`Schema registration failed: ${err.message}`)
  }
})()
