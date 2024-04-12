const loginForm = document.querySelector('[action="/signin"]');
loginForm.addEventListener("submit", handleSigninForm);

const refreshForm = document.querySelector('[action="/refresh');
refreshForm.addEventListener("submit", handleRefreshForm);

// ====================

async function handleSigninForm(event) {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(loginForm));
  const tokens = await post("/signin", { email, password });
  displayTokens(tokens);
}


function displayTokens(tokens) {
  document.querySelector('[for="access-token"] input').value = tokens.accessToken;
  document.querySelector('[for="access-token"] time').textContent = tokens.accessTokenExpiresAt;
  document.querySelector('[for="refresh-token"] input').value = tokens.refreshToken;
  document.querySelector('[for="refresh-token"] time').textContent = tokens.refreshTokenExpiresAt;
  
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