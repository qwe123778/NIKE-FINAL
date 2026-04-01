import { SignIn } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";

const Login = () => (
  <>
    <Navbar />
    <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-background">
      <SignIn
        routing="path"
        path="/login"
        afterSignInUrl="/account"
        appearance={{
          variables: {
            colorPrimary:         "hsl(74 100% 50%)",
            colorBackground:      "hsl(0 0% 8%)",
            colorText:            "hsl(0 0% 98%)",
            colorInputBackground: "hsl(0 0% 12%)",
            colorInputText:       "hsl(0 0% 98%)",
            colorTextSecondary:   "hsl(0 0% 55%)",
            borderRadius:         "4px",
            fontFamily:           "inherit",
          },
          elements: {
            card:               "bg-card border border-foreground/10 shadow-xl",
            headerTitle:        "font-display not-italic text-foreground",
            headerSubtitle:     "font-mono-tech text-muted-foreground",
            formButtonPrimary:  "bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tighter",
            footerActionLink:   "text-primary hover:underline",
            formFieldInput:     "bg-secondary border-foreground/10 text-foreground font-mono",
            dividerText:        "text-muted-foreground",
            identityPreviewText: "text-foreground",
          },
        }}
      />
    </main>
  </>
);

export default Login;
