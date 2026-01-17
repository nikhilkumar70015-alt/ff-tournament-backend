const API_BASE_URL = "https://ff-tournament-backend.onrender.com/api";

function getToken() {
  return localStorage.getItem("adminToken");
}

function authHeaders() {
  const token = getToken();
  console.log("ADMIN TOKEN =>", token);
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}
