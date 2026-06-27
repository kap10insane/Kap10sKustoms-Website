document.addEventListener("DOMContentLoaded", async () => {
  const account = await getCurrentAccount();

  // Not logged in
  if (!account) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("accountWelcome").textContent =
    `Welcome back, ${account.display_name}`;

  document.getElementById("accountEmail").textContent =
    account.email;

  const roleNames = {
  owner: "Owner",
  manager: "Manager",
  customer: "Customer"
};

document.getElementById("accountRole").textContent =
  roleNames[account.role] || account.role;

  document
    .getElementById("accountLogoutBtn")
    .addEventListener("click", async () => {
      try {
        await fetch(
          "https://kap10skustoms-api.kap10skustoms.workers.dev/auth/logout",
          {
            method: "POST",
            credentials: "include"
          }
        );
      } catch (err) {
        console.error(err);
      }

      window.location.href = "index.html";
    });
});