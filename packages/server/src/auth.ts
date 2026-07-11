import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { resend, FROM_EMAIL } from "./resend";

const client = new MongoClient(process.env.MONGODB_URI as string);

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    /** Called by better-auth's requestPasswordReset endpoint */
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your OutReach CRM password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#fafafa;border-radius:12px">
            <h2 style="margin:0 0 8px;font-size:20px">Reset your password</h2>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px">
              Click the button below to reset your OutReach CRM password.
              This link expires in 1 hour.
            </p>
            <a href="${url}"
               style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Reset Password
            </a>
            <p style="margin:24px 0 0;color:#71717a;font-size:12px">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
  },
  user: {
    additionalFields: {
      image: { type: "string", required: false },
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
});

export type Auth = typeof auth;
