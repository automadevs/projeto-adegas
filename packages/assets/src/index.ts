export const productAssetRoot = "packages/assets/products" as const;

export interface ProductAssetDerivative {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly file_size_bytes: number;
  readonly sha256: string;
}

export interface ProductImageManifestItem {
  readonly key: string;
  readonly file: string;
  readonly product_name: string;
  readonly brand: string;
  readonly variant: string;
  readonly volume: string;
  readonly category: string;
  readonly alt: string;
  readonly source_url: string;
  readonly source_domain: string;
  readonly source_type: string;
  readonly source_image_url?: string;
  readonly source_width?: number;
  readonly source_height?: number;
  readonly downloaded_at: string;
  readonly license_or_usage_note: string;
  readonly verification_note?: string;
  readonly usage_scope?: string;
  readonly width: number;
  readonly height: number;
  readonly mime_type: string;
  readonly file_size_bytes: number;
  readonly sha256: string;
  readonly status: "verified" | "provisional" | "generic" | "needs_review" | "replaced";
  readonly derivatives: readonly ProductAssetDerivative[];
}

export interface ProductImageViewAsset {
  readonly url: string;
  readonly altText: string;
  readonly width: number;
  readonly height: number;
  readonly status: string;
}

export const productImages = [
  {
    "key": "crystal-water-bottle-500ml",
    "file": "/products/water/crystal-water-bottle-500ml.png",
    "product_name": "\u00c1gua Mineral Crystal",
    "brand": "Crystal",
    "variant": "Garrafa PET sem g\u00e1s",
    "volume": "500 ml",
    "category": "water",
    "alt": "Garrafa de \u00c1gua Mineral Crystal sem g\u00e1s 500 ml",
    "source_url": "https://andina.nasuacasa.coca-cola.com.br/crystal-pet-500ml-sem-gas/p",
    "source_domain": "andina.nasuacasa.coca-cola.com.br",
    "source_type": "official_distributor_catalog",
    "source_image_url": "https://andinacocacola.vtexassets.com/arquivos/ids/159316-800-800/Crystal-Sem-Gas-500ml.jpg?v=639155253220700000",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:12:54.4489025Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 800x800 validada no catalogo Coca-Cola Andina.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 85693,
    "sha256": "aacc01055938e87a7b6446eec784d7bb714788c88ef1eff5ad79fbd9aac52b66",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/water/crystal-water-bottle-500ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2248,
        "sha256": "36eea217d77765d833cfd077b859051d20ebe813eb5c68323fa31f72cc23b1b9"
      },
      {
        "file": "/products/water/crystal-water-bottle-500ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 7172,
        "sha256": "85d296508174fb86af3e932ac6d161991c1511a630f01e05b527aa9af77d9d69"
      },
      {
        "file": "/products/water/crystal-water-bottle-500ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 24110,
        "sha256": "e2dd66ecd74e88af5f9206d2860387cff87773682b221b183b811b71406bc3e2"
      },
      {
        "file": "/products/water/crystal-water-bottle-500ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 85693,
        "sha256": "aacc01055938e87a7b6446eec784d7bb714788c88ef1eff5ad79fbd9aac52b66"
      }
    ]
  },
  {
    "key": "antarctica-subzero-can-350ml",
    "file": "/products/beers/antarctica-subzero-can-350ml.png",
    "product_name": "Cerveja Antarctica Subzero",
    "brand": "Antarctica",
    "variant": "Lata Std",
    "volume": "350 ml",
    "category": "beers",
    "alt": "Lata de Cerveja Antarctica Subzero 350 ml",
    "source_url": "https://www.choppbrahmaexpress.com.br/cerveja-antarctica-subzero-lata-std-350ml/p",
    "source_domain": "choppbrahmaexpress.com.br",
    "source_type": "authorized_supplier_catalog",
    "source_image_url": "https://choppbrahmaexpress.vtexassets.com/arquivos/ids/158117-800-800?aspect=true&height=800&v=638421299937300000&width=800",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:12:57.4865858Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 800x800 validada no catalogo Chopp Brahma Express.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 298854,
    "sha256": "18532870d249ad1da5a2f88da2af41437c099f5acf9e8e6478f511b30cef8997",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/beers/antarctica-subzero-can-350ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 6020,
        "sha256": "870c0a4b7c19d4c66cffd5df406425ad27295340813a173050fbdef56aff3e4b"
      },
      {
        "file": "/products/beers/antarctica-subzero-can-350ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 22289,
        "sha256": "acb4069249cebdee76a8c184a37d08254eb86989608f926a3b07152e0d436cfe"
      },
      {
        "file": "/products/beers/antarctica-subzero-can-350ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 81552,
        "sha256": "b472dc8b86df2284d8c0e450cdc52d299d2e6247c1f4e8ba162122cc03133bda"
      },
      {
        "file": "/products/beers/antarctica-subzero-can-350ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 298854,
        "sha256": "18532870d249ad1da5a2f88da2af41437c099f5acf9e8e6478f511b30cef8997"
      }
    ]
  },
  {
    "key": "brahma-can-350ml",
    "file": "/products/beers/brahma-can-350ml.png",
    "product_name": "Cerveja Brahma Chopp Pilsen",
    "brand": "Brahma",
    "variant": "Lata Std",
    "volume": "350 ml",
    "category": "beers",
    "alt": "Lata de Cerveja Brahma Chopp Pilsen 350 ml",
    "source_url": "https://www.choppbrahmaexpress.com.br/cerveja-brahma-lata-350ml/p",
    "source_domain": "choppbrahmaexpress.com.br",
    "source_type": "authorized_supplier_catalog",
    "source_image_url": "https://choppbrahmaexpress.vteximg.com.br/arquivos/ids/155702-800-800/brahma-lata-350ml.jpg?v=637353454674430000",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:12:59.3827685Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 800x800 validada via API publica do produto no Chopp Brahma Express.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 245237,
    "sha256": "dace7d09d9bc37628a949742acb9bb15f355520cc73c128c9c37aecf693c4388",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/beers/brahma-can-350ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 4578,
        "sha256": "8d1940cf14d3f713e8b7ffb79dd1c64b92581589cf188f3c063785e62a815477"
      },
      {
        "file": "/products/beers/brahma-can-350ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 16884,
        "sha256": "c3deb50dba407b10babb95e9ac04e1cfb15d18e34541fb3d8e6c55039a163bef"
      },
      {
        "file": "/products/beers/brahma-can-350ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 63129,
        "sha256": "0102c6c46c631d9fb5a32162843938914f5e279513dc561404b376bb32e0c59a"
      },
      {
        "file": "/products/beers/brahma-can-350ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 245237,
        "sha256": "dace7d09d9bc37628a949742acb9bb15f355520cc73c128c9c37aecf693c4388"
      }
    ]
  },
  {
    "key": "heineken-long-neck-330ml",
    "file": "/products/beers/heineken-long-neck-330ml.png",
    "product_name": "Cerveja Heineken Original",
    "brand": "Heineken",
    "variant": "Long neck",
    "volume": "330 ml",
    "category": "beers",
    "alt": "Garrafa long neck de Cerveja Heineken Original 330 ml",
    "source_url": "https://www.supernosso.com/178415-cerveja-heineken-garrafa-330ml/p",
    "source_domain": "supernosso.com",
    "source_type": "retailer_catalog",
    "source_image_url": "https://supernossoio.vteximg.com.br/arquivos/ids/495036/178415_0.png?v=638776433676530000",
    "source_width": 1000,
    "source_height": 1000,
    "downloaded_at": "2026-07-01T02:13:00.9434330Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fabricante oficial bloqueou/expirou asset direto; fonte exata 1000x1000 usada de retailer.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 131952,
    "sha256": "0d3157f87c7cba633af34a8689b38deb37b8c8fdae5649d6c5b65b794f752909",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/beers/heineken-long-neck-330ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2656,
        "sha256": "ef17350fb77d9eeb35a10f71da47117a17926c1dfa4b6bbf886e7c8ac51f3243"
      },
      {
        "file": "/products/beers/heineken-long-neck-330ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 9602,
        "sha256": "afd4ca31d4d0c0a7238b942e72a823eb14fa51a69e103c6703b2a96e85ffc226"
      },
      {
        "file": "/products/beers/heineken-long-neck-330ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 34824,
        "sha256": "a9c8a57aa27f0a6763b4e527992425b862234525d4298e5467c261a07247bc41"
      },
      {
        "file": "/products/beers/heineken-long-neck-330ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 131952,
        "sha256": "0d3157f87c7cba633af34a8689b38deb37b8c8fdae5649d6c5b65b794f752909"
      }
    ]
  },
  {
    "key": "skol-pilsen-can-350ml",
    "file": "/products/beers/skol-pilsen-can-350ml.png",
    "product_name": "Cerveja Skol Pilsen",
    "brand": "Skol",
    "variant": "Lata Std",
    "volume": "350 ml",
    "category": "beers",
    "alt": "Lata de Cerveja Skol Pilsen 350 ml",
    "source_url": "https://www.choppbrahmaexpress.com.br/cerveja-skol-lata-350ml/p",
    "source_domain": "choppbrahmaexpress.com.br",
    "source_type": "authorized_supplier_catalog",
    "source_image_url": "https://choppbrahmaexpress.vtexassets.com/arquivos/ids/157312-800-800?aspect=true&height=800&v=638842261015830000&width=800",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:13:01.9458658Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 800x800 validada no catalogo Chopp Brahma Express.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 132881,
    "sha256": "7516a0dcf943f82a01ae492ac11b5e98fda2e971f3ec9a1b81df3c94a29ccd95",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/beers/skol-pilsen-can-350ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2733,
        "sha256": "d2ee5a92a5fd4bc2df824ab8fe2d40d9a8f6e527f6fae06e375243e4fda19111"
      },
      {
        "file": "/products/beers/skol-pilsen-can-350ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 9727,
        "sha256": "905bd221f9fe5046cb83dfd0e24f39c54ba177a4e4a1104f7b41c6a3dfc28441"
      },
      {
        "file": "/products/beers/skol-pilsen-can-350ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 35170,
        "sha256": "2957a714635aeee9b7c001c286a441e39090a29047218c0063c4db83fab465e9"
      },
      {
        "file": "/products/beers/skol-pilsen-can-350ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 132881,
        "sha256": "7516a0dcf943f82a01ae492ac11b5e98fda2e971f3ec9a1b81df3c94a29ccd95"
      }
    ]
  },
  {
    "key": "coca-cola-original-bottle-2l",
    "file": "/products/soft-drinks/coca-cola-original-bottle-2l.png",
    "product_name": "Coca-Cola Original",
    "brand": "Coca-Cola",
    "variant": "Garrafa PET",
    "volume": "2 L",
    "category": "soft-drinks",
    "alt": "Garrafa PET de Coca-Cola Original 2 L",
    "source_url": "https://andina.nasuacasa.coca-cola.com.br/coca-cola-original-pet-2l-110440-coca-pai/p",
    "source_domain": "andina.nasuacasa.coca-cola.com.br",
    "source_type": "official_distributor_catalog",
    "source_image_url": "https://andinacocacola.vtexassets.com/arquivos/ids/158758-800-800/Coca-Cola-Original-_110440.jpg?v=639156020671730000",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:13:04.3388880Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 800x800 validada no catalogo Coca-Cola Andina.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 112804,
    "sha256": "f7eb09e6e85532ce287a8df0b2c1d20fbca1336d7b035e0fc910049bedc45501",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/soft-drinks/coca-cola-original-bottle-2l-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2488,
        "sha256": "5959bc9143915c5d663177a0bbad51bbf00326428fc0a12d1d188f7828c529a4"
      },
      {
        "file": "/products/soft-drinks/coca-cola-original-bottle-2l-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 8608,
        "sha256": "e16b0a2853281767fa9ceacff34c32375579d6c6f5e9612b5db95840d295f197"
      },
      {
        "file": "/products/soft-drinks/coca-cola-original-bottle-2l-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 30940,
        "sha256": "8a76530b0535062382ec986bd33ad3758b76ee5f0e815040b7f3261f736ac439"
      },
      {
        "file": "/products/soft-drinks/coca-cola-original-bottle-2l-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 112804,
        "sha256": "f7eb09e6e85532ce287a8df0b2c1d20fbca1336d7b035e0fc910049bedc45501"
      }
    ]
  },
  {
    "key": "red-bull-energy-drink-can-250ml",
    "file": "/products/energy-drinks/red-bull-energy-drink-can-250ml.png",
    "product_name": "Red Bull Energy Drink",
    "brand": "Red Bull",
    "variant": "Lata",
    "volume": "250 ml",
    "category": "energy-drinks",
    "alt": "Lata de Red Bull Energy Drink 250 ml",
    "source_url": "https://www.choppbrahmaexpress.com.br/red-bull-lata-250ml/p",
    "source_domain": "choppbrahmaexpress.com.br",
    "source_type": "authorized_supplier_catalog",
    "source_image_url": "https://choppbrahmaexpress.vteximg.com.br/arquivos/ids/158571-800-800/250%20ml.png?v=638878346501700000",
    "source_width": 800,
    "source_height": 800,
    "downloaded_at": "2026-07-01T02:13:05.8812848Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fabricante oficial bloqueou download direto; fonte exata 800x800 usada de fornecedor.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 166234,
    "sha256": "8521091cc2a6a71615b681bb9b56411243db8b09e08225af333f75893e46f88d",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/energy-drinks/red-bull-energy-drink-can-250ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 4169,
        "sha256": "fd33cd90c9fdf0e0933146ea696a432fba1025bdfde69382775ff23f1e3aa65e"
      },
      {
        "file": "/products/energy-drinks/red-bull-energy-drink-can-250ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 14515,
        "sha256": "c99c73164c1e558014badf5150c4a996aa1e2a59358462871b2897c5b87eed53"
      },
      {
        "file": "/products/energy-drinks/red-bull-energy-drink-can-250ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 50072,
        "sha256": "ccd6b60dc184a40480b7f1c64b490f14715554e2b9cd4bf57506b9d7e8446b51"
      },
      {
        "file": "/products/energy-drinks/red-bull-energy-drink-can-250ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 166234,
        "sha256": "8521091cc2a6a71615b681bb9b56411243db8b09e08225af333f75893e46f88d"
      }
    ]
  },
  {
    "key": "tnt-energy-drink-can-269ml",
    "file": "/products/energy-drinks/tnt-energy-drink-can-269ml.png",
    "product_name": "TNT Energy Drink Original",
    "brand": "TNT",
    "variant": "Lata",
    "volume": "269 ml",
    "category": "energy-drinks",
    "alt": "Lata de TNT Energy Drink Original 269 ml",
    "source_url": "https://www.supernosso.com/137326-energetico-original-tnt-lata-269ml/p",
    "source_domain": "supernosso.com",
    "source_type": "retailer_catalog",
    "source_image_url": "https://supernossoio.vteximg.com.br/arquivos/ids/1527111/137326_0.png?v=638924354457000000",
    "source_width": 430,
    "source_height": 1000,
    "downloaded_at": "2026-07-01T02:13:08.6606402Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte exata 430x1000; site oficial tinha asset 125x272, abaixo da qualidade desta fonte.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 215915,
    "sha256": "5c333d5c15bc0239db483349f6899ceec3181393eaa7c205411ff6c814608e9b",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/energy-drinks/tnt-energy-drink-can-269ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 4689,
        "sha256": "2d3132713fa19d3886dfc060c9d22f7975898c66a4400f12ad375a8ac25b1cf1"
      },
      {
        "file": "/products/energy-drinks/tnt-energy-drink-can-269ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 17177,
        "sha256": "f6c0a5d5019f20ade25571dda8ae2b987902106eded1ad504119073a11ac33da"
      },
      {
        "file": "/products/energy-drinks/tnt-energy-drink-can-269ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 60445,
        "sha256": "c629ad189dd847af89e9b1cdd7bd0f7127b0aa1b02a59d135eea37e2573df67e"
      },
      {
        "file": "/products/energy-drinks/tnt-energy-drink-can-269ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 215915,
        "sha256": "5c333d5c15bc0239db483349f6899ceec3181393eaa7c205411ff6c814608e9b"
      }
    ]
  },
  {
    "key": "smirnoff-vodka-bottle-998ml",
    "file": "/products/spirits/smirnoff-vodka-bottle-998ml.png",
    "product_name": "Vodka Smirnoff",
    "brand": "Smirnoff",
    "variant": "Garrafa",
    "volume": "998 ml",
    "category": "spirits",
    "alt": "Garrafa de Vodka Smirnoff 998 ml",
    "source_url": "https://br.thebar.com/vodka-smirnoff--998ml-gre30286/p",
    "source_domain": "br.thebar.com",
    "source_type": "official_brand_store",
    "source_image_url": "https://diageo.vteximg.com.br/arquivos/ids/166073/733098-vodka-smirnoff-998ml-1.jpg?v=639173239252330000",
    "source_width": 1000,
    "source_height": 1000,
    "downloaded_at": "2026-07-01T02:13:11.0670666Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 1000x1000 validada na loja oficial Diageo/The Bar.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 79813,
    "sha256": "3abded5b9c019507c825113c5ef4c471df5dad559a36697b6f4adb6597f7dbcd",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/spirits/smirnoff-vodka-bottle-998ml-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2264,
        "sha256": "fbbc7a9e4dde4bf1f883175077293b0a39df6e8ea80446967e8b103de0a8828f"
      },
      {
        "file": "/products/spirits/smirnoff-vodka-bottle-998ml-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 6932,
        "sha256": "dc2350a7cd0824cdce233252fae6f6780c25015098dd1fb82cdb287f80a13d34"
      },
      {
        "file": "/products/spirits/smirnoff-vodka-bottle-998ml-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 22925,
        "sha256": "51283d8a13aa694b5f4a6cc2c07a6b9ffe1c192b66e11b228712bb73bba033dc"
      },
      {
        "file": "/products/spirits/smirnoff-vodka-bottle-998ml-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 79813,
        "sha256": "3abded5b9c019507c825113c5ef4c471df5dad559a36697b6f4adb6597f7dbcd"
      }
    ]
  },
  {
    "key": "johnnie-walker-red-label-bottle-1l",
    "file": "/products/spirits/johnnie-walker-red-label-bottle-1l.png",
    "product_name": "Whisky Johnnie Walker Red Label",
    "brand": "Johnnie Walker",
    "variant": "Garrafa Red Label",
    "volume": "1 L",
    "category": "spirits",
    "alt": "Garrafa de Whisky Johnnie Walker Red Label 1 L",
    "source_url": "https://br.thebar.com/whisky-johnnie-walker-red-label--1l-gre30265/p",
    "source_domain": "br.thebar.com",
    "source_type": "official_brand_store",
    "source_image_url": "https://diageo.vteximg.com.br/arquivos/ids/163958/752555-whisky-johnnie-walker-redlabel1L_1.jpg?v=638328152939970000",
    "source_width": 1000,
    "source_height": 1000,
    "downloaded_at": "2026-07-01T02:13:12.4161064Z",
    "license_or_usage_note": "Imagem obtida de fabricante, loja oficial da marca ou fornecedor/catalogo autorizado para identificacao interna de produto; revisar licenca antes de uso publico/marketing.",
    "verification_note": "Fonte 1000x1000 validada na loja oficial Diageo/The Bar.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 94279,
    "sha256": "82634cadbecb0a7606baaa035a23993bff1c548c3c63e87973aec1dea80da8eb",
    "status": "verified",
    "derivatives": [
      {
        "file": "/products/spirits/johnnie-walker-red-label-bottle-1l-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 2309,
        "sha256": "987f15afa628657fc745028f83fece5e64f5f7ca0168d073c37c1e7e70d4cf68"
      },
      {
        "file": "/products/spirits/johnnie-walker-red-label-bottle-1l-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 7733,
        "sha256": "b6fac3bdeea420b0356576a6ee3e56b5dcd8a4f8be1f3d907478a09f638d9b36"
      },
      {
        "file": "/products/spirits/johnnie-walker-red-label-bottle-1l-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 26696,
        "sha256": "b6dff1e0e5bc0d4cfafb6ddc8ff5bd35773ff7c4fea9e8f0f3609abc82273cbb"
      },
      {
        "file": "/products/spirits/johnnie-walker-red-label-bottle-1l-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 94279,
        "sha256": "82634cadbecb0a7606baaa035a23993bff1c548c3c63e87973aec1dea80da8eb"
      }
    ]
  },
  {
    "key": "product-placeholder",
    "file": "/products/placeholders/product-placeholder.png",
    "product_name": "Produto sem imagem",
    "brand": "AdegaOS",
    "variant": "Placeholder",
    "volume": "N/A",
    "category": "placeholders",
    "alt": "Imagem generica de produto AdegaOS",
    "source_url": "internal://adegaos/products/placeholders/product-placeholder",
    "source_domain": "internal",
    "source_type": "internal_generated",
    "downloaded_at": "2026-06-27T00:00:00.000Z",
    "license_or_usage_note": "Placeholder interno mantido somente como guarda t?cnica contra falha de arquivo em produtos sem imagem validada; os produtos pr?-cadastrados do demo usam imagens reais verificadas.",
    "width": 512,
    "height": 512,
    "mime_type": "image/png",
    "file_size_bytes": 8628,
    "sha256": "c2cfec5064f0e61c02e105a421d29fa495bf2efb65ad823af70981f8c3f3cdeb",
    "status": "generic",
    "derivatives": [
      {
        "file": "/products/placeholders/product-placeholder-64.png",
        "width": 64,
        "height": 64,
        "file_size_bytes": 863,
        "sha256": "52dd13cab43bc56d44a23ab61caf8214dcb6ac546a644e99f69936c9e13b7f6c"
      },
      {
        "file": "/products/placeholders/product-placeholder-128.png",
        "width": 128,
        "height": 128,
        "file_size_bytes": 1663,
        "sha256": "045024a713e05c8ea27b110662b6f41f15af1c94c2ca94e77377a60e81828daf"
      },
      {
        "file": "/products/placeholders/product-placeholder-256.png",
        "width": 256,
        "height": 256,
        "file_size_bytes": 3272,
        "sha256": "c3ddb6e25bc4944f25ac052ae66e6d09373f87604f450f6e390aa195dd3f940f"
      },
      {
        "file": "/products/placeholders/product-placeholder-512.png",
        "width": 512,
        "height": 512,
        "file_size_bytes": 8628,
        "sha256": "c2cfec5064f0e61c02e105a421d29fa495bf2efb65ad823af70981f8c3f3cdeb"
      }
    ],
    "usage_scope": "technical_error_fallback_only_not_associated_to_demo_products"
  }
] as const satisfies readonly ProductImageManifestItem[];

export const productImageKeysBySku = {
  SKOL350: "skol-pilsen-can-350ml",
  BRA350: "brahma-can-350ml",
  JWRED1L: "johnnie-walker-red-label-bottle-1l",
  REDBULL250: "red-bull-energy-drink-can-250ml",
  CRYSTAL500: "crystal-water-bottle-500ml",
  HEINEKEN330: "heineken-long-neck-330ml",
  ANT350: "antarctica-subzero-can-350ml",
  COCA2L: "coca-cola-original-bottle-2l",
  SMIRNOFF998: "smirnoff-vodka-bottle-998ml",
  TNT269: "tnt-energy-drink-can-269ml"
} as const;

export type DemoProductSku = keyof typeof productImageKeysBySku;

export const productImageManifestPath = "packages/assets/products/product-images.json" as const;

export const productPlaceholder = productImages.find((item) => item.key === "product-placeholder")!;

export function findProductImage(key: string): ProductImageManifestItem | undefined {
  const image = productImages.find((item) => item.key === key);
  if (!image || image.status !== "verified") {
    return undefined;
  }

  return image;
}

export function productImageViewByKey(key: string, preferredSize = 128): ProductImageViewAsset | null {
  const item = findProductImage(key);
  if (!item) {
    return null;
  }

  const derivative = item.derivatives.find((entry) => entry.width === preferredSize) ?? item.derivatives.at(-1);
  return {
    url: derivative?.file ?? item.file,
    altText: item.alt,
    width: derivative?.width ?? item.width,
    height: derivative?.height ?? item.height,
    status: item.status
  };
}
