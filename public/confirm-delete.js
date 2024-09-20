document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("confirm-delete-form");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearErrors(); // Clear previous errors

    const password = document.getElementById("password").value;
    const token = localStorage.getItem("token");

    if (confirm("هل أنت متأكد أنك تريد حذف حسابك؟")) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/current",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          }
        );
        const result = await response.json();
        if (response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          alert("تم حذف الحساب بنجاح");
          window.location.href = "login";
        } else if (response.status === 400) {
          displayErrors(result.errors);
        } else {
          alert(`حدث خطأ: ${JSON.stringify(result)}`);
        }
      } catch (error) {
        console.error("Error deleting user account:", error);
        alert("تعذر الاتصال بالخادم");
      }
    }
  });
});

function displayErrors(errors) {
  errors.forEach((error) => {
    const errorMessage = `${error.msg}`;
    const errorElement = document.getElementById(`${error.path}-error`);
    const inputElement = document.getElementById(error.path);

    if (errorElement) {
      errorElement.textContent = errorMessage;
    }

    if (inputElement) {
      inputElement.classList.add("error");
    }
  });
}

function clearErrors() {
  const errorFields = document.querySelectorAll(".error");
  errorFields.forEach((field) => {
    field.classList.remove("error");
  });

  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((message) => {
    message.textContent = "";
  });
}
