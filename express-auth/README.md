# express-auth

Sign-up, login and admin-only routes for a Node.js + Express API.

Built with security first. Every protection below has a test that tries the attack and expects it to fail.

- Every write route needs a login **and** the admin role
- The app refuses to start without a JWT secret of 32+ characters (no default secret)
- Tokens last 1 hour, only HS256 is accepted, and the role is read fresh on every request, so a demoted admin loses access right away
- Login is rate-limited: 10 tries per 15 minutes per IP
- A wrong email and a wrong password get the same answer and take the same time, so nobody can test which accounts exist
- Strict input validation: 12–72 character passwords, prices in whole cents, only known fields saved, 10 kB body limit, generic error messages

Passwords are hashed with bcrypt (cost 12). Users are kept in memory so the sample runs without a database; a real app uses parameterised database queries.

```bash
npm install
cp .env.example .env   # then set JWT_SECRET
npm start
npm test
```

**How I work:** working code isn't the same as safe code, so I write the "can someone who shouldn't do this, do it?" test before I call a route done.
