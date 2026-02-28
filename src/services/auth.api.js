import api from "./api"; // ton axios mobile (api.js)

// Login
export const loginApi = (data) => {
  return api.post("/login", data);
};

// Logout
export const logoutApi = () => {
  return api.post("/logout");
};

// Mot de passe oublié
export const forgotPassword = (data) => api.post('/forgot-password', data);

// Réinitialisation du mot de passe
export const resetPassword = (data) => api.post('/reset-password', data);

// Mise à jour du profil
export const updateProfile = (data) => api.put('/profile', data);

// Mise à jour du mot de passe
export const updatePassword = (data) => api.put('/password', data);

// Renvoyer l'email de vérification
export const resendEmailVerification = () => api.post('/email/resend');

// Vérification de l'email
export const verifyEmail = (token) => api.get(`/verify-email/${token}`);

// Récupérer l'utilisateur connecté
export const meApi = () => api.get('/me');

// Note : types TypeScript supprimés pour compatibilité mobile JS