const { runHttpQuery, convertNodeHttpToRequest } = require('apollo-server-core')

exports.handleGraphqlRequest = async (req, res, apolloServer) => {
  const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
    method: req.method,
    query: req.body,
    options: await apolloServer.graphQLServerOptions({ req, res }),
    request: convertNodeHttpToRequest(req),
  })

  if (responseInit.headers) {
    for (const [name, value] of Object.entries(responseInit.headers)) {
      res.setHeader(name, value)
    }
  }

  res.write(graphqlResponse)
  res.end()
}
