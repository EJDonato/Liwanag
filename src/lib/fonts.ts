import { Bricolage_Grotesque, Figtree } from "next/font/google";

// Shared by the public and admin root layouts so both load the same two families once.
export const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
