document.querySelector("#signup-form")
  .addEventListener("submit", handleSignupForm);

document.querySelector("#login-form")
  .addEventListener("submit", handleLoginForm);

document.querySelector("#refresh-form")
  .addEventListener("submit", handleRefreshForm);

document.querySelector("#logout-form")
  .addEventListener("click", handleLogoutForm);

document.querySelector("#get-unauthenticated-public-stuff")
  .addEventListener("click", () => handleUnauthenticatedRequest("/public-stuff"));

document.querySelector("#get-unauthenticated-private-stuff")
  .addEventListener("click", () => handleUnauthenticatedRequest("/private-stuff"));

document.querySelector("#get-authenticated-public-stuff")
  .addEventListener("click", () => handleAuthenticatedRequest("/public-stuff"));

document.querySelector("#get-authenticated-private-stuff")
  .addEventListener("click", () => handleAuthenticatedRequest("/private-stuff"));



// ========================================================================

async function handleSignupForm(event) {
  event.preventDefault();

  const signupForm = document.querySelector("#signup-form");
  const { username, email, password, confirm } = Object.fromEntries(new FormData(signupForm));
  
  await post("/signup", { username, email, password, confirm });
}

async function handleLoginForm(event) {
  event.preventDefault();

  const loginForm = document.querySelector("#login-form");
  const { email, password } = Object.fromEntries(new FormData(loginForm));
  
  // Access and refresh tokens are automatically stored in cookies via Set-Cookie headers
  const tokens = await post("/login", { email, password });

  // CSRF tokens is manually stored in localStorage
  localStorage.setItem("csrfToken", tokens.csrfToken);

  // Display tokens for demonstration
  displayTokens(tokens);
}


function displayTokens(tokens) {
  document.querySelector('[for="access-token"] input').value = tokens.accessToken;
  document.querySelector('[for="access-token"] time').textContent = tokens.accessTokenExpiresAt;
  
  document.querySelector('[for="refresh-token"] input').value = tokens.refreshToken;
  document.querySelector('[for="refresh-token"] time').textContent = tokens.refreshTokenExpiresAt;
  document.querySelector('[for="refresh-token"] input').disabled = false;
  
  document.querySelector('[for="csrf-token"] input').value = tokens.csrfToken;
  
  document.querySelector("#refresh-form button").disabled = false;
}


async function handleRefreshForm(event) {
  event.preventDefault();

  // Renewed access and refresh tokens are automatically stored in cookies via reponse Set-Cookie headers
  const tokens = await post("/refresh"); // refreshToken cookie is send automatically

  // CSRF tokens is manually stored in localStorage
  localStorage.setItem("csrfToken", tokens.csrfToken);
  
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

async function get(url, options = {}) {
  const httpResponse = await fetch(url, options);
  return await httpResponse.json();
}

async function handleUnauthenticatedRequest(url) {
  const json = await get(url);
  const jsonText = JSON.stringify(json, null, 2);
  document.querySelector("#unauthenticated-response").textContent = jsonText;
}

async function handleAuthenticatedRequest(url) {
  const json = await get(url, {
    credentials: "include", // Include cross-domain cookies in request
    headers: {
      "x-csrf-token": localStorage.getItem("csrfToken") // Include CSRF token to mitigate risks
    }
  });

  const jsonText = JSON.stringify(json, null, 2);
  document.querySelector("#authenticated-response").textContent = jsonText;
}


async function handleLogoutForm(event) {
  event.preventDefault();

  await fetch("/logout", { method: "DELETE" });

  document.querySelector('[for="access-token"] input').value = "";
  document.querySelector('[for="access-token"] time').textContent = "";
  document.querySelector('[for="refresh-token"] input').value = "";
  document.querySelector('[for="refresh-token"] time').textContent = "";
  document.querySelector('[for="csrf-token"] input').value = "";
}
