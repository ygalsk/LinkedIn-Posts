import NextAuth from "next-auth";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import WordPress from "next-auth/providers/wordpress";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile email w_member_social" },
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    WordPress({
      clientId: process.env.WORDPRESS_CLIENT_ID,
      clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
      authorization: {
        url: "https://public-api.wordpress.com/oauth2/authorize",
        params: {
          scope: "global", // Added required scopes
        }
      },
      token: {
        url: "https://public-api.wordpress.com/oauth2/token",
        async request(context) {
          const { provider, params: parameters, checks, client } = context;
          const { callbackUrl } = provider;
          const tokenset = await client.grant({
            grant_type: "authorization_code",
            code: parameters.code,
            redirect_uri: callbackUrl,
            code_verifier: checks.code_verifier,
          });
          return { tokens: tokenset };
        },
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session) {
        session.access_token = token.access_token as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});