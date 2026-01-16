const API_BASE_URL = "https://ff-tournament-backend.onrender.com";

function getToken() {
  return localStorage.getItem("adminToken");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": getToken()
  };
}
