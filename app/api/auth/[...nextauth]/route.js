import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: "Ov23linOQjd2kV6FaFDV",
      clientSecret: "f47bfce594e132fc9789ecf574a6f91a3f3cfc07",
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            console.log("User not found");
            throw new Error("Invalid email or password");
          }

          // Compare hashed password
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            console.log("Password does not match");
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Login error:", error);
          throw new Error("Something went wrong during authentication.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectMongoDB();
          // Check if user already exists with this email
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user if doesn't exist
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
              googleId: account.provider === "google" ? user.id : undefined,
              githubId: account.provider === "github" ? user.id : undefined,
              provider: account.provider,
              ...(account.provider === "github" && {
                githubUsername: profile.login,
                githubAvatar: profile.avatar_url,
                githubBio: profile.bio,
                githubUrl: profile.html_url
              })
            });
          } else {
            // If user exists, check if they're trying to link a new provider
            const update = {};
            
            if (account.provider === "google" && !existingUser.googleId) {
              update.googleId = user.id;
              update.provider = "google";
            } else if (account.provider === "github" && !existingUser.githubId) {
              update.githubId = user.id;
              update.provider = "github";
              update.githubUsername = profile.login;
              update.githubAvatar = profile.avatar_url;
              update.githubBio = profile.bio;
              update.githubUrl = profile.html_url;
            }
            
            // Only update if there are changes to make
            if (Object.keys(update).length > 0) {
              await User.findByIdAndUpdate(existingUser._id, update);
            }
          }
          return true;
        } catch (error) {
          console.error("Error during OAuth sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.provider = token.provider;
        
        // Add GitHub details to session if available
        if (token.githubDetails) {
          session.user.githubUsername = token.githubDetails.username;
          session.user.githubAvatar = token.githubDetails.avatar;
          session.user.githubBio = token.githubDetails.bio;
          session.user.githubUrl = token.githubDetails.url;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        // Store GitHub details in the token if it's a GitHub login
        if (account.provider === "github") {
          token.githubDetails = {
            username: profile.login,
            avatar: profile.avatar_url,
            bio: profile.bio,
            url: profile.html_url
          };
        }
      }
      return token;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
