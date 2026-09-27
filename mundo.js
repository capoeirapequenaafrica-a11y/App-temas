const Simulador = {
    canvas: null,
    ctx: null,
    
    // Lista de avatares com as imagens
    listaAvatares: [
        { nome: 'Menina Capoeira', src: 'avatar1.png' },
        { nome: 'Dinossauro', src: 'avatar2.png' },
        { nome: 'Onça Pintada', src: 'avatar3.png' },
        { nome: 'Mortal (Azul)', src: 'avatar4.png' },
        { nome: 'Mestre Gelo', src: 'avatar5.png' },
        { nome: 'Capoeira Reggae', src: 'avatar6.png' },
        { nome: 'Menino Listrado', src: 'avatar7.png' },
        { nome: 'B-Boy Invertido', src: 'avatar8.png' },
        { nome: 'Ninja Preto', src: 'avatar9.png' },
        { nome: 'Lutador Prata', src: 'avatar10.png' },
        { nome: 'Cyber Pink', src: 'avatar11.png' },
        { nome: 'Guerreiro Berimbau', src: 'avatar12.png' }
    ],
    
    avatarIndex: 0,
    imagensCarregadas: [], 
    
    // Posição do avatar
    x: 100,
    y: 110, 
    
    // Status do "Tamagotchi"
    status: {
        fome: 50,
        humor: 50,
        energia: 100
    },

    init() {
        this.canvas = document.getElementById('simCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // CORREÇÃO: Garante o tamanho da tela mesmo se a aba iniciar escondida
        let largura = this.canvas.parentElement.clientWidth;
        if (largura === 0) largura = window.innerWidth - 40;
        
        this.canvas.width = largura || 320;
        this.canvas.height = 220;

        // Pre-carregar todas as imagens
        this.carregarImagens();

        // Recupera dados salvos de sessões anteriores
        const salvo = localStorage.getItem('capoeira_simulador');
        if (salvo) {
            const dados = JSON.parse(salvo);
            this.avatarIndex = dados.avatarIndex || 0;
            this.status = dados.status || this.status;
        }

        this.atualizarBarras();
        this.escreverConsole("Terreiro Virtual iniciado. Use os controles!");
        
        // Inicia o motor de animação (Loop)
        requestAnimationFrame(() => this.loop());
    },

    carregarImagens() {
        this.listaAvatares.forEach((avatar, index) => {
            const img = new Image();
            img.src = avatar.src;
            this.imagensCarregadas[index] = img;
        });
    },

    entrarMundoAberto() {
        if (typeof abrirAba === 'function') abrirAba('tabSimulador');
        
        // Tira a tela preta e mostra o jogo
        document.getElementById('simAreaLogin').style.display = 'none';
        document.getElementById('simAreaJogo').style.display = 'block';
        
        const nome = document.getElementById('nomeJogadorTab')?.value || 'Capoeirista';
        const txtJogador = document.getElementById('simTxtJogador');
        if(txtJogador) txtJogador.innerText = nome;
        
        if (!this.canvas) this.init();
    },

    salvar() {
        localStorage.setItem('capoeira_simulador', JSON.stringify({
            avatarIndex: this.avatarIndex,
            status: this.status
        }));
    },

    trocarAvatar() {
        this.avatarIndex = (this.avatarIndex + 1) % this.listaAvatares.length;
        this.salvar();
        const nomeAtual = this.listaAvatares[this.avatarIndex].nome;
        this.escreverConsole(`Avatar trocado para: ${nomeAtual}`);
    },

    controleFlutuante(acao) {
        const passo = 15; 
        
        if (acao === 'esquerda') {
            this.x = Math.max(30, this.x - passo);
            this.escreverConsole("Esquiva para trás!");
        }
        if (acao === 'direita') {
            this.x = Math.min(this.canvas.width - 30, this.x + passo);
            this.escreverConsole("Avanço de ginga!");
        }
        if (acao === 'golpe') {
            this.escreverConsole("Aplicou um golpe forte!");
            this.gastarEnergia(5);
        }
        if (acao === 'defesa') {
            this.escreverConsole("Esquiva rápida!");
            this.gastarEnergia(2);
        }
    },

    gastarEnergia(qtd) {
        this.status.energia = Math.max(0, this.status.energia - qtd);
        this.atualizarBarras();
        this.salvar();
    },

    alimentar() {
        if (this.status.fome >= 100) {
            this.escreverConsole("O avatar já está cheio!");
            return;
        }
        this.status.fome = Math.min(100, this.status.fome + 20);
        this.escreverConsole("+ Comida. A fome diminuiu!");
        this.atualizarBarras();
        this.salvar();
    },

    alongar() {
        this.status.humor = Math.min(100, this.status.humor + 15);
        this.status.energia = Math.min(100, this.status.energia + 10);
        this.escreverConsole("Alongamento finalizado. Bom humor!");
        this.atualizarBarras();
        this.salvar();
    },

    treinar() {
        let reps = parseInt(document.getElementById('simNumReps').value) || 0;
        if (reps > 0) {
            if (this.status.energia < reps) {
                this.escreverConsole("Sem energia! Coma ou alongue antes.");
                return;
            }
            this.status.energia = Math.max(0, this.status.energia - reps);
            this.status.fome = Math.max(0, this.status.fome - (reps/2));
            this.escreverConsole(`Treino: ${reps} repetições concluídas.`);
            this.atualizarBarras();
            this.salvar();
        }
    },

    atualizarBarras() {
        const barFome = document.getElementById('simBarFome');
        const barHumor = document.getElementById('simBarHumor');
        const barEnergia = document.getElementById('simBarEnergia');
        
        if (barFome) barFome.style.width = this.status.fome + '%';
        if (barHumor) barHumor.style.width = this.status.humor + '%';
        if (barEnergia) barEnergia.style.width = this.status.energia + '%';
    },

    escreverConsole(msg) {
        const cons = document.getElementById('simConsole');
        if (cons) {
            cons.innerHTML += `<div>> ${msg}</div>`;
            cons.scrollTop = cons.scrollHeight;
        }
    },

    draw() {
        if (!this.ctx) return;
        
        // Efeito RETRÔ / PIXEL 2D ATIVADO
        this.ctx.imageSmoothingEnabled = false;

        // Fundo (Céu do Terreiro)
        this.ctx.fillStyle = '#0b171d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Chão (Terreiro)
        this.ctx.fillStyle = '#16232b';
        this.ctx.fillRect(0, this.y + 60, this.canvas.width, this.canvas.height);
        
        // Linha do horizonte
        this.ctx.strokeStyle = '#2a3f4a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.y + 60);
        this.ctx.lineTo(this.canvas.width, this.y + 60);
        this.ctx.stroke();

        // Sombra escura do Avatar no chão
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x, this.y + 65, 30, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Desenha a Imagem do Avatar Atual
        const imgAtual = this.imagensCarregadas[this.avatarIndex];
        
        if (imgAtual && imgAtual.complete) {
            const larguraAvatar = 100;
            const alturaAvatar = 120;
            
            this.ctx.drawImage(
                imgAtual, 
                this.x - (larguraAvatar / 2), 
                this.y - (alturaAvatar / 2), 
                larguraAvatar, 
                alturaAvatar
            );
        } else {
            // Se a internet estiver lenta, mostra isso até a foto carregar
            this.ctx.fillStyle = '#00e676';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Carregando...", this.x, this.y);
        }
    },

    loop() {
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
};

// ==========================================
// CORREÇÃO: LIGA O JOGO AO CLICAR NA ABA
// ==========================================
setTimeout(() => {
    // Procura o botão da aba "Mundo" lá em cima
    const botoesAba = document.querySelectorAll('.tabs button');
    botoesAba.forEach(btn => {
        if (btn.innerText.includes('Mundo')) {
            // Quando clicar na aba, força o jogo a aparecer
            btn.addEventListener('click', () => {
                Simulador.entrarMundoAberto();
            });
        }
    });
    
    // Se você recarregar a página e já estiver na aba Mundo, liga direto
    const abaMundoAberta = document.getElementById('tabSimulador');
    if (abaMundoAberta && abaMundoAberta.classList.contains('active')) {
        Simulador.entrarMundoAberto();
    }
}, 800);