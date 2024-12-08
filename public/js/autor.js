const DB_URL = 'http://localhost:3000/db';

    $(document).ready(function() {
    $.ajax({
        url: `${DB_URL}/autor`,
        method: 'GET',
        success: function(response) {
            const autor = response;
            $('#sobrealuno').text(autor.bio);
            $('#alunonome').text(autor.nome);
            $('#alunocuso').text(autor.curso);
            $('#alunoturma').text(autor.turma);
        },
        error: function() {
            console.error('Erro ao carregar o autor');
        }
    });
})
