import NextAuth from "next-auth"
import LinkedIn from "next-auth/providers/linkedin"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        LinkedIn({
          clientId: process.env.LINKEDIN_CLIENT_ID, 
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          authorization: {
            params: { 
              scope: 'openid profile email w_member_social' 
            }
          }
        })
      ],
      callbacks: {
        async jwt({ token, account }) {
          if (account && account.access_token) {
            token.access_token = account.access_token;
          }
          return token;
        },
        async session({ session, token}) {
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
})