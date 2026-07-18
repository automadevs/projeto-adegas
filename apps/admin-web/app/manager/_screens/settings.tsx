import { InfoRows, PageHeader, SectionCard, Toggle } from "../_components/ui";

export function SettingsScreen({ onReset }: { readonly onReset: () => void }) {
  return (
    <>
      <PageHeader subtitle="Preferencias do sistema e dados" title="Configuracoes" />
      <div className="source-grid source-grid-two">
        <SectionCard title="Empresa">
          <InfoRows rows={[["Razao social", "Adega do Ze Comercio Ltda."], ["CNPJ", "12.345.678/0001-90"], ["Loja", "Loja matriz"], ["Endereco", "Rua das Vinhas, 123 - Sao Paulo/SP"], ["Telefone", "(11) 4000-1000"]]} />
        </SectionCard>
        <SectionCard title="Usuario atual">
          <InfoRows rows={[["Nome", "Jose Ferreira"], ["Perfil", "Administrador"], ["E-mail", "jose@adegadoze.com"]]} />
        </SectionCard>
        <SectionCard title="Preferencias">
          <div className="source-toggle-list">
            <Toggle label="Notificacoes de estoque baixo" defaultChecked />
            <Toggle label="Confirmar antes de cancelar venda" defaultChecked />
            <Toggle label="Painel de venda rapida sempre visivel" defaultChecked />
            <Toggle label="Impressao automatica do cupom" />
          </div>
        </SectionCard>
        <SectionCard title="Dados">
          <p className="source-muted">Os dados operacionais estao conectados ao backend do AdegaOS. Restauracao direta pelo frontend fica bloqueada para preservar auditoria.</p>
          <button className="source-danger" onClick={onReset} type="button">Restaurar dados iniciais</button>
        </SectionCard>
      </div>
    </>
  );
}
