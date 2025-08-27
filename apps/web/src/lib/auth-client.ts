import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        emailOTPClient()
    ]
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
    unlinkAccount
} = authClient;

// Email OTP methods are nested under emailOtp
export const {
    sendVerificationOtp,
    checkVerificationOtp,
    verifyEmail,
    resetPassword: resetPasswordOtp
} = authClient.emailOtp;
