async function loadTournaments() {
  const res = await fetch(`${API_BASE_URL}/tournaments`, {
    headers: authHeaders()
  });
  const data = await res.json();

  let html = "";
  data.forEach(t => {
    html += `<p>${t.title} | ${t.type} | Prize: ${t.prizeCoins}</p>`;
  });

  document.getElementById("list").innerHTML = html;
}
