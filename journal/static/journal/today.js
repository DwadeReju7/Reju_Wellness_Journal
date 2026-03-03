console.log("today.js loaded");

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready");
    fetch("/journal/today/", { credentials: "same-origin" })
        .then(res => res.json())
        .then(data => {
            console.log("TODAY RESPONSE:", data);
            const statusDiv = document.getElementById("status");

            // ✅ ENTRY ALREADY EXISTS
            if (data.has_entry) {
                statusDiv.innerHTML = `
                    <p>✅ Journal submitted today</p>
                    <p><strong>Prompt:</strong> ${data.entry.prompt}</p>
                    <p><strong>Mood:</strong> ${data.entry.mood}</p>
                    <p><strong>Reflection:</strong> ${data.entry.reflection}</p>
                `;
                return;
            }
            // ✅ NO ENTRY — SHOW FORM
            statusDiv.innerHTML = `
                <p><strong>Today's Prompt</strong></p>
                <p id="prompt-text">Loading prompt...</p>

                <form id="journal-form">
                    <textarea id="reflection" required></textarea>

                    <label>Mood:
                        <select id="mood" required>
                            <option value="">Select mood</option>
                            <option value="great">Great</option>
                            <option value="good">Good</option>
                            <option value="okay">Okay</option>
                            <option value="low">Low</option>
                        </select>
                    </label>

                    <button type="submit">Submit Journal</button>
                </form>
            `;

            // ✅ NOW fetch the prompt (element exists)
            fetch("/journal/prompt/", { credentials: "same-origin" })
                .then(res => res.json())
                .then(data => {
                    const promptEl = document.getElementById("prompt-text");
                    if (promptEl) {
                        promptEl.innerText = data.prompt;
                    }
                })
                .catch(() => {
                    const promptEl = document.getElementById("prompt-text");
                    if (promptEl){
                        promptEl.innerText =
                            "⚠️ Could not load today's prompt.";
                    }       
                });
        })
        .catch(() => {
            document.getElementById("status").innerText =
                "⚠️ Could not connect to backend";
        });

    // ✅ Event delegation for dynamically created form
document.addEventListener("submit", e => {
    if (e.target.id !== "journal-form") return;

    e.preventDefault();

    fetch("/journal/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            reflection: document.getElementById("reflection").value,
            mood: document.getElementById("mood").value
        })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                console.error("SERVER ERROR:", err);
                throw err;
            });
        }
        return res.json();
    })
    .then(() => {
        console.log("Entry submitted!");
        location.reload();
    })
    .catch(err => {
        console.error("SUBMISSION FAILED:", err);
        alert("⚠️ Failed to submit journal entry.");
    });
});

});
