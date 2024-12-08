$(document).ready(function() {

    const API_URL = 'http://localhost:3000/api';
    const FAVORITES_URL = 'http://localhost:3000/db/series_preferidas';
    const USER_ID = 1; // Substituir pelo ID real do usuário
    const mapeamentoGeneros_cores = {};


    function updateCarousel() {
        $.ajax({
            url: `${API_URL}/series-populares`,
            method: 'GET',
            success: function(response) {
                const series = response.results.slice(0, 3);

                $('.carousel-inner').empty();

                series.forEach((serie, index) => {
                    const imgUrl = `https://image.tmdb.org/t/p/original/${serie.backdrop_path}`;
                    const carouselItem = `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${imgUrl}" class="d-block" alt="Imagem da série" style="max-height: 500px; margin: 0 auto;">
                        </div>
                    `;
                    $('.carousel-inner').append(carouselItem);
                });

                const controls = `
                    <button class="carousel-control-prev text-dark" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                `;
                $('#carouselExampleControls').append(controls);
            },
            error: function() {
                console.error('Erro ao carregar as séries populares');
            }
        });
    }

    function getStars(vote_average) {
        const fullStars = Math.floor(vote_average / 2);
        const halfStar = vote_average % 2 >= 1 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-warning"></i>';
        }
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-warning"></i>';
        }
        return starsHTML;
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }   

    function getCardHTML(serie) {
        if (serie.genres === undefined) {
            serie.genres = [];
        }

        const cardHTML = `
                        <div class="col">
                            <div class="card h-100">
                                <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="img-fluid" alt="Imagem da Série" style="max-width: 300px; margin: 0 auto;">
                                <div class="card-body">
                                    <h5 class="card-title">${serie.name}</h5>
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="me-2">
                                            ${getStars(serie.vote_average)}
                                        </div>
                                        <small>${serie.vote_average.toFixed(1)} (${serie.vote_count} avaliações)</small>
                                    </div>
                                    <div class="d-flex p-1 flex-wrap gap-2">
                                        ${serie.genres.map(genre => {
                                            if (!mapeamentoGeneros_cores[genre.name]) {
                                                mapeamentoGeneros_cores[genre.name] = getRandomColor();
                                            }
                                            const cor = mapeamentoGeneros_cores[genre.name];
                                            return `<span class="badge" style="background-color: ${cor};">${genre.name}</span>`;
                                        }).join('')}
                                    </div>
                                    <p class="card-text">${serie.overview}</p>
                                </div>
                                <div class="card-footer d-flex justify-content-between">
                                    <a class="btn d-block mx-auto favorite-btn" data-id="${serie.id}" data-name="${serie.name}">
                                        <i class="far fa-heart fs-5"></i>
                                        Favoritar
                                    </a>
                                    <a class="btn d-block mx-auto" href="serie.html?id=${serie.id}">
                                        <i class="fas fa-info-circle fs-5"></i>
                                        Detalhes
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
        return cardHTML;
    }

    function mostrarNovidades() {
        $.ajax({
            url: `${API_URL}/series-populares`,
            method: 'GET',
            success: function(response) {
                const series = response.results.slice(0, 6);
                series.forEach((serie) => {
                    const cardHTML = getCardHTML(serie);
                    $('#novidadesindex').append(cardHTML);
                });
    
                $('.favorite-btn').on('click', toggleFavorite);
    
                updateMinhasSeries();
                loadFavorites();
            },
            error: function() {
                console.log("Erro ao carregar as séries.");
            }
        });
    
    }

    function loadFavorites() {
        $.ajax({
            url: FAVORITES_URL,
            method: 'GET',
            success: function(favorites) {
                favorites.forEach(favorite => {
                    const favoriteButton = $(`.favorite-btn[data-id="${favorite.serie_id}"]`);
                    favoriteButton.find('i').removeClass('far').addClass('fas');
                    favoriteButton.html(`
                        <i class="fas fa-heart fs-5 text-danger"></i> Favoritado
                    `);
                });
            },
            error: function() {
                console.error('Erro ao carregar as séries favoritadas.');
            }
        });
    }

    function updateMinhasSeries() {
        $.ajax({
            url: FAVORITES_URL,
            method: 'GET',
            success: function(favorites) {
                if ($('#minhasseries').length === 0) {
                    return;
                }
                $('#minhasseries').empty();
                favorites.forEach(favorite => {
                    if (favorite.serie_id === undefined) {
                        return;
                    }
                    $.ajax({
                        url: `${API_URL}/serie/${favorite.serie_id}`,
                        method: 'GET',
                        success: function(serie) {
                            const cardHTML = getCardHTML(serie);
                            $('#minhasseries').append(cardHTML);
                            $(`.favorite-btn[data-id="${favorite.serie_id}"]`).each(function() {
                                $(this).find('i').removeClass('far').addClass('fas');
                                $(this).html(`
                                    <i class="fas fa-heart fs-5 text-danger"></i> Favoritado
                                `);
                                $(this).off('click', toggleFavorite);
                                $(this).on('click', toggleFavorite);
                            });
                        },
                        error: function() {
                            console.error('Erro ao carregar a série favoritada.');
                        }
                    });
                });
            },
            error: function() {
                console.error('Erro ao carregar as séries favoritadas.');
            }
        });
    }

    function toggleFavorite() {
        const serieId = $(this).data('id');
        const serieName = $(this).data('name');
        const $button = $(this);

        $.ajax({
            url: FAVORITES_URL,
            method: 'GET',
            success: function(favorites) {
                const favorited = favorites.find(fav => fav.serie_id === serieId && fav.user_id === USER_ID);

                if (favorited) {
                    // Remove dos favoritos
                    $.ajax({
                        url: `${FAVORITES_URL}/${favorited.id}`,
                        method: 'DELETE',
                        success: function() {
                            // procurar todos os botões com a mesma série no html e atualizar, que tem data-id igual a serieId
                            $(`.favorite-btn[data-id="${serieId}"]`).each(function() {
                                $(this).find('i').removeClass('fas').addClass('far');
                                $(this).html(`
                                    <i class="far fa-heart fs-5"></i>
                                    Favoritar
                                `);
                            });
                            updateMinhasSeries();
                        },
                        error: function() {
                            console.error('Erro ao remover dos favoritos.');
                        }
                    });
                } else {
                    // Adiciona aos favoritos
                    $.ajax({
                        url: FAVORITES_URL,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            id: Date.now(),
                            serie_id: serieId,
                            user_id: USER_ID
                        }),
                        success: function() {
                            const $buttons = $(`.favorite-btn[data-id="${serieId}"]`);
                            $buttons.find('i').removeClass('far').addClass('fas');
                            $buttons.html(`
                                <i class="fas fa-heart fs-5 text-danger"></i> Favoritado
                            `);
                            updateMinhasSeries();
                        },
                        error: function() {
                            console.error('Erro ao adicionar aos favoritos.');
                        }
                    });
                }
            },
            error: function() {
                console.error('Erro ao verificar favoritos.');
            }
        });
    }

    function fetchSeriesWithFilters() {
        const genre = $('#genreSelect').val();
        const rating = $('#ratingSelect').val();
        const query = $('input[type="search"]').val() || 'a';
        let url = `${API_URL}/buscar-series/${query}`;
        if (genre) {
            url += `?genre=${genre}`;
        }
        if (rating) {
            url += genre ? `&rating=${rating}` : `?rating=${rating}`;
        }
    
        $.ajax({
            url,
            method: 'GET',
            success: function(response) {
                displayExplorerCards(response.results);
            },
            error: function() {
                console.error('Erro ao carregar séries com filtros.');
            }
        });
    }

    function displayExplorerCards(series) {
        $('#explorerindex').empty();
    
        if (series.length === 0) {
            $('#explorerindex').append('<p class="text-center">Nenhuma série encontrada com os filtros aplicados.</p>');
            return;
        }
    
        series.forEach(serie => {
            const cardHTML = getCardHTML(serie);
            $('#explorerindex').append(cardHTML);
            $(`.favorite-btn[data-id="${serie.id}"]`).on('click', toggleFavorite);
        });
    }

    function detalhesSerie() {
        const urlParams = new URLSearchParams(window.location.search);
        const serieId = urlParams.get('id');
        $.ajax({
            url: `${API_URL}/serie/${serieId}`,
            method: 'GET',
            success: function(response) {
                const serie = response;
                console.log(serie);
                const img = `https://image.tmdb.org/t/p/w300${serie.poster_path}`
                $('#serieImg').attr('src', img);
                $('#serieNome').text(serie.name);
                
                $('#serieStars').html(`
                    <div class="me-2">
                        ${getStars(serie.vote_average)}
                    </div>
                    <small>${serie.vote_average.toFixed(1)} (${serie.vote_count} avaliações)</small>
                `);
                
                $('#serieGenres').html(`
                    <div class="d-flex p-1 flex-wrap gap-2">
                        ${serie.genres.map(genre => {
                            if (!mapeamentoGeneros_cores[genre.name]) {
                                mapeamentoGeneros_cores[genre.name] = getRandomColor();
                            }
                            const cor = mapeamentoGeneros_cores[genre.name];
                            return `<span class="badge" style="background-color: ${cor};">${genre.name}</span>`;
                        }).join('')}
                    </div>
                `);

                // #serieAudioOriginal e #serieDataLancamento
                $('#serieAudioOriginal').text(`Áudio original: ${serie.original_language}`);
                $('#serieDataLancamento').text(`Data de lançamento: ${serie.first_air_date.split('-').reverse().join('/')}`);
                
                $('#serieSinopse').text(serie.overview);
                $('#favoritarSerie').html(`
                    <a class="btn d-block mx-auto favorite-btn" data-id="${serie.id}" data-name="${serie.name}" id="favoritarSerie">
                        <i class="far fa-heart fs-5"></i>
                        Favoritar
                    </a>
                `);

                loadFavorites();

                $('#serieElenco').empty();
                
                serie.cast.forEach(cast => {
                    const img = cast.profile_path ? `https://image.tmdb.org/t/p/w300${cast.profile_path}` : 'https://via.placeholder.com/300';
                    const card = `
                        <div class="col">
                            <div class="card h-100">
                                <img src="${img}" class="card-img-top" alt="${cast.name}">
                                <div class="card-body">
                                    <h5 class="card-title">${cast.name}</h5>
                                    <p class="card-text">Personagem: ${cast.character}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#serieElenco').append(card);
                });

                $('#serieTemporadas').empty();
                serie.seasons.forEach(season => {
                    const seasonurl = `${API_URL}/serie/${serieId}/temporada/${season.season_number}`;
                    $.ajax({
                        url: seasonurl,
                        method: 'GET',
                        success: function(response) {
                            const season = response;
                            const accordion = `
                                <div class="accordion" id="accordionTemp${season.season_number}">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="heading${season.season_number}">
                                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${season.season_number}" aria-expanded="true" aria-controls="collapse${season.season_number}">
                                                Temporada ${season.season_number}
                                            </button>
                                        </h2>
                                        <div id="collapse${season.season_number}" class="accordion-collapse collapse" aria-labelledby="heading${season.season_number}" data-bs-parent="#accordionTemp${season.season_number}">
                                            <div class="accordion-body">
                                                <ul class="list-group">
                                                    ${season.episodes.map(episode => {
                                                        return `
                                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                ${episode.name}
                                                                <span class="badge bg-primary rounded-pill">${episode.runtime ? episode.runtime + 'min' : 'Duração desconhecida'}</span>
                                                            </li>
                                                        `;
                                                    }).join('')}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            $('#serieTemporadas').append(accordion);
                        }
                    });
                }).then(() => {
                    $('#serieTemporadas').html($('#serieTemporadas').children().sort((a, b) => {
                        const numA = $(a).find('.accordion-button').text().split(' ')[1];
                        const numB = $(b).find('.accordion-button').text().split(' ')[1];
                        return numA - numB;
                    }))
                })
                

            },
            error: function() {
                console.error('Erro ao carregar a série');
            }
        })

    }

    $('#searchForm').on('submit', function(event) {
        event.preventDefault();
        fetchSeriesWithFilters();
    });

    $('#filterForm').on('submit', function (event) {
        event.preventDefault();
        fetchSeriesWithFilters();
    });

    fetchSeriesWithFilters();

    // só chamar a função se estiver na página de detalhes
    if ($('#serieImg').length > 0) {
        detalhesSerie();
    }

    updateCarousel();
    mostrarNovidades();
});
