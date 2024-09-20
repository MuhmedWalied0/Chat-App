document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("change-password-form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const oldPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      alert("كلمة المرور الجديدة وتأكيد كلمة المرور لا يتطابقان");
      return;
    }

    try {
      const response = await fetch(
        "/api/users/current/password/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );
      const resuslt = await response.json();

      if (response.ok) {
        alert("تم تغيير كلمة المرور بنجاح");
        window.location.href = "user-profile";
      } else if (response.status === 400) {
        resuslt.errors.forEach((error) => alert(error.msg))
      } else {
        alert(`حدث خطأ: ${JSON.stringify(resuslt)}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("تعذر الاتصال بالخادم");
    }
  });
});
