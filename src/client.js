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

let state = null
let access_token = null
let scope = null

app.get('/', (req, res) => {
  res.render('index', { access_token, scope })
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

app.get('/callback', (req, res) => {})

app.get('/fetch_resource', (req, res) => {})

app.listen(9000, 'localhost', () => {
  console.log('Client is running on port 9000')
})
