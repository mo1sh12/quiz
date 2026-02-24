document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    try {
        const response = await fetch('header.html');
        if (!response.ok) throw new Error('Failed to load header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
    } catch (error) {
        console.error(error);
        headerContainer.innerHTML = '<p>Header failed to load</p>';
    }
});