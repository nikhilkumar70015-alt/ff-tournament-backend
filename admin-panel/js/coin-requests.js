async function loadCoins() {
  const res = await fetch(`${API_BASE_URL}/coins/pending`, {
    headers: authHeaders()
  });
  const data = await res.json();

  let html = "";
  data.forEach(r => {
    html += `
      <p>
        ${r.user.email} | ₹${r.amountINR} | Coins: ${r.coins}
        <button onclick="approve('${r._id}')">Approve</button>
        <button onclick="reject('${r._id}')">Reject</button>
      </p>
    `;
  });

  document.getElementById("list").innerHTML = html;
}

async function approve(id) {
  await fetch(`${API_BASE_URL}/coins/approve/${id}`, {
    method: "POST",
    headers: authHeaders()
  });
  loadCoins();
}

async function reject(id) {
  await fetch(`${API_BASE_URL}/coins/reject/${id}`, {
    method: "POST",
    headers: authHeaders()
  });
  loadCoins();
}
