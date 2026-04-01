import { Clerk } from "@clerk/clerk-sdk-node";

export const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const verifyToken = (token, opts) => clerkClient.sessions.verifySessionToken(token, opts);