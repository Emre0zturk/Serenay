(function() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const panels = document.querySelectorAll('.tab-panel');

    function activateTabById(id) {
        const targetBtn = Array.from(tabLinks).find(b => b.getAttribute('data-target') === id);
        const panel = document.getElementById(id);
        if (!targetBtn || !panel) return;
        tabLinks.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
        // close advanced filters if open when switching tabs
        const filtersPanelLocal = document.querySelector('.advanced-filters');
        if (filtersPanelLocal) filtersPanelLocal.classList.remove('open');
    }

    // Click: set hash and activate
    tabLinks.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (location.hash !== '#' + target) {
                history.pushState(null, '', '#' + target);
            }
            activateTabById(target);
        });
    });

    // On load: use hash if present
    const initial = (location.hash || '#all-brands').replace('#', '');
    activateTabById(initial);

    // Back/forward: respond to hash changes
    window.addEventListener('hashchange', () => {
        const id = (location.hash || '#all-brands').replace('#', '');
        activateTabById(id);
    });

    // Advanced filters toggle
    const filtersPanel = document.querySelector('.advanced-filters');
    const toggleBtn = document.querySelector('.filters-toggle');
    if (filtersPanel && toggleBtn) {
        filtersPanel.classList.remove('open');
        toggleBtn.addEventListener('click', () => {
            filtersPanel.classList.toggle('open');
        });
        const applyBtn = filtersPanel.querySelector('.apply-btn');
        if (applyBtn) applyBtn.addEventListener('click', () => filtersPanel.classList.remove('open'));
    }

    // A-Z Sorting Logic
    const azButton = document.querySelector('.az-link');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const originalOrders = {};
    const sortStates = {};

    // Store the original order of cards for each tab panel
    tabPanels.forEach(panel => {
        const panelId = panel.id;
        const productCards = panel.querySelectorAll('.product-card');
        originalOrders[panelId] = Array.from(productCards);
        sortStates[panelId] = 0; // 0: default, 1: A-Z, 2: Z-A
    });

    azButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent link from navigating

        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;

        const panelId = activePanel.id;
        const productsContainer = activePanel.querySelector('.products');
        let cards = Array.from(productsContainer.querySelectorAll('.product-card'));

        // Cycle through sort states: 0 -> 1 -> 2 -> 0
        sortStates[panelId] = (sortStates[panelId] + 1) % 3;
        const currentSortState = sortStates[panelId];

        // Önce ok sınıflarını temizle
        azButton.classList.remove('sort-asc', 'sort-desc');

        if (currentSortState === 1) { // State 1: Sort A-Z
            azButton.classList.add('sort-asc'); // Yukarı oku göster
            cards.sort((a, b) => {
                const brandA = a.querySelector('.brand').textContent.trim();
                const brandB = b.querySelector('.brand').textContent.trim();
                return brandA.localeCompare(brandB);
            });
        } else if (currentSortState === 2) { // State 2: Sort Z-A
            azButton.classList.add('sort-desc'); // Aşağı oku göster
            cards.sort((a, b) => {
                const brandA = a.querySelector('.brand').textContent.trim();
                const brandB = b.querySelector('.brand').textContent.trim();
                return brandB.localeCompare(brandA);
            });
        } else { // State 0: Revert to default
            // Ok sınıfları zaten temizlendiği için ek bir şey yapmaya gerek yok
            cards = originalOrders[panelId];
        }

        // Re-append cards in the new order
        productsContainer.innerHTML = '';
        cards.forEach(card => productsContainer.appendChild(card));
    });

    // Favorite Button Logic (using event delegation)
    document.addEventListener('click', (e) => {
        // Check if a favorite button was clicked
        if (e.target.classList.contains('favorite-btn')) {
            e.preventDefault();
            const favBtn = e.target;
            const productCard = favBtn.closest('.product-card');

            if (!productCard || !productCard.dataset.id) return;

            const productId = productCard.dataset.id;
            const isNowFavorite = !productCard.classList.contains('is-favorite');

            // Find all cards with the same data-id and update them
            const allMatchingCards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
            
            allMatchingCards.forEach(card => {
                card.classList.toggle('is-favorite', isNowFavorite);
                const button = card.querySelector('.favorite-btn');
                if (button) {
                    button.classList.toggle('favorited', isNowFavorite);
                    button.textContent = isNowFavorite ? '♥' : '♡';
                }
            });
        }
    });

    // Main Favorites Filter Button Logic
    const mainFavBtn = document.querySelector('.search-sort .fav-btn');
    mainFavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;

        // Toggle the active state on the button itself
        mainFavBtn.classList.toggle('active');

        // Toggle the view mode on the active panel
        activePanel.classList.toggle('favorites-view');
    });

    // Search Input Logic
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;

        const allCards = activePanel.querySelectorAll('.product-card');

        allCards.forEach(card => {
            const brandName = card.querySelector('.brand').textContent.toLowerCase();
            const isMatch = brandName.includes(searchTerm);

            // Hide or show card based on search match
            // We use a class to avoid conflicts with other display logic (like favorites)
            card.classList.toggle('search-hidden', !isMatch);
        });
    });

})();