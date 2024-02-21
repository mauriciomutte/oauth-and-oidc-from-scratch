import express from 'express'
import bodyParser from 'body-parser'

import { authServer } from './lib/auth-server.js'
import { allClients } from './lib/clients.js'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function getClient(clientId) {
  return allClients.find((client) => client.client_id === clientId)
}

let codes = []
let requests = []

app.get('/authorize', (req, res) => {})

app.post('/approve', (req, res) => {})

app.post('/token', (req, res) => {})

app.listen(9001, 'localhost', () => {
  console.log('OAuth Authorization server is running on port 9001')
})
