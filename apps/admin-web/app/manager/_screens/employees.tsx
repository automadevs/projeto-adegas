import { useMemo, useState } from "react";

import { Icon } from "../_components/icons";
import { Badge, PageHeader, SectionCard } from "../_components/ui";

type EmployeeRole = "Atendente" | "Cozinha" | "Bar" | "Gerente";

interface Employee {
  readonly active: boolean;
  readonly email: string;
  readonly id: string;
  readonly name: string;
  readonly permissions: readonly string[];
  readonly role: EmployeeRole;
}

const rolePermissions: Record<EmployeeRole, readonly string[]> = {
  Atendente: ["Order", "Mesas", "Pedidos", "Vendas"],
  Bar: ["Fila do bar", "Receber pedido", "Marcar pronto"],
  Cozinha: ["Fila da cozinha", "Receber pedido", "Marcar pronto"],
  Gerente: ["Manager", "Financeiro", "Estoque", "Relatorios", "Funcionarios"]
};

const initialEmployees: readonly Employee[] = [
  { active: true, email: "gerente@adegaos.local", id: "emp-manager", name: "Jose Ferreira", permissions: rolePermissions.Gerente, role: "Gerente" },
  { active: true, email: "atendente@adegaos.local", id: "emp-order", name: "Atendente Balcao", permissions: rolePermissions.Atendente, role: "Atendente" },
  { active: true, email: "cozinha@adegaos.local", id: "emp-kitchen", name: "Cozinha", permissions: rolePermissions.Cozinha, role: "Cozinha" },
  { active: true, email: "bar@adegaos.local", id: "emp-bar", name: "Bar", permissions: rolePermissions.Bar, role: "Bar" }
];

export function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([...initialEmployees]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return employees.filter((employee) => (
      normalized === "" ||
      employee.name.toLowerCase().includes(normalized) ||
      employee.email.toLowerCase().includes(normalized) ||
      employee.role.toLowerCase().includes(normalized)
    ));
  }, [employees, query]);

  function addEmployee(form: FormData): void {
    const role = String(form.get("role") ?? "Atendente") as EmployeeRole;
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmployees((current) => [{
      active: true,
      email,
      id: crypto.randomUUID(),
      name,
      permissions: rolePermissions[role],
      role
    }, ...current]);
  }

  return (
    <>
      <PageHeader subtitle="Cadastro de funcionarios e permissoes por perfil operacional" title="Funcionarios" />
      <div className="source-grid source-grid-two">
        <SectionCard title="Cadastrar funcionario">
          <form action={addEmployee} className="source-form">
            <label><span>Nome</span><input name="name" required /></label>
            <label><span>E-mail</span><input name="email" required type="email" /></label>
            <label>
              <span>Perfil</span>
              <select name="role">
                {Object.keys(rolePermissions).map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <button className="source-primary" type="submit"><Icon name="plus" /> Cadastrar</button>
          </form>
        </SectionCard>
        <SectionCard title="Permissoes por perfil">
          <div className="source-permission-list">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <article key={role}>
                <strong>{role}</strong>
                <div>{permissions.map((permission) => <Badge key={permission} tone="primary">{permission}</Badge>)}</div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard action={<label className="source-search"><Icon name="search" /><input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar funcionario..." value={query} /></label>} title="Equipe">
        <div className="source-table-wrap">
          <table className="source-table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Permissoes</th><th>Status</th><th className="source-right">Acao</th></tr></thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.name}</strong></td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td><div className="source-chip-row">{employee.permissions.map((permission) => <Badge key={permission}>{permission}</Badge>)}</div></td>
                  <td><Badge tone={employee.active ? "success" : "muted"}>{employee.active ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="source-right"><button className="source-link" onClick={() => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, active: !item.active } : item))} type="button">{employee.active ? "Bloquear" : "Ativar"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
