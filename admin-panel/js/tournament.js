// LOAD ALL TOURNAMENTS
async function loadTournaments() {
  try {
    const res = await fetch(`${API_BASE_URL}/tournaments`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      alert("Failed to load tournaments");
      return;
    }

    const data = await res.json();

    let html = "";
    data.forEach(t => {
      html += `
        <p>
          <b>${t.title}</b> |
          Type: ${t.type} |
          Entry: ${t.entryFee} |
          Prize: ${t.prizeCoins} |
          Players: ${t.maxPlayers}
        </p>
      `;
    });

    document.getElementById("list").innerHTML = html;

  } catch (err) {
    console.error(err);
    alert("Error loading tournaments");
  }
}

// CREATE TOURNAMENT
async function createTournament() {
  const payload = {
    title: document.getElementById("title").value,
    type: document.getElementById("type").value,
    entryFee: Number(document.getElementById("entryFee").value),
    prizeCoins: Number(document.getElementById("prizeCoins").value),
    maxPlayers: Number(document.getElementById("maxPlayers").value),
  };

  if (!payload.title) {
    alert("Title required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/tournaments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Create failed");
      return;
    }

    alert("✅ Tournament created successfully");

    // clear inputs
    document.getElementById("title").value = "";
    document.getElementById("entryFee").value = "";
    document.getElementById("prizeCoins").value = "";
    document.getElementById("maxPlayers").value = "";

    loadTournaments();

  } catch (err) {
    console.error(err);
    alert("Error creating tournament");
  }
}
