/* Iida Peltonen 2022 */

const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
/*   console.log('Met¢hod:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---') */
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Täällä ei ole mitään nähtävää!</h1>')
})

//uuden luonti
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  Person.find({})
    .then(result => {

      console.log(result)
      const checkPersons = result.some(findPerson => findPerson.name === body.name)

      if (checkPersons) {
        return response.status(400).json({
          error: 'Sama henkilö on jo tietokannassa!'
        })
      } else {
        
        // Jos tietokannasta ei löydy entuudestaan samaa henkilöä,
        // niin ainoastaan silloin me tallennetaan kyseinen henkilö
        // tietokantaan. Voit mietti myös miten otetaan huomioon,
        // jos henkilö on tietokannassa jo mutta halutaan esim.
        // päivittää henkilön numero ainoastaan. Tälle kentiees
        // vois lisätä uuden if ehdon :)
        const newPerson = new Person({
          name: body.name,
          number: body.number
        });
        newPerson.save()
        return response.json(newPerson)
      }

    })
    .catch(error => next(error))

  //jos uudelle hlöllä ei ole annettu nimeäääääääää
  if (body.name === '') {
    return response.status(400).json({
      error: 'Nimi puuttuu'
    })
  }
  //jos uudelle hlöllä ei ole annettu numeroa
  if (body.number === '') {
    return response.status(400).json({
      error: 'Numero puuttuu'
    })
  }
})

//kaikkien luettelo
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//poisto id:n perusteella
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//haku id-numerolla
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//vanhan päivitys
app.put('/api/persons/:id', (request, response, next) => {

  const body = request.body
  Person.findByIdAndUpdate(request.params.id, {
    name: body.name,
    number: body.number
  })
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

//info-sivu
app.get('/info', (request, response, next) => {
  const today = new Date()
  //ajaksi utc
  const time = today.toUTCString()
  let maara = 0
  Person.find({})
    .then(person => {
      if (person) {
        maara = person.length
        response.send(
          `<p>Luettelossa on ${maara} henkilön tiedot </p>
        <p> ${time}</p>`
        )
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/* 
const morgan = require('morgan')

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :type')
)

morgan.token('type', (request, response) => JSON.stringify(request.body))

morgan.token('param', function (request, response, param) {
  return request.params[param]
})

*/