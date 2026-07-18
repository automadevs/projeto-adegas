"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Building2, CookingPot, KeyRound, Mail, Martini, Settings, Store, Wine } from "lucide-react";
import { DEMO_STORE_NAME } from "../_lib/demo-config";

type Role = "attendant" | "kitchen" | "bar" | "manager";

const roleRoutes: Record<Role, string> = {
  attendant: "/manager/dashboard?order=1",
  bar: "/bar",
  kitchen: "/kitchen",
  manager: "/manager/dashboard"
};

const roles: readonly { readonly description: string; readonly icon: typeof Armchair; readonly id: Role; readonly label: string }[] = [
  { description: "AdegaOS Order", icon: Armchair, id: "attendant", label: "Atendente" },
  { description: "Fila da cozinha", icon: CookingPot, id: "kitchen", label: "Cozinha" },
  { description: "Drinks e combos", icon: Martini, id: "bar", label: "Bar" },
  { description: "Painel Manager", icon: Settings, id: "manager", label: "Gerente" }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState(DEMO_STORE_NAME);
  const [branch, setBranch] = useState("Loja matriz");
  const [role, setRole] = useState<Role>("manager");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validCredentials = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 4, [email, password]);
  const canSubmit = validCredentials && company.length > 0 && branch.length > 0 && role.length > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Preencha e-mail, senha, empresa, filial e setor.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ branch, company, email, password, role })
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null) as { detail?: string } | null;
        throw new Error(problem?.detail ?? "Login invalido");
      }

      router.push(roleRoutes[role]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-login-shell">
      <form className="login-panel" onSubmit={(event) => void submit(event)}>
        <div className="login-brand"><Wine size={22} /> AdegaOS</div>
        <div>
          <h1>Entrar no sistema</h1>
          <p>Autentique, selecione empresa, filial e setor para abrir o ambiente correto.</p>
        </div>

        <div className="login-fields">
          <label>
            <span><Mail size={15} /> E-mail</span>
            <input autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} placeholder="usuario@adegaos.com" type="email" value={email} />
          </label>
          <label>
            <span><KeyRound size={15} /> Senha</span>
            <input autoComplete="current-password" minLength={4} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" value={password} />
          </label>
          <label>
            <span><Building2 size={15} /> Empresa</span>
            <select onChange={(event) => setCompany(event.target.value)} value={company}>
              <option>{DEMO_STORE_NAME}</option>
            </select>
          </label>
          <label>
            <span><Store size={15} /> Filial</span>
            <select onChange={(event) => setBranch(event.target.value)} value={branch}>
              <option>Loja matriz</option>
              <option>Filial 01</option>
            </select>
          </label>
        </div>

        <div className="login-grid">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <button className={role === item.id ? "login-role active" : "login-role"} key={item.id} onClick={() => setRole(item.id)} type="button">
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                <Icon aria-hidden="true" size={18} />
              </button>
            );
          })}
        </div>

        {error ? <p className="login-error">{error}</p> : null}
        <button className="login-submit" disabled={!canSubmit || loading} type="submit">{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
