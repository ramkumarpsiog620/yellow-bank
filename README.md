# Bank portal template

Register the bank with the SharedBank operator. Set its bank ID, name, IFSC and branding in `src/bank-config.js`. Set the common HTTPS Worker URL in `src/cloudflare-config.js`, or set the repository variable `VITE_X42_API_URL`.

On Node.js 22 or newer, run `npm ci` and `npm run dev` to work locally. The portal uses the bank's Firebase test account and displays live synthetic balances from the Worker.

Publish this folder to a GitHub repository and enable its GitHub Pages source with **GitHub Actions**. The supplied workflow deploys the `main` branch.

## Additional services
Create an admin in Firebase Authentication, copy its UID into firestore.rules, and publish those rules in the existing project. Enable Email/Password. Run npm install and npm run dev. Customer signs into the original Worker, then authenticates again for additional services; the Worker token is not assumed to be a Firebase ID token. Admin portal is on the original login screen. Admin creates loan products before customers apply. All original Worker endpoints remain unchanged. New application approvals are records only, not account creation, disbursement or repayment. EMI is illustrative and client-calculated; not a trusted ledger. No real KYC documents. Rules preserve default deny but are classroom-level, not production validation. Firebase tokens expire; sign in again if needed.

Session update: customer login establishes the original Worker session and Firebase REST session using the same submitted credentials. All customer add-on pages share the latter in memory, refreshing Firebase tokens before requests. Logout clears both; reload requires login. Admin portal retains its separate login. Existing Worker token lifetime is unchanged. No password is persisted. Existing published rules need no change for this update.
