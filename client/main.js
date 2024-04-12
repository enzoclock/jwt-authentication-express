const loginForm = document.querySelector('[action="/signin"]');
loginForm.addEventListener("submit", handleSigninForm);

async function handleSigninForm(event) {
  event.preventDefault();
  const credentials = Object.fromEntries(new FormData(loginForm));
  const tokens = await signin(credentials);
  displayTokens(tokens);
}

async function signin(credentials) {
  const httpResponse = await fetch("/signin", {
    method: "POST",
    body: JSON.stringify(credentials),
    headers: { "Content-Type": "application/json" }
  });
  const tokens = await httpResponse.json();
  return tokens;
}

function displayTokens(tokens) {
  document.querySelector('[for="access-token"] input').value = tokens.accessToken;
  document.querySelector('[for="access-token"] time').textContent = tokens.accessTokenExpiresAt;
  document.querySelector('[for="refresh-token"] input').value = tokens.refreshToken;
  document.querySelector('[for="refresh-token"] time').textContent = tokens.refreshTokenExpiresAt;
  
  document.querySelector('[for="refresh-token"] input').disabled = false;
  document.querySelector('[action="/refresh"] button').disabled = false;
}

