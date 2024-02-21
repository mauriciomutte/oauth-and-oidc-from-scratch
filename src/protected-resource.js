import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

function getProtectData() {
  return {
    name: 'Protected Resource',
    description: 'This data has been protected by OAuth 2.0',
  }
}

function getAccessToken(req, res, next) {
  const auth = req.headers['authorization']

  if (auth?.toLowerCase().indexOf('bearer ') !== 0) {
    return res.status(401).end()
  }

  const token = auth.slice('bearer '.length)
  console.log('Incoming token: %s', token)

  // TODO: Check token in database

  next()
}

app.get('/resource', getAccessToken, (req, res) => {
  const data = getProtectData()
  res.status(200).json(data)
})

app.listen(9002, 'localhost', () => {
  console.log('OAuth Resource Server is running on port 9002')
})
