import express from 'express'
import bodyParser from 'body-parser'
import consolidate from 'consolidate'

import { authServer } from './lib/auth-server.js'
import { client } from './lib/clients.js'
import { generateRandomString, buildURL } from './lib/utils.js'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('html', consolidate.underscore)
app.set('view engine', 'html')
app.set('views', 'src/views/client')

// protected resource information
const protectedResourseEndpoint = 'http://localhost:9002/resource'

let code = null
let state = null
let access_token = null
let scope = null

app.get('/', (req, res) => {
  res.render('index', { code, access_token, scope })
})

app.get('/authorize', (req, res) => {
  access_token = null
  scope = null
  state = generateRandomString()

  // mount redirect URL and redirect to Authorization Server (Front Channel Flow)
  const authorizeUrl = buildURL(authServer.authorizationEndpoint, {
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    scope: client.scope,
    state,
  })
  console.log('Redirecting to:', authorizeUrl.toString())
  res.redirect(authorizeUrl)
})

app.get('/callback', (req, res) => {
  const error = req.query.error
  if (error) {
    res.render('error', { error })
    return
  }

  const responseState = req.query.state
  if (responseState !== state) {
    res.render('error', { error: 'State value does not match' })
    return
  }

  code = req.query.code
  res.render('index', { code, access_token, scope })
})

app.get('/exchange-code', (req, res) => {
  if (!code) {
    res.render('error', { error: 'Missing authorization code' })
    return
  }

  const formData = {
    code,
    grant_type: 'authorization_code',
    redirect_uri: client.redirect_uris[0],
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(
      `${client.client_id}:${client.client_secret}`
    ).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  fetch(authServer.tokenEndpoint, {
    method: 'POST',
    body: new URLSearchParams(formData),
    headers,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Access token:', data)
      code = null
      access_token = data.access_token
      scope = data.scope
      res.render('index', { code, access_token, scope })
    })
    .catch((error) => {
      console.error('Error:', error)
      res.render('error', {
        error,
      })
    })
})

app.get('/fetch_resource', (req, res) => {})

app.listen(9000, 'localhost', () => {
  console.log('Client is running on port 9000')
})
