async function loadProfile() {
  try {
    const response = await fetch("/api/profile");

    if (!response.ok) {
      throw new Error("無法讀取個人資料");
    }

    const profile = await response.json();

    document.getElementById("name").textContent =
      profile.name || "尚未設定姓名";

    document.getElementById("department").textContent =
      profile.department || "尚未設定科系";

    document.getElementById("studentId").textContent =
      profile.studentId || "尚未設定";

    document.getElementById("email").textContent =
      profile.email || "尚未設定";

    document.getElementById("bio").textContent =
      profile.bio || "尚未設定自我介紹";

    const firstCharacter = (profile.name || "Z").trim().charAt(0);
    document.querySelector(".avatar").textContent = firstCharacter || "Z";
  } catch (error) {
    document.getElementById("name").textContent = "資料載入失敗";
    document.getElementById("bio").textContent =
      "目前無法連接伺服器，請稍後再試。";
  }
}

loadProfile();
