const form = document.querySelector('.js-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const dob = document.getElementById('date').value.trim();
  const phone_no = document.getElementById('phone').value.trim();

  try {
    const response = await fetch("http://localhost:8000/api/users/find", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dob, phone_no })
});


    const data = await response.json();

    if (data.success) {
      console.log("User found:", data.user);
      alert(`Welcome ${data.user.name}!`);
      window.location.href = "index.html";
    } else {
      console.log("Not found:", data.message);
      alert("User not found!");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
});
