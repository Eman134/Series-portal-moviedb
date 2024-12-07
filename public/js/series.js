const API_URL = 'http://localhost:3000/api';

$(document).ready(function() {

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

    const mapeamentoGeneros_cores = {}

    function mostrarNovidades() {
        
        $.ajax({
            url: `${API_URL}/series-populares`,
            method: 'GET',
            success: function(response) {
                const series = response.results.slice(0, 12);
    
                series.forEach((serie) => {
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
                                        ${serie.genres_names.map(name => {
                                            if (!mapeamentoGeneros_cores[name]) {
                                                mapeamentoGeneros_cores[name] = getRandomColor();
                                            }
                                            const cor = mapeamentoGeneros_cores[name];
                                            return `<span class="badge" style="background-color: ${cor};">${name}</span>`;
                                        }).join('')}
                                    </div>
                                    <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                </div>
                                <div class="card-footer d-flex justify-content-between">
                                    <a class="btn d-block mx-auto">
                                        <i class="fas fa-heart fs-5 text-danger"></i>
                                        Favoritar
                                    </a>
                                    <a class="btn d-block mx-auto">
                                        <i class="far fa-eye fs-5"></i>
                                        Assistir
                                    </a>
                                    <a class="btn d-block mx-auto" href="serie.html">
                                        <i class="fas fa-info-circle fs-5"></i>
                                        Detalhes
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#novidadesindex').append(cardHTML);
                });
            },
            error: function() {
                console.log("Erro ao carregar as séries.");
            }
        });

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
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
    }

    updateCarousel();
    mostrarNovidades();
});