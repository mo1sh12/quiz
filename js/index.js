// ==============================
// Fetch universities data
// ==============================
async function fetchUniversities() {
    const response = await fetch('json/first.json');
    if (!response.ok) throw new Error('Failed to load database.');
    return await response.json();
}

// ==============================
// Prepare data: array, active only, sorted
// ==============================
function prepareUniversities(tree) {
    return Object.values(tree)
        .filter(uni => uni.isActive)
        .sort((a, b) => a.order - b.order);
}

// ==============================
// Render universities
// ==============================
function renderUniversities(container, universitiesArray) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    universitiesArray.forEach(university => {
        const card = document.createElement('a');
        card.href = `lessons-list.html?path=/${university.id}`;
        card.className = 'card';

        // Data attributes for later targeting or filtering
        card.dataset.id = university.id;
        card.dataset.slug = university.slug;
        card.dataset.tags = university.tags.join(',');

        // Apply theme dynamically (CSS variables)
        card.style.setProperty('--primary', university.theme.primaryColor);
        card.style.setProperty('--secondary', university.theme.secondaryColor);

        card.innerHTML = `
            <div class="card-image">
                <img src="images/first/${university.image}" alt="${university.name}" loading="lazy">
            </div>
            <div class="card-body">
                <h3>${university.name}</h3>
                <small>${university.shortName}</small>
                <p>${university.description}</p>
                <div class="stats">
                    <span>Colleges: ${university.stats.collegesCount}</span>
                </div>
                <div class="tags">
                    ${university.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('selectedUni', university.id);
            window.location.href = card.href;
        });

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// ==============================
// Filter universities by search box
// ==============================
function filterUniversities(universitiesArray) {
    const searchBox = document.getElementById('searchBox');
    if (!searchBox) return;

    searchBox.addEventListener('input', () => {
        const query = searchBox.value.toLowerCase();

        const filtered = universitiesArray.filter(uni =>
            uni.name.toLowerCase().includes(query) ||
            uni.shortName.toLowerCase().includes(query) ||
            uni.tags.some(tag => tag.toLowerCase().includes(query))
        );

        renderUniversities(
            document.getElementById('universities-container'),
            filtered
        );
    });
}


document.querySelector('.search-btn')?.addEventListener('click', () => {
    const event = new Event('input');
    document.getElementById('searchBox').dispatchEvent(event);
});
// ==============================
// Main logic
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('universities-container');
    if (!container) return;

    container.textContent = 'Loading universities...';

    try {
        const data = await fetchUniversities();

        if (!data.tree || Object.keys(data.tree).length === 0) {
            container.textContent = 'No universities found.';
            return;
        }

        const prepared = prepareUniversities(data.tree);

        renderUniversities(container, prepared);

        if (document.getElementById('searchBox')) {
            filterUniversities(prepared);
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div>Error loading universities. 
            <button id="retryBtn">Retry</button>
        </div>`;
        document.getElementById('retryBtn')?.addEventListener('click', () => location.reload());
    }
});