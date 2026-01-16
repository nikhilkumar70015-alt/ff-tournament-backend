const API_BASE_URL = "";

function getToken() {
  return localStorage.getItem("adminToken");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": getToken()
  };
}
