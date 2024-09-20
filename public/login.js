document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    const userData = {
      identifier,
      password,
    };
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const resuslt = await response.json();
      if (response.status === 200) {
        const data = resuslt.user;
        localStorage.setItem("userId", data.id);
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        window.location.href = "home";
      } else if (response.status === 400) {
        displayErrors(resuslt.errors);
      } else {
        alert(`حدث خطأ: ${JSON.stringify(resuslt)}`);
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم. حاول مرة أخرى لاحقًا.");
      console.error("Error:", error);
    }
  });
function displayErrors(errors) {
  
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));
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
  // إزالة جميع حواف الخطأ
  const errorFields = document.querySelectorAll(".error");
  errorFields.forEach(field => {
      field.classList.remove("error");
  });

  // مسح رسائل الأخطاء
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(message => {
      message.textContent = '';
  });
}