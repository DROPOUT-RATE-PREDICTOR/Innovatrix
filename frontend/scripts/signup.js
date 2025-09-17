document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".js-form");

  if (!form) {
    console.error("Signup form not found!");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("date").value.trim();
    const phone_no = document.getElementById("phone").value.trim();

    const user = { name, dob, phone_no };
    console.log("Sending signup data:", user);

    try {
      const response = await fetch("http://localhost:8000/api/v1/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.alreadyExists) {
        alert("User already exists. Please sign in.");
      } else {
        alert("Account created successfully!");
      }

      console.log("Server response:", data);
    } catch (err) {
      console.error("Error sending data:", err);
      alert("Something went wrong. Please try again later.");
    }
  });
});
