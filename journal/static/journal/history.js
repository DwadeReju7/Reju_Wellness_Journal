console.log("history.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready - fetching entries");
    
    const container = document.getElementById("entries-container");

    fetch("/journal/", { credentials: "same-origin" })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
        })
        .then(entries => {
            console.log("Entries received:", entries);

            // Clear loading state
            container.innerHTML = '';

            // Check if empty
            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>You haven't written any journal entries yet.</p>
                        <a href="/today/">Write Your First Entry</a>
                    </div>
                `;
                return;
            }

            // Create entries list
            const list = document.createElement('div');
            list.className = 'entries-list';

            entries.forEach(entry => {
                const card = createEntryCard(entry);
                list.appendChild(card);
            });

            container.appendChild(list);
        })
        .catch(err => {
            console.error("Failed to load entries:", err);
            container.innerHTML = `
                <div class="empty-state">
                    <p>⚠️ Could not load your entries. Please try refreshing the page.</p>
                </div>
            `;
        });
});

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';

    // Format date
    const date = new Date(entry.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="entry-header">
            <div class="entry-date">${formattedDate}</div>
            <div class="entry-mood">Mood: ${entry.mood || 'Not recorded'}</div>
        </div>
        <div class="entry-prompt">${entry.prompt || 'No prompt'}</div>
        <div class="entry-reflection">${entry.reflection}</div>
    `;

    return card;
}