"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-sm border border-white/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-sm",
        secondary: "bg-white/10 backdrop-blur-md text-white/90 hover:bg-white/20",
        ghost: "hover:bg-white/10 text-white",
        link: "text-white/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-3 text-sm text-white shadow-sm transition-shadow placeholder:text-white/40 focus-visible:bg-white/20 focus-visible:border-white/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-white/50 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm() {
  const [loading, setLoading] = useState(false);
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Successfully signed in!");
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        alert("Invalid email or password. If you don't have an account, click 'Sign up' below!");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-white/70">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email" className="text-white">Email</Label><Input id="email" name="email" type="email" placeholder="enter your email" required autoComplete="email" /></div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" className="text-white" />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Successfully signed up!");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please sign in instead!");
      } else if (error.code === 'auth/weak-password') {
        alert("Password should be at least 6 characters.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-white/70">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1"><Label htmlFor="name" className="text-white">Full Name</Label><Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" /></div>
        <div className="grid gap-2"><Label htmlFor="email" className="text-white">Email</Label><Input id="email" name="email" type="email" placeholder="enter your email" required autoComplete="email" /></div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password" className="text-white" />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle }: { isSignIn: boolean; onToggle: () => void; }) {
  return (
    <div className="mx-auto grid w-[350px] gap-2">
      {isSignIn ? <SignInForm /> : <SignUpForm />}
      <div className="text-center text-sm">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button variant="link" className="pl-1 text-white/70 hover:text-white" onClick={onToggle}>
          {isSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
        <span className="relative z-10 bg-black/20 backdrop-blur-lg border border-white/10 rounded-full px-3 py-1 text-white/70">Or continue with</span>
      </div>
      <Button variant="outline" type="button" onClick={async () => {
        try {
          await signInWithPopup(auth, googleProvider);
          alert("Successfully signed in with Google!");
        } catch (error: any) {
          alert(error.message);
        }
      }}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  )
}

interface AuthContentProps {
  video?: {
    src: string;
  };
  quote?: {
    text: string;
    author: string;
  }
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
  video: {
    src: "/zoom in.mp4"
  },
  quote: {
    text: "Welcome ! The journey continues.",
    author: "Team OverClocked"
  }
};

const defaultSignUpContent = {
  video: {
    src: "/zoom in.mp4"
  },
  quote: {
    text: "Create an account. A new chapter awaits.",
    author: "EaseMize UI"
  }
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    video: { ...defaultSignInContent.video, ...signInContent.video },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    video: { ...defaultSignUpContent.video, ...signUpContent.video },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden dark flex items-center justify-center p-4">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Full-screen Endless Video Background */}
      <video
        className="absolute inset-0 h-full w-full object-cover z-0"
        src={currentContent.video.src}
        autoPlay
        loop
        muted
        playsInline
        key={currentContent.video.src}
      />

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* Floating Glassmorphism Auth Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl bg-black/50 border border-white/20 md:flex">

        {/* Left Form Panel */}
        <div className="flex-1 p-8 md:p-14 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
          <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
        </div>

        {/* Right Quote Panel */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 md:p-14 bg-gradient-to-br from-white/5 to-transparent relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          <blockquote className="relative z-10 space-y-6 text-center text-white drop-shadow-md">
            <p className="text-2xl font-semibold tracking-wide leading-relaxed">
              “<Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />”
            </p>
            <cite className="block text-sm font-medium text-white/70 not-italic uppercase tracking-widest drop-shadow-sm">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>

      </div>
    </div>
  );
}
