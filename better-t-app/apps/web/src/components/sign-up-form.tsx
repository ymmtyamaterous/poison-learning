import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("アカウントを作成しました");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "名前は2文字以上で入力してください"),
          email: z.email("有効なメールアドレスを入力してください"),
          password: z.string().min(8, "パスワードは8文字以上で入力してください"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "パスワードが一致しません",
          path: ["confirmPassword"],
        }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* カードコンテナ */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 0 40px rgba(57,224,106,0.06), 0 24px 48px rgba(0,0,0,0.4)",
        }}
      >
        {/* ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>☠</div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--poison-green)",
              letterSpacing: "0.05em",
              marginBottom: "0.25rem",
            }}
          >
            アカウント作成
          </h1>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.625rem",
              color: "var(--text-muted)",
              letterSpacing: "0.12em",
            }}
          >
            CREATE ACCOUNT
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* 名前フィールド */}
          <form.Field name="name">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor={field.name}
                  style={{
                    fontSize: "0.8rem",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  名前
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.625rem 0.875rem",
                    color: "var(--text-primary)",
                    fontSize: "0.9375rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--border-strong)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(57,224,106,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                    field.handleBlur();
                  }}
                />
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--crimson)",
                      margin: 0,
                    }}
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* メールフィールド */}
          <form.Field name="email">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor={field.name}
                  style={{
                    fontSize: "0.8rem",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  メールアドレス
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.625rem 0.875rem",
                    color: "var(--text-primary)",
                    fontSize: "0.9375rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--border-strong)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(57,224,106,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                    field.handleBlur();
                  }}
                />
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--crimson)",
                      margin: 0,
                    }}
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* パスワードフィールド */}
          <form.Field name="password">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor={field.name}
                  style={{
                    fontSize: "0.8rem",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  パスワード
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.625rem 2.75rem 0.625rem 0.875rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9375rem",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--border-strong)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(57,224,106,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                      field.handleBlur();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--crimson)",
                      margin: 0,
                    }}
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* パスワード確認フィールド */}
          <form.Field name="confirmPassword">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor={field.name}
                  style={{
                    fontSize: "0.8rem",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  パスワード（確認）
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.625rem 2.75rem 0.625rem 0.875rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9375rem",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--border-strong)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(57,224,106,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                      field.handleBlur();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                    aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示する"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--crimson)",
                      margin: 0,
                    }}
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* 送信ボタン */}
          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                style={{
                  marginTop: "0.25rem",
                  width: "100%",
                  padding: "0.75rem",
                  background: canSubmit && !isSubmitting
                    ? "var(--poison-green)"
                    : "rgba(57,224,106,0.3)",
                  color: canSubmit && !isSubmitting ? "#080b10" : "rgba(8,11,16,0.5)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.06em",
                  cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
                  transition: "background 0.2s, box-shadow 0.2s",
                  boxShadow: canSubmit && !isSubmitting
                    ? "0 0 16px rgba(57,224,106,0.25)"
                    : "none",
                }}
              >
                {isSubmitting ? "処理中..." : "アカウントを作成"}
              </button>
            )}
          </form.Subscribe>
        </form>

        {/* 区切り線 */}
        <div
          style={{
            margin: "1.5rem 0 1rem",
            borderTop: "1px solid var(--border)",
          }}
        />

        {/* サインインへ切り替え */}
        <p style={{ textAlign: "center", margin: 0 }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            すでにアカウントをお持ちの方は{" "}
          </span>
          <button
            type="button"
            onClick={onSwitchToSignIn}
            style={{
              background: "none",
              border: "none",
              color: "var(--poison-green)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
}
