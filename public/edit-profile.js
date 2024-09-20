document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("edit-form");
  const button = document.getElementById("update-btn");
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login";
    return;
  }

  const fristName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const username = document.getElementById("username");
  const email = document.getElementById("email");

  let fristNameValue, lastNameValue, usernameValue, emailValue;

  try {
    const response = await fetch("http://localhost:3000/api/users/current/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      fristName.value = data.user.firstName;
      lastName.value = data.user.lastName;
      username.value = data.user.username;
      email.value = data.user.email;

      // حفظ القيم الأولية بعد تحميل البيانات
      fristNameValue = fristName.value;
      lastNameValue = lastName.value;
      usernameValue = username.value;
      emailValue = email.value;
    } else {
      alert("فشل في تحميل بيانات المستخدم");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("تعذر الاتصال بالخادم");
  }

  function check() {
    if (
      fristName.value === fristNameValue &&
      lastName.value === lastNameValue &&
      username.value === usernameValue &&
      email.value === emailValue
    ) {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  }

  fristName.addEventListener("input", function () {
    check();
  });
  lastName.addEventListener("input", function () {
    check();
  });
  username.addEventListener("input", function () {
    check();
  });
  email.addEventListener("input", function () {
    check();
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
      firstName: fristName.value,
      lastName: lastName.value,
      username: username.value,
      email: email.value,
    };

    try {
      const response = await fetch("http://localhost:3000/api/users/current/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resuslt = await response.json();
      if (response.ok) {
        localStorage.setItem("email", resuslt.user.email);
        localStorage.setItem("username", resuslt.user.username);
        window.location.href = "user-profile";
      } else {
        const errorData = await response.json();
        alert(`حدث خطأ: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("تعذر الاتصال بالخادم");
    }
  });
});
