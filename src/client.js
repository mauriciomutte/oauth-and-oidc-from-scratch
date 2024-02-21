import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'node:crypto'

import { authServer } from './lib/auth-server.js'
import { client } from './lib/clients.js'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// protected resource information
const protectedResourseEndpoint = 'http://localhost:9002/resource'

function generateRandomString() {
  return crypto.randomBytes(16).toString('hex')
}

let state = null
let access_token = null
let scope = null

app.get('/authorize', (req, res) => {
  access_token = null
  scope = null
  state = generateRandomString()

  // mount redirect URL to Authorization Server
  const authorizeUrl = new URL(authServer.authorizationEndpoint)
  authorizeUrl.searchParams.append('response_type', 'code')
  authorizeUrl.searchParams.append('client_id', client.client_id)
  authorizeUrl.searchParams.append('redirect_uri', client.redirect_uris[0])
  authorizeUrl.searchParams.append('scope', client.scope)
  authorizeUrl.searchParams.append('state', state)

  console.log('Redirecting to:', authorizeUrl.toString())
  res.redirect(authorizeUrl)
})

app.get('/callback', (req, res) => {})

app.get('/fetch_resource', (req, res) => {})

app.listen(9000, 'localhost', () => {
  console.log('Client is running on port 9000')
})
