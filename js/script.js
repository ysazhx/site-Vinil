// Dados dos produtos
const products = [
    { id: 1, title: "Chicago", artist: "Michael Jackson", price: 129.90, genre: "Pop", label: "MJ", audio: './audio/chicago.mp3' },
    { id: 2, title: "Nuestra Canción", artist: "Monsieur ", price: 149.90, genre: "Rock", label: "MS", audio:'./audio/cancion.mp3' },
    { id: 3, title: "The Perfect Pair", artist: "beabadoobee", price: 119.90, genre: "Pop", label: "BD" , audio:'./audio/TP.mp3'},
    { id: 4, title: "Angels Like You", artist: "Miley Cyrus", price: 159.90, genre: "Pop", label: "MC", audio:'./audio/ANJOS.mp3' },
    { id: 5, title: "Leave me Alone", artist: "Flipp Dinero", price: 139.90, genre: "Rap", label: "FD", audio:'./audio/leavemealone.mp3' },
    { id: 6, title: "Garota de Ipanema", artist: "Tom Jombim", price: 169.90, genre: "MPB", label: "TJ" , audio:'./audio/a.mp3'},
    { id: 7, title: "Velha Infancia", artist: "Tribalistas", price: 129.90, genre: "MPB", label: "TB", audio:'./audio/Tribas.mp3' },
    { id: 8, title: "AQUELA PESSOA", artist: "Henrique e Juliano", price: 139.90, genre: "Sertanejo", label: "HJ" , audio: './audio/HJ.mp3'}
];



// Estado do player
let currentTrackIndex = 0;
let isPlaying = false;

// Preview player for product cards
let previewAudio = null;
let currentPreviewId = null;
let hoverTimeoutId = null;
let previewByHover = false;

// File input element (created on init)
let audioUploadInput = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // create hidden file input if present on loja page
    audioUploadInput = document.getElementById('audioUploadInput');
    if (!audioUploadInput) {
        audioUploadInput = document.createElement('input');
        audioUploadInput.type = 'file';
        audioUploadInput.accept = 'audio/*';
        audioUploadInput.style.display = 'none';
        audioUploadInput.id = 'audioUploadInput';
        document.body.appendChild(audioUploadInput);
    }

    audioUploadInput.addEventListener('change', handleLocalFileSelect);

    initializePage();
});

function initializePage() {
    const path = window.location.pathname;
    if (path.includes('loja.html') || path.endsWith('loja.html')) {
        initializeShop();
    } else if (path.includes('player.html') || path.endsWith('player.html')) {
        initializePlayer();
    }
}

// Loja
function initializeShop() {
    renderProducts();
    setupShopEventListeners();
}

function renderProducts() {
    const productsGrid = document.querySelector('.shop-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card pixel-border';
        productCard.dataset.productId = product.id;

        const audioButtonHtml = product.audio ? `<button class="pixel-btn small" data-preview-id="${product.id}" onclick="togglePreview(${product.id})">▶ Preview</button>`
            : `<button class="pixel-btn small" onclick="promptUpload(${product.id})">⬆️ Upload MP3</button>`;

        productCard.innerHTML = `
            <div class="pixel-vinyl-product">
                <div class="vinyl-label">${product.label}</div>
            </div>
            <h4>${product.title}</h4>
            <p>${product.artist}</p>
            <span class="price">R$ ${product.price.toFixed(2)}</span>
            <div style="margin-top: 15px;">
                ${audioButtonHtml}
                <button class="pixel-btn small" onclick="addToCart(${product.id})">Comprar</button>
            </div>
        `;

        productsGrid.appendChild(productCard);

        // hover preview: play 15s while mouse over
        productCard.addEventListener('mouseenter', () => startHoverPreview(product.id));
        productCard.addEventListener('mouseleave', () => stopHoverPreview(product.id));

        // if product has audio (path), verify existence (only for non-blob URLs)
        if (product.audio && !product.audio.startsWith('blob:') && !product.audio.startsWith('data:')) {
            const btn = productCard.querySelector(`button[data-preview-id="${product.id}"]`);
            if (btn) {
                fetch(product.audio, { method: 'HEAD' }).then(res => {
                    if (!res.ok) {
                        btn.disabled = true;
                        btn.textContent = 'Arquivo ausente';
                        btn.style.opacity = '0.6';
                    }
                }).catch(() => {
                    btn.disabled = true;
                    btn.textContent = 'Arquivo ausente';
                    btn.style.opacity = '0.6';
                });
            }
        }
    });
}

function setupShopEventListeners() {
    // Busca
    const searchInput = document.querySelector('.pixel-input');
    const searchBtn = document.querySelector('.search-box .pixel-btn');

    if (searchInput && searchBtn) {
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProducts = products.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                product.artist.toLowerCase().includes(searchTerm)
            );
            renderFilteredProducts(filteredProducts);
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function renderFilteredProducts(filteredProducts) {
    const productsGrid = document.querySelector('.shop-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="pixel-text">Nenhum produto encontrado</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card pixel-border';
        productCard.dataset.productId = product.id;

        const audioButtonHtml = product.audio ? `<button class="pixel-btn small" data-preview-id="${product.id}" onclick="togglePreview(${product.id})">▶ Preview</button>`
            : `<button class="pixel-btn small" onclick="promptUpload(${product.id})">⬆️ Upload MP3</button>`;

        productCard.innerHTML = `
            <div class="pixel-vinyl-product">
                <div class="vinyl-label">${product.label}</div>
            </div>
            <h4>${product.title}</h4>
            <p>${product.artist}</p>
            <span class="price">R$ ${product.price.toFixed(2)}</span>
            <div style="margin-top: 15px;">
                ${audioButtonHtml}
                <button class="pixel-btn small" onclick="addToCart(${product.id})">Comprar</button>
            </div>
        `;

        productsGrid.appendChild(productCard);
        productCard.addEventListener('mouseenter', () => startHoverPreview(product.id));
        productCard.addEventListener('mouseleave', () => stopHoverPreview(product.id));

        if (product.audio && !product.audio.startsWith('blob:') && !product.audio.startsWith('data:')) {
            const btn = productCard.querySelector(`button[data-preview-id="${product.id}"]`);
            if (btn) {
                fetch(product.audio, { method: 'HEAD' }).then(res => {
                    if (!res.ok) {
                        btn.disabled = true;
                        btn.textContent = 'Arquivo ausente';
                        btn.style.opacity = '0.6';
                    }
                }).catch(() => {
                    btn.disabled = true;
                    btn.textContent = 'Arquivo ausente';
                    btn.style.opacity = '0.6';
                });
            }
        }
    });
}

// Carrinho (simples)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cartKey = 'site_vinil_cart';
    const existing = JSON.parse(sessionStorage.getItem(cartKey) || '[]');
    existing.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
    sessionStorage.setItem(cartKey, JSON.stringify(existing));
    try {
        alert(`"${product.title}" adicionado ao carrinho.`);
    } catch (e) {
        console.log('Produto adicionado ao carrinho:', product.title);
    }
}

// Player (página player.html)
function initializePlayer() {
    renderPlaylist();
    setupPlayerEventListeners();
    updatePlayerUI();
}

function renderPlaylist() {
    const list = document.querySelector('.playlist');
    if (!list) return;
    list.innerHTML = '';
    playlist.forEach((track, idx) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.innerHTML = `<span class="track-title">${track.title}</span> - <span class="track-artist">${track.artist}</span>`;
        li.addEventListener('click', () => {
            currentTrackIndex = idx;
            playTrack(idx);
        });
        list.appendChild(li);
    });
}

function setupPlayerEventListeners() {
    const playBtn = document.querySelector('.player-play');
    const nextBtn = document.querySelector('.player-next');
    const prevBtn = document.querySelector('.player-prev');

    if (playBtn) playBtn.addEventListener('click', () => playPause());
    if (nextBtn) nextBtn.addEventListener('click', () => nextTrack());
    if (prevBtn) prevBtn.addEventListener('click', () => prevTrack());
}

function playPause() {
    isPlaying = !isPlaying;
    updatePlayerUI();
}

function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentTrackIndex = index;
    isPlaying = true;
    updatePlayerUI();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    isPlaying = true;
    updatePlayerUI();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    isPlaying = true;
    updatePlayerUI();
}

function updatePlayerUI() {
    const titleEl = document.querySelector('.player-title');
    const artistEl = document.querySelector('.player-artist');
    const playBtn = document.querySelector('.player-play');
    const current = playlist[currentTrackIndex] || { title: '', artist: '' };

    if (titleEl) titleEl.textContent = current.title;
    if (artistEl) artistEl.textContent = current.artist;
    if (playBtn) playBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

// Preview controls
function togglePreview(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // cancel hover behavior
    previewByHover = false;
    if (hoverTimeoutId) { clearTimeout(hoverTimeoutId); hoverTimeoutId = null; }

    const currentButton = document.querySelector(`button[data-preview-id="${productId}"]`);
    if (currentPreviewId === productId) {
        if (previewAudio && !previewAudio.paused) {
            previewAudio.pause();
            if (currentButton) currentButton.textContent = '▶ Preview';
        } else if (previewAudio) {
            previewAudio.play();
            if (currentButton) currentButton.textContent = '⏸ Pause';
        }
        return;
    }

    stopPreview();

    // if audio path is a blob (local upload) keep it, otherwise try to load
    if (product.audio) {
        previewAudio = new Audio(product.audio);
    } else {
        alert('Nenhum arquivo de áudio associado a este produto. Faça upload primeiro.');
        return;
    }

    previewAudio.volume = 0.8;
    previewAudio.onplay = () => { if (currentButton) currentButton.textContent = '⏸ Pause'; };
    previewAudio.onpause = () => { if (currentButton) currentButton.textContent = '▶ Preview'; };
    previewAudio.onended = () => { stopPreview(); };
    previewAudio.onerror = (e) => { console.error('Preview audio error', e); stopPreview(); alert('Erro ao reproduzir o preview.'); };

    previewAudio.play().catch(err => { console.error('Preview play error:', err); alert('Não foi possível iniciar o preview. Veja o console para mais detalhes.'); });
    currentPreviewId = productId;
    if (currentButton) currentButton.textContent = '⏸ Pause';
}

function stopPreview() {
    if (previewAudio && !previewAudio.paused) {
        previewAudio.pause();
    }
    currentPreviewId = null;
    document.querySelectorAll('button[data-preview-id]').forEach(btn => btn.textContent = '▶ Preview');
    if (hoverTimeoutId) { clearTimeout(hoverTimeoutId); hoverTimeoutId = null; }
    previewByHover = false;
}

// Hover preview: play for 15 seconds while mouse is over the product
function startHoverPreview(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.audio) return;

    // If there's an active user preview (clicked), don't override
    if (currentPreviewId && previewAudio && !previewAudio.paused && !previewByHover) return;

    if (hoverTimeoutId) { clearTimeout(hoverTimeoutId); hoverTimeoutId = null; }
    previewByHover = true;

    if (currentPreviewId !== productId) {
        stopPreview();
        previewAudio = new Audio(product.audio);
        previewAudio.volume = 0.8;
        previewAudio.onended = () => { stopPreview(); };
        previewAudio.onerror = (e) => { console.error('Hover preview error', e); stopPreview(); };
    }

    try { previewAudio.currentTime = 0; } catch (e) {}
    previewAudio.play().catch(err => console.error('Hover preview play error:', err));
    currentPreviewId = productId;

    const currentButton = document.querySelector(`button[data-preview-id="${productId}"]`);
    if (currentButton) currentButton.textContent = '⏸ Pause';

    hoverTimeoutId = setTimeout(() => { stopHoverPreview(productId); }, 15000);
}

function stopHoverPreview(productId) {
    if (!previewByHover) return;
    if (previewAudio && !previewAudio.paused) previewAudio.pause();
    if (previewAudio) { try { previewAudio.currentTime = 0; } catch (e) {} }
    document.querySelectorAll('button[data-preview-id]').forEach(btn => btn.textContent = '▶ Preview');
    if (hoverTimeoutId) { clearTimeout(hoverTimeoutId); hoverTimeoutId = null; }
    previewByHover = false;
    currentPreviewId = null;
}

// Upload local file and attach to product (uses hidden input in loja.html)
function promptUpload(productId) {
    const input = document.getElementById('audioUploadInput');
    if (!input) {
        alert('Input de upload não encontrado na página.');
        return;
    }
    input.dataset.targetProduct = productId;
    input.click();
}

function handleLocalFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const productId = parseInt(e.target.dataset.targetProduct, 10);
    if (!productId) return;

    // revoke previous blob URL for that product (if any)
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (product._localUrl) {
        try { URL.revokeObjectURL(product._localUrl); } catch (err) {}
    }

    const objectUrl = URL.createObjectURL(file);
    product.audio = objectUrl;
    product._localUrl = objectUrl;

    // re-render products so button changes to Preview
    renderProducts();
}

// Segurança: se o script for carregado em páginas que não existem os elementos, as funções falham silenciosamente.
