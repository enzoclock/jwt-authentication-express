# Authentication

## Installation

```bash
# Check Node.js version (>= 20)
node -v

# Install dependencies
npm install

# Setup SQLite database
npm run db:reset

# Run in dev mode
npm run dev

# Test it from a browser
curl http://localhost:3000
```

## Explanation

Demonstration of authentification with a signed JWT token.

- JWT (= access token) is generated and signed server side, and stored in client browser as a secure http-only cookie.
- The access token cookie is automatically send by client browser on each request to the server, authenticating the request. 
- A refresh token route is available for the client to renew its access token in case it expires while the user is still logged in.
- A protection against CSRF attack is added : clients need to send both the access token (in a cookie or Authorization header) and a CSRF token (in custom header) to validate the request is trustfully performed by the client application.


A Vanilla-JS client is provided for demonstration purposes. Any suggestion is welcome!
