import { IUser } from "@/types";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import process from "process";

export type ILinkedInProfile = {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: string;
  locale: string;
};

export default NextAuth({
  providers: [
    // OAuth authentication providers
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        url: process.env.NEXT_PUBLIC_TEST_auth_uri,
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        },
      },
      // not seeing id or emailVerified being set
      // profile: (profile) => ({
      //   id: profile.sub,
      //   name: profile.name,
      //   email: profile.email,
      //   image: profile.picture,
      //   emailVerified: profile.email_verified,
      //   profile: ({
      //     firstName: profile.given_name,
      //     lastName: profile.family_name,
      //   })
      // }) as any

      // scope:
      //   "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    }),
    LinkedInProvider({
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_LINKEDIN_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      allowDangerousEmailAccountLinking: true,
      profile: ((profile: ILinkedInProfile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified,
          profile: {
            firstName: profile.given_name,
            lastName: profile.family_name,
          } as Partial<IUser["profile"]>,
        };
      }) as any,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        // const res = await fetch("/your/endpoint", {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" }
        // })
        // const user = await res.json()

        // // If no error and we have user data, return it
        // if (res.ok && user) {
        //   return user
        // }
        // Return null if user data could not be retrieved
        return { id: "1", name: "J Smith", email: "jsmith@example.com" };
      },
    }),
    // Sign in with passwordless email link
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: '<no-reply@thehilmar.com>'
    // }),
  ],
  session: {
    strategy: "database",
  },
  //@ts-ignore
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FSDB_PROJECT_ID!,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.NEXT_PUBLIC_FSDB_PRIVATE_KEY!,
    }),
  }),
  debug: true,
  // don't see this fring
  // callbacks: {
  //   jwt: ({ trigger, user, token, session }) => {
  //     console.log(trigger)
  //     if (trigger === "signUp") {
  //       //set user id to session.userId
  //       console.log(user.id, session.userId)
  //       user.id = session.userId
  //     }
  //     console.log(user.id, token)
  //     return token
  //   }
  // }
});
