document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login";
    return;
  }
  const deleteAccountButton = document.getElementById("delete-account-button");

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", function () {
      if (confirm("هل أنت متأكد أنك تريد حذف حسابك؟")) {
        window.location.href = "confirm-delete";
      }
    });
  }
  try {
    // إرسال طلب GET إلى API
    const response = await fetch("http://localhost:3000/api/users/current/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // عرض بيانات المستخدم في الصفحة
      document.getElementById("first-name").textContent =
        data.user.firstName || "غير متوفر";
      document.getElementById("last-name").textContent =
        data.user.lastName || "غير متوفر";
      document.getElementById("username").textContent =
        data.user.username || "غير متوفر";
      document.getElementById("email").textContent =
        data.user.email || "غير متوفر";
    } else {
      const errorData = await response.json();
      alert(`حدث خطأ: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("تعذر الاتصال بالخادم");
  }
});
