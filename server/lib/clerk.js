// lib/clerk.js
import { clerkClient, verifyToken } from "@clerk/clerk-sdk-node";

// Optionally initialize the client (mostly needed for old patterns)
clerkClient; // already auto-configured via CLERK_SECRET_KEY in env

export { clerkClient, verifyToken };