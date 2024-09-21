document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
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
      const response = await fetch("/api/users/register", {
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
        console.error(`حدث خطأ: ${JSON.stringify(resuslt.errors)}`);
      } else {
        console.error(`حدث خطأ: ${JSON.stringify(resuslt)}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
