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

app.get('/resource', (req, res) => {})

app.listen(9002, 'localhost', () => {
  console.log('OAuth Resource Server is running on port 9002')
})
