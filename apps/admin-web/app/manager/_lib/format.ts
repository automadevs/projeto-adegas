import { fallbackSeries } from "./constants";
import type { Dashboard, NavId } from "./types";

export function toCents(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized || 0) * 100);
}

export function centsToInput(value?: string | number | null): string {
  if (value == null) return "0";
  return String(Number(value) / 100);
}

export function formatMoney(value: string | number | bigint): string {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format(Number(value) / 100);
}

export function formatChartAxis(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: value >= 10000 ? 0 : 1 }).format(value / 1000)}k`;
  }
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + "%";
}

export function getMarginPercent(dashboard: Dashboard): number {
  const revenue = Number(dashboard.revenueCents);
  return revenue <= 0 ? 56.8 : (Number(dashboard.grossProfitCents) / revenue) * 100;
}

export function toChartSeries(dashboard: Dashboard) {
  if (dashboard.series.length >= 2) {
    return dashboard.series.map((point) => ({
      cogs: Number(point.cogsCents) / 100,
      label: formatShortDate(point.date),
      margin: Number(point.revenueCents) > 0 ? (Number(point.grossProfitCents) / Number(point.revenueCents)) * 100 : 0,
      revenue: Number(point.revenueCents) / 100
    }));
  }
  return fallbackSeries;
}

export function formatShortDate(date: string): string {
  const [, month, day] = date.slice(0, 10).split("-");
  return month && day ? `${day}/${month}` : date;
}

export function formatSaleDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  }).format(new Date(date)).replace(",", "");
}

export function paymentLabel(method: string): string {
  if (method === "card") return "Cartao";
  if (method === "cash") return "Dinheiro";
  if (method === "pix") return "PIX";
  return method;
}

export function orderNumber(index: number): string {
  return String(15678 - index);
}

export function shortProductName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}...` : name;
}

export function productKind(name: string): string {
  const lower = normalize(name);
  if (lower.includes("jantinha") || lower.includes("arroz") || lower.includes("feijao")) return "food";
  if (lower.includes("espeto") || lower.includes("medalhao") || lower.includes("calabresa") || lower.includes("queijo coalho")) return "skewer";
  if (lower.includes("tilapia") || lower.includes("peixe")) return "fish";
  if (lower.includes("frita") || lower.includes("mandioca") || lower.includes("porcao") || lower.includes("chapao")) return "portion";
  if (lower.includes("caipirinha") || lower.includes("drink")) return "cocktail";
  if (lower.includes("combo")) return "combo";
  if (lower.includes("vodka") || lower.includes("gin") || lower.includes("tequila") || lower.includes("licor") || lower.includes("campari")) return "spirit";
  if (lower.includes("suco")) return "juice";
  if (lower.includes("guarana") || lower.includes("sprite") || lower.includes("fanta") || lower.includes("refrigerante")) return "soda";
  if (lower.includes("skol")) return "beer skol";
  if (lower.includes("brahma")) return "beer brahma";
  if (lower.includes("heineken")) return "beer heineken";
  if (lower.includes("antarctica")) return "beer antarctica";
  if (lower.includes("johnnie") || lower.includes("whisky")) return "whisky";
  if (lower.includes("red bull") || lower.includes("energ")) return "energy";
  if (lower.includes("coca")) return "cola";
  if (lower.includes("agua")) return "water";
  return "beer";
}

export function productMark(name: string): string {
  const lower = normalize(name);
  if (lower.includes("skol")) return "SKOL";
  if (lower.includes("brahma")) return "BRA";
  if (lower.includes("heineken")) return "HEIN";
  if (lower.includes("antarctica")) return "ANT";
  if (lower.includes("johnnie")) return "JW";
  if (lower.includes("red bull")) return "RB";
  if (lower.includes("tnt")) return "TNT";
  if (lower.includes("coca")) return "COLA";
  if (lower.includes("smirnoff")) return "SM";
  return name.slice(0, 3).toUpperCase();
}

export function chartColor(index: number): string {
  return ["#0077d9", "#ef4444", "#059669", "#f59e0b", "#8b5cf6"][index % 5] ?? "#0077d9";
}

export function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function navFromPath(pathname: string): NavId {
  if (pathname.includes("/finance")) return "financeiro";
  if (pathname.includes("/products")) return "produtos";
  if (pathname.includes("/inventory")) return "estoque";
  if (pathname.includes("/sales")) return "vendas";
  if (pathname.includes("/suppliers")) return "fornecedores";
  if (pathname.includes("/purchases")) return "compras";
  if (pathname.includes("/reports")) return "relatorios";
  if (pathname.includes("/employees")) return "funcionarios";
  if (pathname.includes("/admin")) return "administracao";
  return "dashboard";
}
