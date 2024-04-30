const loginForm = document.querySelector('[action="/login"]');
loginForm.addEventListener("submit", handleLoginForm);

const refreshForm = document.querySelector('[action="/refresh');
refreshForm.addEventListener("submit", handleRefreshForm);

document.getElementById("get-unauthenticated-public-stuff")
  .addEventListener("click", () => get("/public-stuff"));

document.getElementById("get-unauthenticated-private-stuff")
  .addEventListener("click", () => get("/private-stuff"));

document.getElementById("get-authenticated-public-stuff")
  .addEventListener("click", () => authenticatedGet("/public-stuff"));

document.getElementById("get-authenticated-private-stuff")
  .addEventListener("click", () => authenticatedGet("/private-stuff"));


// ====================

async function handleLoginForm(event) {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(loginForm));
  const tokens = await post("/login", { email, password });
  displayTokens(tokens);
}


function displayTokens(tokens) {
  // Stored automatically in cookies via Set-Cookie headers
  document.querySelector('[for="access-token"] input').value = tokens.accessToken;
  document.querySelector('[for="access-token"] time').textContent = tokens.accessTokenExpiresAt;
  document.querySelector('[for="refresh-token"] input').value = tokens.refreshToken;
  document.querySelector('[for="refresh-token"] time').textContent = tokens.refreshTokenExpiresAt;
  document.querySelector('[for="csrf-token"] input').value = tokens.csrfToken;
  
  // Stored manually in localStorage
  localStorage.setItem("csrfToken", tokens.csrfToken);
  document.querySelector('[for="refresh-token"] input').disabled = false;
  document.querySelector('[action="/refresh"] button').disabled = false;
}


async function handleRefreshForm(event) {
  event.preventDefault();
  const { token } = Object.fromEntries(new FormData(refreshForm));
  const tokens = await post("/refresh", { token });
  displayTokens(tokens);
}


async function post(url, body) {
  const httpResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  return await httpResponse.json();
}

async function get(url) {
  const httpResponse = await fetch(url);
  const json = await httpResponse.json();
  const jsonText = JSON.stringify(json, null, 2);
  document.querySelector("#unauthenticated-response").textContent = jsonText;
}

