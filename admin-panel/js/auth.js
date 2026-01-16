function checkAdminAuth() {
  if (!localStorage.getItem("adminToken")) {
    window.location.href = "login.html";
  }
}
