const express = require('express')
const app = express()

const db = require('./database/db.js')

// Template Engine
const nunjucks = require('nunjucks')
nunjucks.configure('src/views', {
    express: app,
    noCache: true
})

app.use(express.static('public')) // Transforma a pasta public em uma pasta 'padrão'

app.use(express.urlencoded( { extended: true} ))

app.get('/', (request, response) => {
    return response.render('index.html', { title: "Título"}) // .render envia variáveis para o frontend
})

app.get('/create-point', (request, response) => {
    // Query Strings (?, +, etc) das url's
    // console.log(request.query)
    
    return response.render('create-point.html')
})

app.post('/savepoint', (request,response) => {
    // console.log(request.body)

    const data = request.body

    const query = `
        INSERT INTO places (
            image,
            name, 
            address, 
            address2,
            state,
            city,
            items
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `
    const values = [
        data.image,
        data.name,
        data.address,
        data.address2,
        data.state,
        data.city,
        data.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return response.send("Erro no cadastro!")
        }

        console.log('Cadastrado com sucesso')
        console.log(this)

        return response.render('create-point.html', { saved: true })
    }

    db.run(query, values, afterInsertData)

})

app.get('/search', (request, response) => {

    const search = request.query.search

    if(search == "") {
        return response.render('search-results.html', { total: 0 })
    }

    // Seleciona tudo de 'places' onde cidade contém %{nome}%. As '%' seguinificam antes e/ou depois
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length
        // Exibe os dados do banco de dados no html
        return response.render('search-results.html', { places: rows, total})
    })
})

app.listen(3000)