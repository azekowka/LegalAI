import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: 'http://localhost:3001' // Фиксированный URL для разработки
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    forgetPassword,
    resetPassword,
    changePassword,
    updateUser,
    deleteUser,
    linkSocial,
    unlinkSocial
} = authClient;
