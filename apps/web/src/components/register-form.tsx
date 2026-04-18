"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { InputIcon } from "@/components/auth-icons";

type RegisterFormCopy = {
  username: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  submit: string;
  pending: string;
  hint: string;
  error: string;
  passwordMismatch: string;
};

type RegisterPageCopy = {
  oauthDivider: string;
  passwordDivider: string;
  loginLink: string;
  loginCta: string;
  providerHint: string;
  google: string;
  github: string;
  privacy: string;
  terms: string;
  legalPrefix: string;
};

export function RegisterForm({
  redirectTo,
  copy,
  pageCopy,
  oauthEnabled,
}: {
  redirectTo: string;
  copy: RegisterFormCopy;
  pageCopy: RegisterPageCopy;
  oauthEnabled: { google: boolean; github: boolean };
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return "用户名不能为空";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "密码不能为空";
    }
    if (value.length < 6) {
      return "密码长度至少为6个字符";
    }
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return "请确认密码";
    }
    if (value !== password) {
      return "两次输入的密码不一致";
    }
    return "";
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);
    const error = validateUsername(value);
    setValidationErrors(prev => ({ ...prev, username: error || undefined }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    const error = validatePassword(value);
    setValidationErrors(prev => ({ 
      ...prev, 
      password: error || undefined,
      confirmPassword: validateConfirmPassword(confirmPassword) || undefined
    }));
  };

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConfirmPassword(value);
    const error = validateConfirmPassword(value);
    setValidationErrors(prev => ({ ...prev, confirmPassword: error || undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Validate form
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    
    if (usernameError || passwordError || confirmPasswordError) {
      setValidationErrors({ 
        username: usernameError || undefined, 
        password: passwordError || undefined,
        confirmPassword: confirmPasswordError || undefined
      });
      return;
    }

    setPending(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password, redirectTo }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? copy.error);
      setPending(false);
      return;
    }

    setPending(false);
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-lg bg-risk-high-bg p-3 text-sm text-risk-high">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="register-username">{copy.username}</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon text-muted-foreground"><InputIcon icon="user" /></span>
              <input 
                id="register-username" 
                className={`portal-input auth-input-field h-[48px] text-[15px] ${validationErrors.username ? 'border-risk-high' : ''}`}
                value={username} 
                onChange={handleUsernameChange} 
                required 
              />
              {validationErrors.username && (
                <p className="text-xs text-risk-high mt-1">{validationErrors.username}</p>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="register-password">{copy.password}</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon text-muted-foreground"><InputIcon icon="lock" /></span>
              <input 
                id="register-password" 
                type="password" 
                className={`portal-input auth-input-field h-[48px] text-[15px] ${validationErrors.password ? 'border-risk-high' : ''}`}
                value={password} 
                onChange={handlePasswordChange} 
                placeholder={copy.passwordPlaceholder} 
                required 
              />
              {validationErrors.password && (
                <p className="text-xs text-risk-high mt-1">{validationErrors.password}</p>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="register-confirm-password">{copy.confirmPassword}</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon text-muted-foreground"><InputIcon icon="shield" /></span>
              <input 
                id="register-confirm-password" 
                type="password" 
                className={`portal-input auth-input-field h-[48px] text-[15px] ${validationErrors.confirmPassword ? 'border-risk-high' : ''}`}
                value={confirmPassword} 
                onChange={handleConfirmPasswordChange} 
                placeholder={copy.confirmPasswordPlaceholder} 
                required 
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-risk-high mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>
        <button type="submit" disabled={pending} className="hero-button-primary mt-2 flex h-[48px] items-center justify-center rounded-[14px] text-[15px] font-medium shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <div className="flex flex-col items-center gap-4 2xl:gap-6 mt-8 2xl:mt-12">
        {!error ? (
          <p className="text-[16px] 2xl:text-[18px] text-muted-foreground">{copy.hint}</p>
        ) : null}
        
        <p className="text-[13px] text-muted-foreground mt-2">
          {pageCopy.loginLink}{" "}
          <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-foreground font-medium transition-colors hover:underline underline-offset-4">
            {pageCopy.loginCta}
          </Link>
        </p>

        <p className="text-center text-[12px] leading-relaxed text-muted-foreground/60 mt-1">
          {pageCopy.legalPrefix}{" "}
          <Link href="/docs/privacy" className="font-medium transition-colors hover:text-foreground">{pageCopy.privacy}</Link>
          {" · "}
          <Link href="/docs/terms" className="font-medium transition-colors hover:text-foreground">{pageCopy.terms}</Link>
        </p>
      </div>
    </div>
  );
}
