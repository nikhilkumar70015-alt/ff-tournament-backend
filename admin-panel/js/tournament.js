// LOAD TOURNAMENTS
async function loadTournaments() {
  try {
    const res = await fetch(`${API_BASE_URL}/tournaments`, {
      headers: authHeaders()
    });

    const data = await res.json();

    let html = "";
    data.forEach(t => {
      html += `
        <p>
          <b>${t.title}</b><br>
          Type: ${t.type}<br>
          Entry Coins: ${t.entryCoins}<br>
          Per Kill: ${t.perKillCoins}<br>
          1st: ${t.prizes.first} |
          2nd: ${t.prizes.second} |
          3rd: ${t.prizes.third}<br>
          Status: ${t.status}
        </p>
        <hr>
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
    entryCoins: Number(document.getElementById("entryCoins").value),
    perKillCoins: Number(document.getElementById("perKillCoins").value),
    prizes: {
      first: Number(document.getElementById("first").value),
      second: Number(document.getElementById("second").value),
      third: Number(document.getElementById("third").value)
    },
    matchTime: document.getElementById("matchTime").value
  };

  if (!payload.title) {
    alert("Title required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/tournaments/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Create failed");
      return;
    }

    alert("✅ Tournament created successfully");

    // clear inputs
    document.querySelectorAll("input").forEach(i => i.value = "");

    loadTournaments();
  } catch (err) {
    console.error(err);
    alert("Error creating tournament");
  }
}
