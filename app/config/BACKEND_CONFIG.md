# Configuration Backend pour Cookies HttpOnly

## Pourquoi les Cookies HttpOnly ?

✅ **Sécurité supérieure** :
- Protection contre les attaques XSS (les cookies HttpOnly ne sont pas accessibles via JavaScript)
- Évite l'exposition du token si le localStorage est compromis
- Protection contre les tokens volés dans les DevTools

## Configuration requise sur le Backend

### 1. Endpoints API

#### `POST /auth/login`
**Request** :
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response** :
```json
{
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

**Headers de réponse** (IMPORTANT ⭐) :
```
Set-Cookie: authToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

#### `POST /auth/refresh`
**Description** : Renouvelle le token expiré

**Response Headers** :
```
Set-Cookie: authToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

#### `POST /auth/logout`
**Description** : Supprime les cookies

**Response Headers** :
```
Set-Cookie: authToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

### 2. Configuration CORS

**Important** : Pour que les cookies soient envoyés/reçus, votre backend doit autoriser les credentials.

#### Exemple avec Express.js + Node.js :

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000', // votre URL frontend
  credentials: true, // ⭐ CRUCIAL pour les cookies
  optionsSuccessStatus: 200
}));
```

#### En production (Railway) :
```javascript
app.use(cors({
  origin: 'https://votre-domaine-frontend.com',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 3. Configuration Express pour les Cookies

```javascript
import cookieParser from 'cookie-parser';

// Middleware
app.use(cookieParser());

// Dans votre route /auth/login :
app.post('/auth/login', (req, res) => {
  // ... validation
  
  const authToken = generateToken(); // JWT
  const refreshToken = generateRefreshToken(); // JWT plus long terme
  
  // ⭐ Réglages importants :
  const cookieOptions = {
    httpOnly: true, // Pas accessible via JavaScript
    secure: true, // Uniquement en HTTPS (prod)
    sameSite: 'strict', // Protection CSRF
    path: '/',
    maxAge: 3600000 // 1 heure en ms
  };
  
  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  };
  
  res.cookie('authToken', authToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  
  res.json({ user: { id, email, name } });
});
```

### 4. Middleware d'Authentification

```javascript
// Vérifier le token depuis les cookies (pas depuis les headers)
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // ⭐ Depuis les cookies
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 5. Refresh Token Endpoint

```javascript
app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }
  
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const newAuthToken = generateToken({
      id: decoded.id,
      email: decoded.email
    });
    
    res.cookie('authToken', newAuthToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 3600000
    });
    
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});
```

## ENV Variables Backend

```env
ACCESS_TOKEN_SECRET=votre_secret_tres_long_et_securise
REFRESH_TOKEN_SECRET=autre_secret_tres_long_et_securise
FRONTEND_URL=https://votre-domaine-frontend.com
NODE_ENV=production
```

## Checklist de Sécurité

- [ ] `httpOnly: true` sur les cookies
- [ ] `secure: true` en production (HTTPS uniquement)
- [ ] `sameSite: 'strict'` pour la protection CSRF
- [ ] CORS avec `credentials: true`
- [ ] Tokens stockés dans les cookies, pas en body
- [ ] Tokens courts (1-2h) et refresh tokens longs (7-30 jours)
- [ ] Endpoint `/auth/logout` qui efface les cookies

## Commandes pour démarrer

```bash
npm install cors cookie-parser
npm install jsonwebtoken
```

## À retenir : Frontend

Le client frontend **n'a absolument rien à faire** ! ✨
- Les tokens sont envoyés automatiquement
- Les tokens sont reçus automatiquement
- Axios avec `withCredentials: true` gère tout

C'est bien plus simple et sécurisé ! 🔒
