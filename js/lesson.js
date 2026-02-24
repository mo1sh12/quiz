document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const pathSegments = path.split('/').filter(Boolean);

    const pageTitleEl = document.getElementById('page-title');
    const contentContainer = document.getElementById('content-container');
    const siteTitleEl = document.getElementById('site-title');
    const toolbarContainer = document.getElementById('toolbar-container');

    if (!pathSegments.length) {
        pageTitleEl.textContent = 'Invalid path parameter.';
        return;
    }

    const materialName = pathSegments[pathSegments.length - 1];
    const localJsonPath = `./json/${pathSegments.join('/')}/${materialName}.json`;

    try {
        const response = await fetch(localJsonPath);
        if (!response.ok) throw new Error("Database JSON not found at: " + localJsonPath);

        const data = await response.json();
        const topicNode = data[materialName.toLowerCase()];
        siteTitleEl.textContent = `${materialName} quiz platform`;
        pageTitleEl.textContent = `Resources Overview`;
        toolbarContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        function createResourceButton(resource, type) {

    if (resource.isEnabled === undefined) resource.isEnabled = true;
    if (resource.isPremium === undefined) resource.isPremium = false;

    // ✅ استخدام object واحد فقط من localStorage
    const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!sessionUser.isLoggedIn;
    const isActive = !!sessionUser.isActive;


    const hasFullAccess = resource.isPremium && isLoggedIn && isActive;

    // 🔴 مغلق من الادمن
    if (resource.isEnabled === false) {
        const lockedCard = document.createElement('div');
        lockedCard.className = `card card--locked`;
        lockedCard.innerHTML = `<h2>🔒 ${resource.title}</h2><p>Resource disabled by admin</p>`;
        return lockedCard;
    }

    // 🔴 Premium بدون صلاحيات
    if (resource.isPremium && !hasFullAccess) {
        const lockedCard = document.createElement('div');
        lockedCard.className = `card card--locked`;

        let message = '';
        if (!isLoggedIn) message = 'Login required to access this resource';
        else if (!isActive) message = 'Account must be activated to access';

        lockedCard.innerHTML = `<h2>🔒 ${resource.title}</h2><p>${message}</p>`;
        return lockedCard;
    }

    // 🟢 المورد متاح بالكامل
    const button = document.createElement('a');
    switch(type) {




        case 'quiz': case 'exam':
            button.href = `quiz.html?collection=${resource.id}&path=${path}`;
            break;




            
        case 'flashcards':
            button.href = `flashcard.html?collection=${resource.id}&path=${path}`;
            break;
        case 'video': case 'lecture': case 'image': case 'dissection': case '3dmodel':
            button.href = resource.url;
            break;
        case 'case': case 'mnemonic':
            button.href = '#';
            button.addEventListener('click', () => {
                alert('🔹 This resource is interactive content.');
            });
            break;
        default:
            button.href = resource.url || '#';
    }
    button.target = "_blank";

    if (resource.isPremium && hasFullAccess) {
        button.className = `card card--premium-active`;
        button.innerHTML = `<h2>⭐ ${resource.title}</h2>`;
    } else {
        button.className = `card card--${type}`;
        button.innerHTML = `<h2>${resource.title}</h2>`;
    }

    return button;
}
        // -------------------- إضافة الموارد --------------------

        if (topicNode.review_options) {
            const ro = topicNode.review_options;

            if (Array.isArray(ro.videos) && ro.videos.length > 0) {
                ro.videos.forEach(v => toolbarContainer.appendChild(createResourceButton(v, 'video')));
            }
            if (Array.isArray(ro.exams) && ro.exams.length > 0) {
                ro.exams.forEach(e => toolbarContainer.appendChild(createResourceButton(e, 'quiz')));
            }
            if (Array.isArray(ro.practice_questions) && ro.practice_questions.length > 0) {
                ro.practice_questions.forEach(pq => toolbarContainer.appendChild(createResourceButton(pq, 'practice')));
            }
            if (Array.isArray(ro.flashcards) && ro.flashcards.length > 0) {
                ro.flashcards.forEach(fc => toolbarContainer.appendChild(createResourceButton(fc, 'flashcards')));
            }
        }

        if (Array.isArray(topicNode.lectures) && topicNode.lectures.length > 0) {
            topicNode.lectures.forEach(lec => toolbarContainer.appendChild(createResourceButton(lec, 'lecture')));
        }

        if (Array.isArray(topicNode.images) && topicNode.images.length > 0) {
            topicNode.images.forEach(img => toolbarContainer.appendChild(createResourceButton(img, 'image')));
        }

        if (Array.isArray(topicNode.dissection_videos) && topicNode.dissection_videos.length > 0) {
            topicNode.dissection_videos.forEach(dv => toolbarContainer.appendChild(createResourceButton(dv, 'dissection')));
        }

        if (Array.isArray(topicNode.clinical_cases) && topicNode.clinical_cases.length > 0) {
            topicNode.clinical_cases.forEach(cc => toolbarContainer.appendChild(createResourceButton(cc, 'case')));
        }

        if (Array.isArray(topicNode.mnemonics) && topicNode.mnemonics.length > 0) {
            topicNode.mnemonics.forEach(mn => toolbarContainer.appendChild(createResourceButton(mn, 'mnemonic')));
        }

        if (Array.isArray(topicNode.interactive_models) && topicNode.interactive_models.length > 0) {
            topicNode.interactive_models.forEach(m => toolbarContainer.appendChild(createResourceButton(m, '3dmodel')));
        }

        contentContainer.innerHTML = "<p>Select a resource above to start reviewing.</p>";

    } catch (error) {
        console.error('Error:', error);
        pageTitleEl.textContent = `Error: ${error.message}`;
        contentContainer.innerHTML = `<p>Unable to load resources. Check your JSON path.</p>`;
    }
});