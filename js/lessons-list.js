document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedUniId = localStorage.getItem('selectedUni');
    const path = urlParams.get('path') || `/${selectedUniId}`;
    const pathSegments = path.split('/').filter(Boolean);

    const pageTitleEl = document.getElementById('page-title');
    const cardContainer = document.getElementById('card-container');
    const siteTitleEl = document.getElementById('site-title');
    const toolbarContainer = document.getElementById('toolbar-container');
    const navContainer = document.getElementById('nav-container');

    // Back button
    navContainer.innerHTML = '<a href="javascript:history.back()" class="back-link">← Back</a>';

    // Breadcrumb creation
    function createLessonNav(universityName, pathSegments) {
        const nav = document.createElement('nav');
        nav.className = 'lesson_nav';
        const list = document.createElement('ul');

        // Root university
        const homeItem = document.createElement('li');
        const homeLink = document.createElement('a');
        homeLink.href = `lessons-list.html?path=/${pathSegments[0]}`;
        homeLink.textContent = universityName;
        homeItem.appendChild(homeLink);
        list.appendChild(homeItem);

        let accumulatedPath = `/${pathSegments[0]}`;
        pathSegments.slice(1).forEach((segment, index) => {
            accumulatedPath += `/${segment}`;
            const li = document.createElement('li');
            const link = document.createElement('a');
            const isLast = index === pathSegments.slice(1).length - 1;
            link.textContent = segment;
            link.href = isLast ? '#' : `lessons-list.html?path=${accumulatedPath}`;
            if (isLast) li.classList.add('active');
            li.appendChild(link);
            list.appendChild(li);
        });

        nav.appendChild(list);
        return nav;
    }

    if (!selectedUniId) {
        if (pageTitleEl) pageTitleEl.textContent = 'No University Selected.';
        return;
    }

    try {
        const response = await fetch('json/second.json'); // JSON database
        if (!response.ok) throw new Error("Database file not found.");
        const data = await response.json();

        // Find selected university
        const university = data.universities_data.find(u => u.university_id === selectedUniId);
        if (!university) throw new Error("University not found.");

        siteTitleEl.textContent = `${university.name || selectedUniId} - Quiz platform`;
        navContainer.appendChild(createLessonNav(selectedUniId, pathSegments));

        // Hierarchical traversal based on pathSegments
        let currentNode = university; // start at university
        const hierarchy = ['faculties', 'years', 'terms', 'subjects']; // levels
        let nodeLabel = university.name || selectedUniId;

        for (let i = 1; i < pathSegments.length; i++) {
            const level = hierarchy[i - 1];
            if (!currentNode[level]) {
                currentNode = null;
                break;
            }
            // Find child by id or numeric value (year/term)
            const found = currentNode[level].find(item =>
                item.id === pathSegments[i] ||
                (item.year && item.year.toString() === pathSegments[i]) ||
                (item.term && item.term.toString() === pathSegments[i])
            );
            if (!found) {
                currentNode = null;
                break;
            }
            currentNode = found;
            nodeLabel = found.name || found.label || `Level ${i}`;
        }

        if (!currentNode) {
            pageTitleEl.textContent = 'Item not found.';
            return;
        }

        // Page title
        if (pageTitleEl) {
            pageTitleEl.style.display = pathSegments.length > 1 ? 'block' : 'none';
            pageTitleEl.textContent = nodeLabel;
        }

        // Clear previous cards and toolbar
        cardContainer.innerHTML = '';
        toolbarContainer.innerHTML = '';

        // Render child nodes
        const childLevels = {
            'universities_data': 'faculties',
            'faculties': 'years',
            'years': 'terms',
            'terms': 'subjects'
        };

        const currentLevelKey = Object.keys(childLevels).find(k => currentNode[k] || currentNode[childLevels[k]]);
        const childrenKey = childLevels[currentLevelKey] || null;
        const children = childrenKey ? currentNode[childrenKey] : null;

        if (children && children.length) {
            children.forEach(child => {
                const newPath = `${path}/${child.id || child.year || child.term || child.code}`.replace(/\/\//g, '/');
                const targetUrl = childrenKey === 'subjects'
                    ? `lesson.html?path=${newPath}`
                    : `lessons-list.html?path=${newPath}`;
                const cardTitle = child.name || `Year ${child.year || child.term || child.code}`;
                cardContainer.appendChild(createCard(cardTitle, targetUrl, ''));
            });
        }

    } catch (error) {
        console.error('Error:', error);
        if (pageTitleEl) pageTitleEl.textContent = `Error: ${error.message}`;
    }
});

// Card creation
function createCard(title, url, description) {
    const cardLink = document.createElement('a');
    cardLink.href = url;
    cardLink.className = 'card card--lesson';
    cardLink.innerHTML = `<div class="card-content"><h2>${title}</h2></div>`;
    return cardLink;
}
