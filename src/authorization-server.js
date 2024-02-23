import express from 'express'
import bodyParser from 'body-parser'
import consolidate from 'consolidate'

import { authServer } from './lib/auth-server.js'
import { allClients } from './lib/clients.js'
import { generateRandomString, buildURL } from './lib/utils.js'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('html', consolidate.underscore)
app.set('view engine', 'html')
app.set('views', 'src/views/authorization-server')
app.set('json spaces', 4)

function getClient(clientId) {
  return allClients.find((client) => client.client_id === clientId)
}

function decodeClientCredential(authorization) {
  const token = authorization.split(' ')[1]
  const buffer = Buffer.from(token, 'base64')
  const [clientId, clientSecret] = buffer.toString().split(':')
  return { clientId, clientSecret }
}

let codes = []
let requests = []

app.get('/authorize', (req, res) => {
  const clientId = req.query.client_id
  const redirectUri = req.query.redirect_uri

  const client = getClient(clientId)
  if (!client) {
    res.render('error', { error: 'Unknown client' })
    return
  }

  const hasClientRedirectUri = client.redirect_uris.includes(redirectUri)
  if (!hasClientRedirectUri) {
    res.render('error', { error: 'Invalid redirect URI' })
    return
  }

  const reqid = generateRandomString(8)
  requests[reqid] = req.query

  res.render('approve', { client: client, reqid: reqid })
})

app.post('/approve', (req, res) => {
  const reqid = req.body.reqid
  const query = requests[reqid]
  delete requests[reqid]

  // there was no matching saved request, this is an error
  if (!query) {
    res.render('error', { error: 'No matching authorization request' })
    return
  }

  // if the user clicked 'Deny', there will be no 'approve' field
  // it should redirect back to client with an error
  if (!req.body.approve) {
    const urlToRedirect = buildURL(query.redirect_uri, {
      error: 'access_denied',
    })
    res.redirect(urlToRedirect)
    return
  }

  // for this example, only support authorization code grant
  if (query.response_type !== 'code') {
    const urlToRedirect = buildURL(query.redirect_uri, {
      error: 'unsupported_response_type',
    })
    res.redirect(urlToRedirect)
    return
  }

  const code = generateRandomString()
  codes[code] = { request: query }

  const successRedirectURL = buildURL(query.redirect_uri, {
    code,
    state: query.state,
  })
  res.redirect(successRedirectURL)
})

app.post('/token', (req, res) => {
  const auth = req.headers.authorization

  const { clientId, clientSecret } = decodeClientCredential(auth)
  const client = getClient(clientId)
  if (!client || client?.client_secret !== clientSecret) {
    console.log('Unknown client', clientId)
    res.status(401).json({ error: 'invalid client' })
    return
  }

  if (req.body.grant_type !== 'authorization_code') {
    res.status(400).json({ error: 'invalid_grant' })
    return
  }

  const code = codes[req.body.code]
  if (!code) {
    res.status(400).json({ error: 'invalid_grant' })
    return
  }
  delete codes[req.body.code]

  if (code.request.client_id !== clientId) {
    res.status(400).json({ error: 'invalid_grant' })
    return
  }

  const accessToken = generateRandomString()
  // TODO: insert access token into DB
  const tokenResponse = {
    access_token: accessToken,
    token_type: 'Bearer',
  }
  res.status(200).json(tokenResponse)
})

app.listen(9001, 'localhost', () => {
  console.log('OAuth Authorization server is running on port 9001')
})
