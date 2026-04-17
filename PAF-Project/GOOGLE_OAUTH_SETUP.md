PS S:\Paf Project\PAF-Project\PAF-Project\backend> .\mvnw test -Dspring.profiles.active=test
.\mvnw : The term '.\mvnw' is not recognized as the name of a 
cmdlet, function, script file, or operable program. Check the  
spelling of the name, or if a path was included, verify that   
the path is correct and try again.
At line:1 char:1
+ .\mvnw test -Dspring.profiles.active=test
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (.\mvnw:String)  
    [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS S:\Paf Project\PAF-Project\PAF-Project\backend> # Google OAuth2 Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **New Project** → name it `smart-campus-hub`
3. Select the project

## Step 2: Enable Google OAuth2 API

1. Go to **APIs & Services** → **Library**
2. Search for **Google+ API** or **Google Identity**
3. Click **Enable**

## Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Set **Name**: `Smart Campus Hub`

## Step 4: Add Authorized Redirect URIs

Add these URIs:
```
http://localhost:5173/auth/callback
```
(Add production URL when deploying)

## Step 5: Copy Credentials

Copy the **Client ID** and **Client Secret** to:
- `backend/.env` → `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`

## Step 6: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External**
3. Fill in App name: `Smart Campus Hub`
4. Add your email as test user
5. Add scopes: `email`, `profile`, `openid`
