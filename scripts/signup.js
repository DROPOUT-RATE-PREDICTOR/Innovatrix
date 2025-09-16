const form = document.querySelector('.js-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault(); 

  const name = document.getElementById('name').value.trim();
  const dob = document.getElementById('date').value.trim();
  const phone_no = document.getElementById('phone').value.trim();

  const user = { name, dob, phone_no };
  console.log("Sending user:", user);

  try {
    const response = await fetch("http://localhost:8000/api/v1/Users/new", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    console.log('Data sent successfully', response.status, data);
  } catch (err) {
    console.error('Error sending data:', err);
  }
});