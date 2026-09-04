import type { ImageSourcePropType } from 'react-native';

/** Bundled menu photos — works offline and when Railway uploads are missing. */
const BY_NAME: Record<string, ImageSourcePropType> = {
  // Hot drinks
  espresso: require('./espresso.jpg'),
  'café crème': require('./cafe-creme.jpg'),
  'cafe creme': require('./cafe-creme.jpg'),
  cortado: require('./cortado.jpg'),
  'flat white': require('./flat-white.jpg'),
  'spanish latte': require('./spanish-latte.jpg'),
  cappuccino: require('./cappuccino.jpg'),
  latte: require('./latte.jpg'),
  mochaccino: require('./mochaccino.jpg'),
  'caramel macchiato': require('./caramel-macchiato.jpg'),
  'chai latte': require('./chai-latte.jpg'),
  'latte macchiato': require('./latte-macchiato.jpg'),
  'hot chocolate': require('./hot-chocolate.jpg'),
  'hot chocolate mit sahne': require('./hot-chocolate-sahne.jpg'),
  'lavender latte': require('./lavender-latte.jpg'),
  'dirty chai': require('./dirty-chai.jpg'),

  // Cold
  'iced americano': require('./iced-americano.jpg'),
  'iced latte macchiato': require('./iced-latte-macchiato.jpg'),
  'iced spanish latte': require('./iced-spanish-latte.jpg'),
  'iced chai latte': require('./iced-chai-latte.jpg'),
  'iced lavender latte': require('./iced-lavender-latte.jpg'),
  'iced hazelnut latte': require('./iced-hazelnut-latte.jpg'),
  'iced coconut vanilla': require('./iced-coconut-vanilla.jpg'),
  'iced tea': require('./iced-tea.jpg'),
  juice: require('./juice.jpg'),
  mojito: require('./mojito.jpg'),
  'mango mojito': require('./mango-mojito.jpg'),
  'strawberry mojito': require('./strawberry-mojito.jpg'),
  'blue coconut mojito': require('./blue-coconut-mojito.jpg'),
  'mango strawberry mojito': require('./mango-strawberry-mojito.jpg'),
  americano: require('./americano.jpg'),
  'iced latte': require('./iced-latte.jpg'),
  'cold brew': require('./cold-brew.jpg'),

  // Tea
  'english breakfast': require('./english-breakfast.jpg'),
  'earl grey': require('./earl-grey.jpg'),
  'green tea': require('./green-tea.jpg'),

  // Matcha
  'matcha latte': require('./matcha-latte.jpg'),
  'iced matcha': require('./iced-matcha.jpg'),
  'cloudy matcha': require('./cloudy-matcha.jpg'),
  'iced cloudy matcha': require('./iced-cloudy-matcha.jpg'),
  'iced mango matcha': require('./mango-matcha.jpg'),
  'iced strawberry matcha': require('./strawberry-matcha.jpg'),
  'lavender matcha': require('./lavender-matcha.jpg'),
  'dirty matcha': require('./dirty-matcha.jpg'),

  // Frappes
  'caramel frappe': require('./caramel-frappe.jpg'),
  'strawberry frappe': require('./strawberry-frappe.jpg'),
  'vanilla frappe': require('./vanilla-frappe.jpg'),
  'cookies frappe': require('./cookies-frappe.jpg'),
  'kinder bueno frappe': require('./kinder-bueno-frappe.jpg'),
  'popcorn frappe': require('./popcorn-frappe.jpg'),
  'white choco frappe': require('./white-choco-frappe.jpg'),
  'mocha frappe': require('./mocha-frappe.jpg'),
  mocha: require('./mocha.jpg'),

  // Milkshakes
  'vanilla milkshake': require('./vanilla-milkshake.jpg'),
  'strawberry milkshake': require('./strawberry-milkshake.jpg'),
  'chocolate milkshake': require('./chocolate-milkshake.jpg'),
  'oreo milkshake': require('./oreo-milkshake.jpg'),
  'lotus milkshake': require('./lotus-milkshake.jpg'),
  'mango milkshake': require('./mango-milkshake.jpg'),

  // Protein — cold shake as default icon (per flavour)
  'protein oreo': require('./protein-oreo-cold.jpg'),
  'protein caramel': require('./protein-caramel-cold.jpg'),
  'protein biscoff': require('./protein-biscoff-cold.jpg'),
  'protein strawberry': require('./protein-strawberry-cold.jpg'),

  affogato: require('./affogato.jpg'),
};

type TempPair = { hot: ImageSourcePropType; cold: ImageSourcePropType };

const MATCHA_HOT_GENERIC = require('./matcha-latte.jpg');
const MATCHA_COLD_GENERIC = require('./iced-matcha.jpg');

/** Explicit hot/cold pairs by product id. */
const TEMPERATURE_BY_ID: Record<string, TempPair> = {
  'menu-matcha-latte': {
    hot: require('./matcha-latte.jpg'),
    cold: require('./iced-matcha.jpg'),
  },
  'menu-iced-matcha': {
    hot: require('./matcha-latte.jpg'),
    cold: require('./iced-matcha.jpg'),
  },
  'menu-cloudy-matcha': {
    hot: require('./cloudy-matcha.jpg'),
    cold: require('./iced-cloudy-matcha.jpg'),
  },
  'menu-iced-cloudy-matcha': {
    hot: require('./cloudy-matcha.jpg'),
    cold: require('./iced-cloudy-matcha.jpg'),
  },
  'menu-iced-mango-matcha': {
    hot: require('./mango-matcha-hot.jpg'),
    cold: require('./mango-matcha.jpg'),
  },
  'menu-iced-strawberry-matcha': {
    hot: require('./strawberry-matcha-hot.jpg'),
    cold: require('./strawberry-matcha.jpg'),
  },
  'menu-lavender-matcha': {
    hot: require('./lavender-matcha.jpg'),
    cold: require('./iced-matcha.jpg'),
  },
  'menu-dirty-matcha': {
    hot: require('./dirty-matcha.jpg'),
    cold: require('./iced-matcha.jpg'),
  },
  'menu-protein-oreo': {
    hot: require('./protein-oreo.jpg'),
    cold: require('./protein-oreo-cold.jpg'),
  },
  'menu-protein-caramel': {
    hot: require('./protein-caramel.jpg'),
    cold: require('./protein-caramel-cold.jpg'),
  },
  'menu-protein-biscoff': {
    hot: require('./protein-biscoff.jpg'),
    cold: require('./protein-biscoff-cold.jpg'),
  },
  'menu-protein-strawberry': {
    hot: require('./protein-strawberry.jpg'),
    cold: require('./protein-strawberry-cold.jpg'),
  },
};

/** Fallback by product name (admin-created / renamed products). */
const TEMPERATURE_BY_NAME: Record<string, TempPair> = {
  'matcha latte': TEMPERATURE_BY_ID['menu-matcha-latte'],
  'iced matcha': TEMPERATURE_BY_ID['menu-iced-matcha'],
  'cloudy matcha': TEMPERATURE_BY_ID['menu-cloudy-matcha'],
  'iced cloudy matcha': TEMPERATURE_BY_ID['menu-iced-cloudy-matcha'],
  'iced mango matcha': TEMPERATURE_BY_ID['menu-iced-mango-matcha'],
  'iced strawberry matcha': TEMPERATURE_BY_ID['menu-iced-strawberry-matcha'],
  'lavender matcha': TEMPERATURE_BY_ID['menu-lavender-matcha'],
  'dirty matcha': TEMPERATURE_BY_ID['menu-dirty-matcha'],
  'protein oreo': TEMPERATURE_BY_ID['menu-protein-oreo'],
  'protein caramel': TEMPERATURE_BY_ID['menu-protein-caramel'],
  'protein biscoff': TEMPERATURE_BY_ID['menu-protein-biscoff'],
  'protein strawberry': TEMPERATURE_BY_ID['menu-protein-strawberry'],
};

function resolveTempPair(
  productId: string,
  productName: string,
  categoryId: string | undefined,
): TempPair | undefined {
  const byId = TEMPERATURE_BY_ID[productId];
  if (byId) return byId;

  const byName = TEMPERATURE_BY_NAME[productName.trim().toLowerCase()];
  if (byName) return byName;

  if (categoryId === 'menu-cat-matcha') {
    return { hot: MATCHA_HOT_GENERIC, cold: MATCHA_COLD_GENERIC };
  }
  if (categoryId === 'menu-cat-protein') {
    return {
      hot: require('./protein-biscoff.jpg'),
      cold: require('./protein-biscoff-cold.jpg'),
    };
  }
  return undefined;
}

export function localProductImage(
  name?: string | null,
): ImageSourcePropType | undefined {
  if (!name) return undefined;
  return BY_NAME[name.trim().toLowerCase()];
}

export function productImageForTemperature(
  productId: string,
  productName: string,
  categoryId: string | undefined,
  temperature: 'Hot' | 'Cold' | undefined,
  remoteUrl?: string | null,
): ImageSourcePropType | { uri: string } | undefined {
  const local = localProductImage(productName);
  const pair = resolveTempPair(productId, productName, categoryId);

  if (temperature && pair) {
    return temperature === 'Cold' ? pair.cold : pair.hot;
  }

  // No temperature chosen yet — prefer cold for protein/matcha list icon if pair exists
  if (!temperature && pair && /protein|matcha|iced/i.test(productName)) {
    return /iced|protein/i.test(productName) ? pair.cold : pair.hot;
  }

  return local ?? (remoteUrl ? { uri: remoteUrl } : undefined);
}

/** Prefer bundled photo; fall back to API image URL. */
export function resolveProductImageSource(
  productName: string,
  imageUrl?: string | null,
  remoteUri?: string | null,
): ImageSourcePropType | { uri: string } | undefined {
  const local = localProductImage(productName);
  if (local) return local;
  if (remoteUri) return { uri: remoteUri };
  if (imageUrl?.startsWith('http')) return { uri: imageUrl };
  return undefined;
}

export function hasProductImage(product: {
  imageUrl?: string | null;
  name?: string | null;
}): boolean {
  return Boolean(
    localProductImage(product.name) ||
      (typeof product.imageUrl === 'string' && product.imageUrl.trim().length > 0),
  );
}
