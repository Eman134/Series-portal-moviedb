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

// teste de rota http://localhost:3000/api/generos
server.get('/api/generos', async (req, res) => {
    if (genres.length === 0) {
        await carregarGeneros();
    }
    res.json(genres);
});

// https://api.themoviedb.org/3/search/tv?language=pt-BR&query=serie&page=1
// teste de rota http://localhost:3000/api/bus  car-series/serie
server.get('/api/buscar-series/:query', async (req, res) => {
    const query = req.params.query;
    const { rating, genre } = req.query;

    if (!query || query === '') {
        res.status(400).json({ message: 'O termo de busca é obrigatório' });
        return;
    }

    const series = [];
    const maxResults = 30;
    const maxPages = 500;
    let currentPage = 1; 

    console.log(`Buscando a série com o termo ${query}, filtro rating: ${rating}, filtro gênero: ${genre}`);

    const options = {
        method: 'GET',
        url: `${THE_MOVIE_DB_API_URL}/search/tv?language=pt-BR&query=${query}`,
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
    };

    while (series.length < maxResults && currentPage <= maxPages) {
        try {
            const response = await axios.request({ ...options, url: `${options.url}&page=${currentPage}` });
            const data = response.data;

            for (const serie of data.results) {
                serie.genres_names = [];
                for (const genreId of serie.genre_ids) {
                    const nome = await nomeGenero(genreId);
                    serie.genres_names.push(nome);
                }
            }

            const filteredResults = data.results.filter(serie => {
                const meetsRating = !rating || checkRating(serie.vote_average, rating);
                const meetsGenre = !genre || serie.genre_ids.includes(parseInt(genre, 10));
                return meetsRating && meetsGenre;
            });

            series.push(...filteredResults);
            console.log(`Adicionados ${filteredResults.length} resultados da página ${currentPage}. Total: ${series.length}`);

            if (filteredResults.length === 0 && currentPage === data.total_pages) {
                break;
            }

        } catch (error) {
            console.error(`Erro na página ${currentPage}:`, error.message);
            break;
        }

        currentPage++;
    }

    res.json({ results: series.slice(0, maxResults) });
});

// Função para verificar o rating
function checkRating(voteAverage, rating) {
    const ratingMap = {
        acima_0: 0,
        acima_3: 3,
        acima_5: 5,
        acima_8: 8
    };

    const requiredRating = ratingMap[rating];
    if (requiredRating === undefined) {
        return true;
    }

    return voteAverage >= requiredRating;
}


// https://api.themoviedb.org/3/tv/popular?language=pt-BR&page=1
// teste de rota http://localhost:3000/api/series-populares
// mudar para https://api.themoviedb.org/3/tv/top_rated
server.get('/api/series-populares', async (req, res) => {
    console.log('Recuperando as séries populares...');
    const options = {
        method: 'GET',
        url: `${THE_MOVIE_DB_API_URL}/tv/top_rated?language=pt-BR&page=1`,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
    };
    try {
        const response = await axios.request(options);
        const data = response.data;
        await data.results.forEach(async serie => {
            serie.genres = []
            await serie.genre_ids.forEach(async genreId => {
                const nome = await nomeGenero(genreId);
                serie.genres.push({ id: genreId, name: nome });
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
    if (!id || id === '') {
        res.status(400).json({ message: 'O id da série é obrigatório' });
        return;
    }
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

        const elenco = await axios.request({
            method: 'GET',
            url: `${THE_MOVIE_DB_API_URL}/tv/${id}/credits?language=pt-BR`,
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            }
        });

        response.data.cast = elenco.data.cast;
        response.data.crew = elenco.data.crew;

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao recuperar a série' });
    }
});

// https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}
// teste de rota http://localhost:3000/api/serie/1/temporada/1
server.get('/api/serie/:id/temporada/:temporada', async (req, res) => {
    const id = req.params.id;
    const temporada = req.params.temporada;
    if (!id || id === '' || !temporada || temporada === '') {
        res.status(400).json({ message: 'O id da série e o número da temporada são obrigatórios' });
        return;
    }
    console.log(`Recuperando a temporada ${temporada} da série com id ${id}`);
    const options = {
        method: 'GET',
        url: `${THE_MOVIE_DB_API_URL}/tv/${id}/season/${temporada}?language=pt-BR`,
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
        res.status(500).json({ message: 'Erro ao recuperar a temporada' });
    }
});

server.use('/db', router);

server.listen(3000, () => {
  console.log('JSON Server está em execução!')
})