async function loadUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: authHeaders()
  });

  const data = await res.json();

  let html = "";
  data.forEach(u => {
    html += `
      <tr>
        <td>${u.email}</td>
        <td>${u.username}</td>
        <td>${u.inGameName}</td>
        <td>${u.coins}</td>
        <td>${u.isAdmin ? "Admin" : "User"}</td>
      </tr>
    `;
  });

  document.getElementById("users").innerHTML = html;
}
