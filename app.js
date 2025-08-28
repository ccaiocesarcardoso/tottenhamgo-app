let jogos = JSON.parse(localStorage.getItem('jogos')) || [];
let config = JSON.parse(localStorage.getItem('config')) || {};

$(document).ready(function() {
    loadConfig();
    renderJogos();
});

// === CONFIGURAÇÕES DO TIME ===
function saveConfig() {
    config.teamName = $('#teamName').val();
    config.responsavel = $('#responsavel').val();

    const file = $('#brasaoTime')[0].files[0];
    if (file) {
        config.brasaoTime = `assets/${file.name}`;
    }

    localStorage.setItem('config', JSON.stringify(config));
    alert('Configurações salvas!');
    renderJogos();
}

function loadConfig() {
    if (config.teamName) {
        $('#teamName').val(config.teamName);
    }
    if (config.responsavel) {
        $('#responsavel').val(config.responsavel);
    }
}

// === FORMATAÇÃO DE DATA ===
function formatData(dataStr) {
    const data = new Date(dataStr);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dd = String(data.getDate()).padStart(2, '0');
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const yyyy = data.getFullYear();
    const hh = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    const diaSemana = dias[data.getDay()];
    return `${dd}/${mm}/${yyyy} ${hh}:${min} (${diaSemana})`;
}

// === ADICIONAR JOGO ===
function addJogo() {
    const adversario = $('#adversario').val();
    const dataHora = $('#dataHora').val();
    const local = $('#local').val();

    if (!adversario || !dataHora || !local) {
        alert('Preencha todos os campos!');
        return;
    }

    const file = $('#brasaoAdversario')[0].files[0];
    const jogo = {
        adversario,
        dataHora,
        local,
        placar: '',
        atletas: []
    };

    if (file) {
        jogo.brasaoAdversario = `assets/${file.name}`;
    } else {
        jogo.brasaoAdversario = '';
    }

    salvarJogo(jogo);
}

function salvarJogo(jogo) {
    jogos.push(jogo);
    jogos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    localStorage.setItem('jogos', JSON.stringify(jogos));

    $('#adversario').val('');
    $('#dataHora').val('');
    $('#local').val('');
    $('#brasaoAdversario').val('');

    renderJogos();
    alert('Jogo adicionado com sucesso!');
}

// === RENDERIZAR JOGOS NA TELA ===
function renderJogos() {
    const lista = $('#listaJogos');
    lista.empty();

    if (jogos.length === 0) {
        lista.html('<p class="text-center text-muted">Nenhum jogo cadastrado.</p>');
        return;
    }

    const meuBrasao = config.brasaoTime ? `<img src="${config.brasaoTime}" class="team-logo" alt="Brasão do Meu Time">` : '';
    const meuNome = config.teamName || 'Meu Time';

    jogos.forEach((jogo, index) => {
        const atletasHtml = (jogo.atletas && jogo.atletas.length > 0) ?
            jogo.atletas.map(atleta => `<li class="list-group-item list-group-item-action py-1 d-flex justify-content-between align-items-center">${atleta} <button class="btn btn-sm btn-danger" onclick="removeAtleta(${index}, '${atleta}')"><i class="fas fa-times"></i></button></li>`).join('') :
            '<li class="list-group-item text-muted">Nenhum atleta adicionado.</li>';
        
        const adversarioBrasao = jogo.brasaoAdversario ? `<img src="${jogo.brasaoAdversario}" class="team-logo" alt="Brasão do Adversário">` : '';

        const placarHtml = jogo.placar ? `<p class="card-text text-center fw-bold fs-4">${jogo.placar}</p>` : '';

        const jogoCard = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 bg-white shadow-sm border-0">
                    <div class="card-body text-center">
                        <div class="matchup-container mb-3">
                            <div class="team-info">
                                ${meuBrasao}
                                <p class="team-name">${meuNome}</p>
                            </div>
                            <span class="vs-text">X</span>
                            <div class="team-info">
                                ${adversarioBrasao}
                                <p class="team-name">${jogo.adversario}</p>
                            </div>
                        </div>
                        ${placarHtml}
                        <hr class="my-3">
                        
                        <p class="card-text text-muted mb-1"><i class="fas fa-calendar-alt me-2"></i>${formatData(jogo.dataHora)}</p>
                        <p class="card-text text-muted mb-3"><i class="fas fa-map-marker-alt me-2"></i>${jogo.local}</p>
                        
                        <div class="d-flex justify-content-between mt-3">
                            <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${index})">
                                <i class="fas fa-edit me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#atletasCollapse-${index}">
                                <i class="fas fa-users me-1"></i> Atletas
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteJogo(${index})">
                                <i class="fas fa-trash me-1"></i> Excluir
                            </button>
                        </div>

                        <div class="collapse mt-3" id="atletasCollapse-${index}">
                            <div class="card card-body p-0 border-0">
                                <h6 class="mt-2 mb-2">Adicionar Atleta:</h6>
                                <div class="input-group mb-2">
                                    <input type="text" class="form-control form-control-sm" placeholder="Nome do Atleta" id="inputAtleta-${index}">
                                    <button class="btn btn-dark btn-sm" onclick="addAtleta(${index})">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <ul class="list-group list-group-flush" id="listaAtletas-${index}">
                                    ${atletasHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lista.append(jogoCard);
    });
}

// === FUNÇÕES DE AÇÃO DOS BOTÕES ===
function openEditModal(index) {
    const jogo = jogos[index];
    $('#editAdversario').val(jogo.adversario);
    $('#editDataHora').val(jogo.dataHora.substring(0, 16));
    $('#editLocal').val(jogo.local);
    $('#editPlacar').val(jogo.placar);
    $('#saveEditBtn').attr('onclick', `saveEdit(${index})`);
    
    const editModal = new bootstrap.Modal(document.getElementById('editGameModal'));
    editModal.show();
}

function saveEdit(index) {
    const jogo = jogos[index];
    jogo.adversario = $('#editAdversario').val();
    jogo.dataHora = $('#editDataHora').val();
    jogo.local = $('#editLocal').val();
    jogo.placar = $('#editPlacar').val();
    
    localStorage.setItem('jogos', JSON.stringify(jogos));
    renderJogos();
    
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editGameModal'));
    editModal.hide();
    alert('Jogo editado com sucesso!');
}

function deleteJogo(index) {
    if (confirm(`Tem certeza que deseja excluir o jogo contra ${jogos[index].adversario}?`)) {
        jogos.splice(index, 1);
        localStorage.setItem('jogos', JSON.stringify(jogos));
        renderJogos();
        alert('Jogo excluído!');
    }
}

function addAtleta(index) {
    const inputAtleta = $(`#inputAtleta-${index}`);
    const nomeAtleta = inputAtleta.val().trim();
    if (nomeAtleta) {
        jogos[index].atletas.push(nomeAtleta);
        localStorage.setItem('jogos', JSON.stringify(jogos));
        renderAtletas(index);
        inputAtleta.val('');
    }
}

function removeAtleta(jogoIndex, atletaNome) {
    const atletasDoJogo = jogos[jogoIndex].atletas;
    const indexAtleta = atletasDoJogo.indexOf(atletaNome);
    if (indexAtleta > -1) {
        atletasDoJogo.splice(indexAtleta, 1);
        localStorage.setItem('jogos', JSON.stringify(jogos));
        renderAtletas(jogoIndex);
    }
}

function renderAtletas(index) {
    const listaAtletas = $(`#listaAtletas-${index}`);
    listaAtletas.empty();
    const jogo = jogos[index];
    if (jogo.atletas.length > 0) {
        jogo.atletas.forEach(atleta => {
            listaAtletas.append(`<li class="list-group-item list-group-item-action py-1 d-flex justify-content-between align-items-center">${atleta} <button class="btn btn-sm btn-danger" onclick="removeAtleta(${index}, '${atleta}')"><i class="fas fa-times"></i></button></li>`);
        });
    } else {
        listaAtletas.append('<li class="list-group-item text-muted">Nenhum atleta adicionado.</li>');
    }
}