// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo implementa uma API RESTful baseada no JSONServer
// O servidor JSONServer fica hospedado na seguinte URL
// https://jsonserver.rommelpuc.repl.co/contatos
//
// Para montar um servidor para o seu projeto, acesse o projeto 
// do JSONServer no Replit, faça o FORK do projeto e altere o 
// arquivo db.json para incluir os dados do seu projeto.
//
// URL Projeto JSONServer: https://replit.com/@rommelpuc/JSONServer
//
// Autor: Rommel Vieira Carneiro
// Data: 03/10/2023

require('dotenv').config();
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./db/db.json')

const THE_MOVIE_DB_API_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const axios = require('axios');

// Para permitir que os dados sejam alterados, altere a linha abaixo
// colocando o atributo readOnly como false.
const middlewares = jsonServer.defaults()

const genres = []

// https://api.themoviedb.org/3/genre/tv/list?language=pt-BR
// teste de rota http://localhost:3000/api/genres

server.use(middlewares)

async function carregarGeneros() {
    try {
        const response = await axios.request({
            method: 'GET',
            url: `${THE_MOVIE_DB_API_URL}/genre/tv/list?language=pt-BR`,
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            }
        });
        genres.push(...response.data.genres);
    } catch (error) {
        console.error(error);
    }
}

async function nomeGenero(id) {
    const genre = genres.find(genre => genre.id === id);
    if (genre) {
        return genre.name;
    }
    await carregarGeneros();
    return genres.find(genre => genre.id === id).name;
}

// https://api.themoviedb.org/3/tv/popular?language=pt-BR&page=1
// teste de rota http://localhost:3000/api/series-populares
server.get('/api/series-populares', async (req, res) => {
    console.log('Recuperando as séries populares...');
    const options = {
        method: 'GET',
        url: `${THE_MOVIE_DB_API_URL}/tv/popular?language=pt-BR&page=1`,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
    };
    try {
        const response = await axios.request(options);
        const data = response.data;
        // colocar dentro de cada série, em data.results, o nome do gênero, que está em genre_ids, e aí pegar o nome do gênero
        await data.results.forEach(async serie => {
            serie.genres_names = [];
            serie.genre_ids.forEach(async genreId => {
                const nome = await nomeGenero(genreId);
                serie.genres_names.push(nome);
            })
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao recuperar as séries populares' });
    }
});

// https://api.themoviedb.org/3/tv/{series_id}
// teste de rota http://localhost:3000/api/serie/1
server.get('/api/serie/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`Recuperando a série com id ${id}`);
    const options = {
        method: 'GET',
        url: `${THE_MOVIE_DB_API_URL}/tv/${id}?language=pt-BR`,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
    };
    try {
        const response = await axios.request(options);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao recuperar a série' });
    }
});

server.use(router)

server.listen(3000, () => {
  console.log('JSON Server está em execução!')
})