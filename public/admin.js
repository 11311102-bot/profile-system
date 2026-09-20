const loginSection = document.getElementById("loginSection");
const editSection = document.getElementById("editSection");
const loginForm = document.getElementById("loginForm");
const profileForm = document.getElementById("profileForm");
const loginMessage = document.getElementById("loginMessage");
const saveMessage = document.getElementById("saveMessage");
const logoutButton = document.getElementById("logoutButton");

function showLogin() {
  loginSection.classList.remove("hidden");
  editSection.classList.add("hidden");
}

function showEditor() {
  loginSection.classList.add("hidden");
  editSection.classList.remove("hidden");
  loadProfile();
}

async function loadProfile() {
  const response = await fetch("/api/profile");
  const profile = await response.json();

  document.getElementById("name").value = profile.name || "";
  document.getElementById("studentId").value = profile.studentId || "";
  document.getElementById("department").value = profile.department || "";
  document.getElementById("email").value = profile.email || "";
  document.getElementById("bio").value = profile.bio || "";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "登入中……";

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  });

  const result = await response.json();

  if (!response.ok) {
    loginMessage.textContent = result.message || "登入失敗。";
    return;
  }

  loginForm.reset();
  loginMessage.textContent = "";
  showEditor();
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveMessage.textContent = "儲存中……";

  const profile = {
    name: document.getElementById("name").value,
    studentId: document.getElementById("studentId").value,
    department: document.getElementById("department").value,
    email: document.getElementById("email").value,
    bio: document.getElementById("bio").value
  };

  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  const result = await response.json();

  if (!response.ok) {
    saveMessage.textContent = result.message || "儲存失敗。";
    if (response.status === 401) {
      showLogin();
    }
    return;
  }

  saveMessage.textContent = "資料已成功儲存。";
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  saveMessage.textContent = "";
  showLogin();
});

async function checkSession() {
  try {
    const response = await fetch("/api/session");
    const session = await response.json();

    if (session.loggedIn) {
      showEditor();
    } else {
      showLogin();
    }
  } catch (error) {
    loginMessage.textContent = "目前無法連接伺服器。";
    showLogin();
  }
}

checkSession();
