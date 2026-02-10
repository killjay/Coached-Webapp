# Service Account Key Placeholder

⚠️ **PLACE YOUR FIREBASE SERVICE ACCOUNT KEY HERE**

## How to Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Place it in this `scripts/` folder

## Expected File

The file should be named exactly: `serviceAccountKey.json`

It should be a JSON file with the following structure:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Security Warning

🔒 **NEVER commit this file to version control!**

The file is already listed in `.gitignore` to prevent accidental commits.

## Need Help?

See the main documentation: `scripts/README.md`
