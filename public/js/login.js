const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await axios.post("http://localhost:3000/user/login", {
      identifier,
      password,
    });

    alert("Login successful!");

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    window.location.href = "/html/chat.html";
  } catch (err) {
    console.error(err);

    if (err.response) {
      alert(err.response.data.message || "Login failed");
    } else {
      alert("Server error");
    }
  }
});
