const buttonElement = document.querySelector(".js-predict-button");
buttonElement.addEventListener("click", async () => {
  const academicsFile = document.getElementById("academics").files[0];
  const academicsUrl = "";
  const attendanceFile = document.getElementById("attendance").files[0];
  const attendanceUrl = "";
  const monetaryFile = document.getElementById("monetary").files[0];
  const monetaryUrl = "";
  uploadFile(academicsFile, academicsUrl);
  uploadFile(attendanceFile, attendanceUrl);
  uploadFile(monetaryFile, monetaryUrl);
});

const uploadFile = async (formData, url) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("File uploaded successfully:", result);
    } else {
      console.error("File upload failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error during file upload:", error);
  }
};
