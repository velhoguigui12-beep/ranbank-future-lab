// Qual cartão cada conta tem. Decidido aqui, sem mudar o banco de dados:
// contas novas recebem o cartão básico RanBank (azul-escuro);
// clientes da casa (hoje, só a conta da Ana) têm o Ecocard.

export type OwnCard = "basic" | "ecocard";

const HOUSE_CLIENT_ACCOUNTS = ["1234-5"];

export const ownCardFor = (account?: string): OwnCard =>
  account && HOUSE_CLIENT_ACCOUNTS.includes(account.trim()) ? "ecocard" : "basic";

export const OWN_CARD_NAME: Record<OwnCard, string> = { basic: "cartão RanBank", ecocard: "Ecocard" };
