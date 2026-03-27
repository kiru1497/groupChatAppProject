const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await axios.post("http://localhost:3000/user/signup", {
      name,
      email,
      phone,
      password,
    });

    alert("Signup successful!");
    window.location.href = "./login.html";
  } catch (err) {
    console.error(err);

    if (err.response) {
      alert(err.response.data.message || "Signup failed");
    } else {
      alert("Server error");
    }
  }
});
