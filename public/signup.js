document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // جمع البيانات من النموذج
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userData = {
      firstName,
      lastName,
      username,
      email,
      password,
    };
    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const resuslt = await response.json();
      if (response.status === 201) {
        localStorage.setItem("userId", resuslt.user.id);
        localStorage.setItem("token", resuslt.user.token);
        localStorage.setItem("email", resuslt.user.email);
        localStorage.setItem("username", resuslt.user.username);
        window.location.href = "home";
      } else if (response.status === 400) {
        alert(`حدث خطأ: ${JSON.stringify(resuslt.errors)}`);
      } else {
        alert(`حدث خطأ: ${JSON.stringify(resuslt)}`);
      }
    } catch (error) {
      alert("تعذر الاتصال بالخادم. حاول مرة أخرى لاحقًا.");
      console.error("Error:", error);
    }
  });
