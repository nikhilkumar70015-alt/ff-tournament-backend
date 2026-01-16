const API_BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("adminToken");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": getToken()
  };
}
