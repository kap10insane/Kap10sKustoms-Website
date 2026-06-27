const KAP10_API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

async function getCurrentAccount() {
  try {
    const response = await fetch(`${KAP10_API_BASE}/auth/me`, {
      credentials: "include"
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.ok || !data.account) return null;

    return data.account;
  } catch (err) {
    console.error("Could not load current account:", err);
    return null;
  }
}

function getAccountHref(account) {
  if (!account) return "login.html";

  if (account.role === "owner" || account.role === "manager") {
    return "dashboard.html";
  }

  return "account.html";
}

function getAccountLabel(account) {
  if (!account) return "Login";

  if (account.role === "owner" || account.role === "manager") {
    return "Dashboard";
  }

  return "My Account";
}

async function updateHeaderAccountLink() {
  const accountLink = document.getElementById("accountNavLink");
  if (!accountLink) return;

  const account = await getCurrentAccount();

  accountLink.href = getAccountHref(account);
  accountLink.textContent = getAccountLabel(account);
}