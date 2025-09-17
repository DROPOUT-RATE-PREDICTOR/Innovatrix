document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".js-form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("date").value.trim();
    const phone_no = document.getElementById("phone").value.trim();

    if (!name || !dob || !phone_no) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, phone_no })
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok && data.status === "ok") {
        alert(`Welcome back, ${data.user.name}!`);
        window.location.href = "http://127.0.0.1:5000/";
      } else if (data.status === "not-found") {
        alert("User not found! Please sign up first.");
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Unable to login. Please try again later.");
    }
  });
});
