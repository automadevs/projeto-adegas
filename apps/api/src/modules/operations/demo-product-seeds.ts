export interface DemoCatalogSeed {
  readonly name: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly category: string;
  readonly unit: string;
  readonly salePriceCents: bigint;
  readonly costPriceCents: bigint;
  readonly minStock: number;
  readonly active: boolean;
  readonly ageRestricted: boolean;
  readonly openingStock: number;
}

function seed(
  sku: string,
  name: string,
  category: string,
  unit: string,
  salePriceCents: number,
  openingStock: number,
  options: {
    readonly ageRestricted?: boolean;
    readonly costRate?: number;
    readonly minStock?: number;
  } = {}
): DemoCatalogSeed {
  const costRate = options.costRate ?? 55;

  return {
    name,
    sku,
    barcode: null,
    category,
    unit,
    salePriceCents: BigInt(salePriceCents),
    costPriceCents: BigInt(Math.floor((salePriceCents * costRate) / 100)),
    minStock: options.minStock ?? 6,
    active: true,
    ageRestricted: options.ageRestricted ?? false,
    openingStock
  };
}

export const coreDemoProductSeeds: readonly DemoCatalogSeed[] = [
  seed("SKOL350", "Cerveja Skol Lata 350ml", "Cervejas", "un", 329, 12, { ageRestricted: true, costRate: 56, minStock: 30 }),
  seed("BRA350", "Cerveja Brahma Lata 350ml", "Cervejas", "un", 329, 8, { ageRestricted: true, costRate: 58, minStock: 25 }),
  seed("JWRED1L", "Whisky Johnnie Walker Red 1L", "Destilados", "garrafa", 8990, 3, { ageRestricted: true, costRate: 68, minStock: 6 }),
  seed("REDBULL250", "Energetico Red Bull 250ml", "Energeticos", "un", 890, 15, { costRate: 61, minStock: 40 }),
  seed("CRYSTAL500", "Agua Mineral Crystal 500ml", "Conveniencia", "un", 250, 18, { costRate: 38, minStock: 50 }),
  seed("HEINEKEN330", "Cerveja Heineken Long Neck 330ml", "Cervejas", "un", 649, 36, { ageRestricted: true, costRate: 61, minStock: 18 }),
  seed("ANT350", "Antarctica Subzero 350ml", "Cervejas", "un", 319, 44, { ageRestricted: true, costRate: 55, minStock: 20 }),
  seed("COCA2L", "Coca-Cola 2L", "Refrigerantes", "un", 949, 24, { costRate: 55, minStock: 14 }),
  seed("SMIRNOFF998", "Smirnoff 998ml", "Destilados", "garrafa", 6490, 10, { ageRestricted: true, costRate: 66, minStock: 8 }),
  seed("TNT269", "Energetico TNT 269ml", "Energeticos", "un", 790, 15, { costRate: 53, minStock: 40 })
];

export const menuDemoProductSeeds: readonly DemoCatalogSeed[] = [
  seed("MENU-JANTINHA", "Jantinha completa", "Jantinha", "prato", 1999, 18),
  seed("MENU-ACR-BATATA", "Acrescimo de batata", "Jantinha", "porcao", 500, 20, { minStock: 4 }),
  seed("ESP-BOI", "Espeto tradicional de boi", "Espetos", "un", 1000, 24),
  seed("ESP-PANCETA", "Espeto panceta suina barriguinha", "Espetos", "un", 900, 18),
  seed("ESP-MED-FRANGO", "Espeto medalhao de frango", "Espetos", "un", 1200, 16),
  seed("ESP-MED-CARNE", "Espeto medalhao de carne", "Espetos", "un", 1200, 16),
  seed("ESP-CALABRESA", "Espeto calabresa", "Espetos", "un", 900, 18),
  seed("ESP-CORACAO", "Espeto coracao", "Espetos", "un", 1000, 14),
  seed("ESP-TULIPA", "Espeto tulipa meio da asa", "Espetos", "un", 900, 14),
  seed("ESP-QUEIJO", "Espeto queijo coalho", "Espetos", "un", 900, 16),
  seed("ESP-PAO-ALHO", "Espeto pao de alho", "Espetos", "un", 1200, 12),
  seed("OUT-FEIJAO-TROPEIRO", "Feijao tropeiro", "Outros", "porcao", 1800, 10),
  seed("OUT-CALDO", "Caldo", "Outros", "porcao", 1600, 12),
  seed("POR-CARNE-SOL-FRITAS-M", "Carne de sol com fritas meia", "Porcoes de carne", "porcao", 5000, 10),
  seed("POR-CARNE-SOL-FRITAS-I", "Carne de sol com fritas inteira", "Porcoes de carne", "porcao", 6000, 8),
  seed("POR-CARNE-SOL-MAND-M", "Carne de sol com mandioca meia", "Porcoes de carne", "porcao", 5000, 10),
  seed("POR-CARNE-SOL-MAND-I", "Carne de sol com mandioca inteira", "Porcoes de carne", "porcao", 6000, 8),
  seed("POR-CALABRESA-FRITAS-M", "Calabresa com fritas meia", "Porcoes de carne", "porcao", 4500, 10),
  seed("POR-CALABRESA-FRITAS-I", "Calabresa com fritas inteira", "Porcoes de carne", "porcao", 5500, 8),
  seed("POR-CALABRESA-MAND-M", "Calabresa com mandioca meia", "Porcoes de carne", "porcao", 4500, 10),
  seed("POR-CALABRESA-MAND-I", "Calabresa com mandioca inteira", "Porcoes de carne", "porcao", 5500, 8),
  seed("POR-FRITAS-MAND-M", "Fritas ou mandioca simples meia", "Porcoes", "porcao", 3000, 12),
  seed("POR-FRITAS-MAND-I", "Fritas ou mandioca simples inteira", "Porcoes", "porcao", 3500, 10),
  seed("POR-FRITAS-BACON-M", "Fritas com queijo e bacon meia", "Porcoes", "porcao", 4000, 10),
  seed("POR-FRITAS-BACON-I", "Fritas com queijo e bacon inteira", "Porcoes", "porcao", 4500, 8),
  seed("PEIXE-TILAPIA-FRITAS-M", "Tilapia com fritas meia", "Peixes", "porcao", 5000, 8),
  seed("PEIXE-TILAPIA-FRITAS-I", "Tilapia com fritas inteira", "Peixes", "porcao", 6000, 6),
  seed("PEIXE-TILAPIA-M", "Tilapia meia", "Peixes", "porcao", 3000, 8),
  seed("PEIXE-TILAPIA-I", "Tilapia inteira", "Peixes", "porcao", 4000, 6),
  seed("CHAPA-CHAPAO", "Chapao completo", "Chapas", "porcao", 11500, 6),
  seed("AGUA-GAS", "Agua com gas", "Aguas", "un", 400, 24, { minStock: 10 }),
  seed("AGUA-SEM-GAS", "Agua sem gas", "Aguas", "un", 400, 24, { minStock: 10 }),
  seed("AGUA-COCO-CAIXINHA", "Agua de coco caixinha", "Aguas", "un", 400, 18, { minStock: 8 }),
  seed("AGUA-TONICA", "Agua tonica", "Aguas", "un", 600, 18, { minStock: 8 }),
  seed("H2O-500", "H2O", "Aguas", "un", 600, 18, { minStock: 8 }),
  seed("H2O-1L", "H2O 1 Litro", "Aguas", "un", 1200, 0, { minStock: 6 }),
  seed("COCO-NATURAL", "Coco natural", "Aguas", "un", 1000, 10, { minStock: 5 }),
  seed("SKOL-BEATS", "Skol Beats", "Energetico e Ice", "un", 1000, 18, { ageRestricted: true, minStock: 8 }),
  seed("RED-BULL-CARDAPIO", "Red Bull", "Energetico e Ice", "un", 1200, 18, { minStock: 8 }),
  seed("MONSTER-CARDAPIO", "Monster", "Energetico e Ice", "un", 1400, 16, { minStock: 8 }),
  seed("ICE-SMIRNOFF", "Ice Smirnoff", "Energetico e Ice", "un", 1000, 16, { ageRestricted: true, minStock: 8 }),
  seed("ICE-CABARE", "Ice Cabare", "Energetico e Ice", "un", 800, 12, { ageRestricted: true, minStock: 6 }),
  seed("CERV-BRAHMA-600", "Brahma 600ml", "Cervejas 600ml", "garrafa", 1100, 24, { ageRestricted: true, minStock: 8 }),
  seed("CERV-SKOL-600", "Skol 600ml", "Cervejas 600ml", "garrafa", 1000, 24, { ageRestricted: true, minStock: 8 }),
  seed("CERV-ANT-600", "Antarctica 600ml", "Cervejas 600ml", "garrafa", 1100, 24, { ageRestricted: true, minStock: 8 }),
  seed("CERV-ANT-ORIG-600", "Antarctica Original 600ml", "Cervejas 600ml", "garrafa", 1300, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-BUD-600", "Budweiser 600ml", "Cervejas 600ml", "garrafa", 1200, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-STELLA-600", "Stella Artois 600ml", "Cervejas 600ml", "garrafa", 1200, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-HEINEKEN-600", "Heineken 600ml", "Cervejas 600ml", "garrafa", 1500, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-SPATEN-600", "Spaten 600ml", "Cervejas 600ml", "garrafa", 1200, 18, { ageRestricted: true, minStock: 8 }),
  seed("CERV-AMSTEL-600", "Amstel 600ml", "Cervejas 600ml", "garrafa", 1100, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-PETRA-600", "Petra 600ml", "Cervejas 600ml", "garrafa", 1000, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-HEINEKEN-LN", "Heineken Long Neck", "Cervejas Long Neck", "un", 900, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-BUD-LN", "Budweiser Long Neck", "Cervejas Long Neck", "un", 900, 20, { ageRestricted: true, minStock: 8 }),
  seed("CERV-CORONA-LN", "Corona Long Neck", "Cervejas Long Neck", "un", 900, 18, { ageRestricted: true, minStock: 8 }),
  seed("REFRI-COCA-LATA", "Coca-Cola lata", "Refrigerantes", "un", 600, 20, { minStock: 8 }),
  seed("REFRI-COCA-600", "Coca-Cola 600ml", "Refrigerantes", "un", 800, 20, { minStock: 8 }),
  seed("REFRI-COCA-1L", "Coca-Cola 1 litro", "Refrigerantes", "un", 900, 18, { minStock: 8 }),
  seed("REFRI-FANTA-LATA", "Fanta lata", "Refrigerantes", "un", 600, 18, { minStock: 8 }),
  seed("REFRI-FANTA-600", "Fanta 600ml", "Refrigerantes", "un", 800, 18, { minStock: 8 }),
  seed("REFRI-FANTA-2L", "Fanta 2 litros", "Refrigerantes", "un", 1400, 14, { minStock: 6 }),
  seed("REFRI-GUARANA-LATA", "Guarana lata", "Refrigerantes", "un", 500, 20, { minStock: 8 }),
  seed("REFRI-GUARANA-600", "Guarana 600ml", "Refrigerantes", "un", 700, 18, { minStock: 8 }),
  seed("REFRI-GUARANA-1L", "Guarana 1 litro", "Refrigerantes", "un", 800, 16, { minStock: 8 }),
  seed("REFRI-GUARANA-2L", "Guarana 2 litros", "Refrigerantes", "un", 1200, 14, { minStock: 6 }),
  seed("REFRI-SPRITE-LATA", "Sprite lata", "Refrigerantes", "un", 600, 18, { minStock: 8 }),
  seed("REFRI-SPRITE-600", "Sprite 600ml", "Refrigerantes", "un", 800, 18, { minStock: 8 }),
  seed("REFRI-SPRITE-1L", "Sprite 1 litro", "Refrigerantes", "un", 900, 16, { minStock: 8 }),
  seed("REFRI-SPRITE-2L", "Sprite 2 litros", "Refrigerantes", "un", 1400, 14, { minStock: 6 }),
  seed("SUCO-ABACAXI-COPO", "Suco abacaxi copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-ABACAXI-1L", "Suco abacaxi 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-ACEROLA-COPO", "Suco acerola copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-ACEROLA-1L", "Suco acerola 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-LARANJA-COPO", "Suco laranja copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-LARANJA-1L", "Suco laranja 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-MARACUJA-COPO", "Suco maracuja copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-MARACUJA-1L", "Suco maracuja 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-MORANGO-COPO", "Suco morango copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-MORANGO-1L", "Suco morango 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-LIMAO-COPO", "Suco limao copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-LIMAO-1L", "Suco limao 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-ABACAXI-HORTELA-COPO", "Suco abacaxi com hortela copo", "Suco natural", "copo", 800, 12, { minStock: 4 }),
  seed("SUCO-ABACAXI-HORTELA-1L", "Suco abacaxi com hortela 1 litro", "Suco natural", "jarra", 1400, 8, { minStock: 4 }),
  seed("SUCO-ACR-LEITE", "Acrescimo de leite", "Suco natural", "extra", 200, 0, { minStock: 4 }),
  seed("DOSE-SMIRNOFF", "Dose Vodka Smirnoff", "Doses", "dose", 1200, 20, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-ABSOLUT", "Dose Vodka Absolut", "Doses", "dose", 1800, 18, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-RED-LABEL", "Dose Whisky Red Label", "Doses", "dose", 1500, 18, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-CAVALO-BRANCO", "Dose Whisky Cavalo Branco", "Doses", "dose", 1300, 16, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-BLACK-LABEL", "Dose Whisky Black Label", "Doses", "dose", 2000, 16, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-JACK-DANIELS", "Dose Whisky Jack Daniels", "Doses", "dose", 2000, 16, { ageRestricted: true, minStock: 6 }),
  seed("DOSE-CAMPARI-LARANJA", "Campari com laranja", "Doses", "dose", 2000, 12, { ageRestricted: true, minStock: 4 }),
  seed("DOSE-GIN-TANQUERAY", "Dose Gin Tanqueray", "Doses", "dose", 2000, 14, { ageRestricted: true, minStock: 4 }),
  seed("DOSE-TEQUILA", "Dose Tequila", "Doses", "dose", 1800, 14, { ageRestricted: true, minStock: 4 }),
  seed("DOSE-LICOR-43", "Dose Licor 43", "Doses", "dose", 2500, 10, { ageRestricted: true, minStock: 4 }),
  seed("COMBO-SMIRNOFF", "Combo Vodka Smirnoff com 4 Red Bull", "Combos", "combo", 10000, 8, { ageRestricted: true, minStock: 3 }),
  seed("COMBO-ABSOLUT", "Combo Vodka Absolut com 4 Red Bull", "Combos", "combo", 21000, 6, { ageRestricted: true, minStock: 3 }),
  seed("COMBO-RED-LABEL", "Combo Whisky Red Label com 4 Red Bull", "Combos", "combo", 20000, 6, { ageRestricted: true, minStock: 3 }),
  seed("COMBO-BLACK-LABEL", "Combo Whisky Black Label com 4 Red Bull", "Combos", "combo", 28000, 5, { ageRestricted: true, minStock: 3 }),
  seed("COMBO-JACK-DANIELS", "Combo Whisky Jack Daniels com 4 Red Bull", "Combos", "combo", 25000, 5, { ageRestricted: true, minStock: 3 }),
  seed("COMBO-GIN-TANQUERAY", "Combo Gin Tanqueray com 4 suco de uva", "Combos", "combo", 20000, 6, { ageRestricted: true, minStock: 3 }),
  seed("CACHACA-SELETA", "Cachaca Seleta", "Cachacas", "dose", 1000, 12, { ageRestricted: true, minStock: 4 }),
  seed("CACHACA-PONTO-CHIQUE", "Cachaca Ponto Chique", "Cachacas", "dose", 800, 12, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-MORANGO", "Caipirinha de morango", "Drinks", "copo", 2500, 14, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-MARACUJA", "Caipirinha de maracuja", "Drinks", "copo", 2500, 14, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-LIMAO", "Caipirinha de limao", "Drinks", "copo", 2500, 14, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-KIWI", "Caipirinha de kiwi", "Drinks", "copo", 2500, 14, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-MORANGO-CREM", "Caipirinha de morango cremosa", "Drinks", "copo", 3500, 10, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-MARACUJA-CREM", "Caipirinha de maracuja cremosa", "Drinks", "copo", 3500, 10, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-LIMAO-CREM", "Caipirinha de limao cremosa", "Drinks", "copo", 3500, 10, { ageRestricted: true, minStock: 4 }),
  seed("DRINK-CAIPI-KIWI-CREM", "Caipirinha de kiwi cremosa", "Drinks", "copo", 3500, 0, { ageRestricted: true, minStock: 4 })
];

export const demoProductSeeds: readonly DemoCatalogSeed[] = [
  ...coreDemoProductSeeds,
  ...menuDemoProductSeeds
];
