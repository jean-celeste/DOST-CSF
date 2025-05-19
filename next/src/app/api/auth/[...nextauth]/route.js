import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/lib/db/utils";
import bcrypt from 'bcrypt'; // Import bcrypt

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password) {
          return null;
        }
        // First, find the user by username
        const userResult = await executeQuery(
          'SELECT * FROM admins WHERE username = $1',
          [credentials.username]
        );

        if (userResult.rows.length > 0) {
          const admin = userResult.rows[0];
          
          // compare the provided password with the stored hashed password
          const passwordMatch = await bcrypt.compare(credentials.password, admin.password);

          if (passwordMatch) {
            // If passwords match, return the user object for NextAuth
            return { id: admin.admin_id, username: admin.username, role: "admin" };
          }
        }
        // If user not found or password doesn't match, return null
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };