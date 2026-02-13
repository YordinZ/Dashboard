import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const SocialButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label?: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-10 h-10 rounded-full border border-border flex items-center justify-center
               text-muted-foreground hover:text-foreground hover:border-foreground/30
               transition-colors text-sm font-semibold"
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

export default function LoginPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showSoon = (provider: string) => {
    setToast(`${provider} login: coming soon`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputClass =
    "w-full px-4 py-3 bg-secondary border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  const saveSession = (data: any) => {
    // Paso 2: guardar token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    // opcional: borrar el demo antiguo si existe
    localStorage.removeItem("demo-auth");
  };

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail.trim(),
          password: signInPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Login failed.");
        return;
      }

      saveSession(data);
      navigate(from, { replace: true });
    } catch {
      setErrorMsg("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorMsg("Please enter name, email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Register failed.");
        return;
      }

      saveSession(data);
      navigate(from, { replace: true });
    } catch {
      setErrorMsg("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[980px] overflow-hidden rounded-[32px] bg-card shadow-2xl relative"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-[60]
                 rounded-full bg-foreground text-background px-4 py-2 text-sm shadow-lg
                 pointer-events-none"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid min-h-[540px] grid-cols-1 md:grid-cols-2 relative">
          {/* OVERLAY DESLIZANTE */}
          <motion.div
            className="absolute inset-y-0 w-1/2 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-[32px] hidden md:block z-10"
            initial={false}
            animate={{ x: isSignUp ? "0%" : "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="h-full flex items-center justify-center p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "panel-signup" : "panel-signin"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-center max-w-xs"
                >
                  <h3 className="text-3xl font-bold text-primary-foreground mb-3">
                    {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
                  </h3>
                  <p className="text-primary-foreground/80 text-sm mb-6">
                    {isSignUp
                      ? "Enter your personal details to use all of site features"
                      : "Register with your personal details to use all of site features"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setIsSignUp((v) => !v);
                    }}
                    className="px-10 py-2.5 rounded-full border-2 border-primary-foreground text-primary-foreground font-semibold text-sm tracking-wide hover:bg-primary-foreground/10 transition-all duration-300"
                  >
                    {isSignUp ? "SIGN IN" : "SIGN UP"}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* SIGN IN FORM - LADO IZQUIERDO */}
          <div className="flex items-center justify-center p-10 relative z-0">
            <AnimatePresence mode="wait">
              {!isSignUp && (
                <motion.div
                  key="form-signin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-3xl font-bold text-foreground text-center mb-5">
                    Sign In
                  </h2>

                  <div className="flex justify-center gap-3 mb-4">
                    <SocialButton label="Google" onClick={() => showSoon("Google")}>
                      G+
                    </SocialButton>

                    <SocialButton label="Facebook" onClick={() => showSoon("Facebook")}>
                      f
                    </SocialButton>

                    <SocialButton label="GitHub" onClick={() => showSoon("GitHub")}>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                    </SocialButton>

                    <SocialButton label="LinkedIn" onClick={() => showSoon("LinkedIn")}>
                      in
                    </SocialButton>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mb-5">
                    or use your email password
                  </p>

                  <div className="space-y-3 mb-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className={inputClass}
                    />

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-destructive text-center mb-4"
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={loading}
                      className="px-12 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                    >
                      {loading ? "SIGNING IN..." : "SIGN IN"}
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center mt-6 md:hidden">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setIsSignUp(true);
                      }}
                      className="text-primary font-semibold hover:underline transition-all"
                    >
                      Sign Up
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SIGN UP FORM - LADO DERECHO */}
          <div className="flex items-center justify-center p-10 relative z-0">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="form-signup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-3xl font-bold text-foreground text-center mb-5">
                    Create Account
                  </h2>

                  <div className="flex justify-center gap-3 mb-4">
                    <SocialButton label="Google" onClick={() => showSoon("Google")}>
                      G+
                    </SocialButton>

                    <SocialButton label="Facebook" onClick={() => showSoon("Facebook")}>
                      f
                    </SocialButton>

                    <SocialButton label="GitHub" onClick={() => showSoon("GitHub")}>
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                    </SocialButton>

                    <SocialButton label="LinkedIn" onClick={() => showSoon("LinkedIn")}>
                      in
                    </SocialButton>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mb-5">
                    or use your email for registration
                  </p>

                  <div className="space-y-3 mb-5">
                    <input
                      type="text"
                      placeholder="Name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className={inputClass}
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-destructive text-center mb-4"
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={loading}
                      className="px-12 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                    >
                      {loading ? "SIGNING UP..." : "SIGN UP"}
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center mt-6 md:hidden">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setIsSignUp(false);
                      }}
                      className="text-primary font-semibold hover:underline transition-all"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PANEL VERDE MÓVIL */}
          <div className="md:hidden flex items-center justify-center p-10 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))]">
            <div className="text-center max-w-xs">
              <h3 className="text-3xl font-bold text-primary-foreground mb-3">
                {isSignUp ? "Hello, Friend!" : "Welcome Back!"}
              </h3>
              <p className="text-primary-foreground/80 text-sm mb-6">
                {isSignUp
                  ? "Register with your personal details to use all of site features"
                  : "Enter your personal details to use all of site features"}
              </p>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsSignUp((v) => !v);
                }}
                className="px-10 py-2.5 rounded-full border-2 border-primary-foreground text-primary-foreground font-semibold text-sm tracking-wide hover:bg-primary-foreground/10 transition-all duration-300"
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
