import type {
  CartOption,
  CustomizationGroup,
  Product,
  SelectionType,
} from '../types';

export type SelectionMap = Record<string, string[]>;

export const PREFERRED_OPTION: Record<string, string> = {
  Temperature: 'Hot',
  Size: 'Medium',
  Milk: 'Cow Milk',
  Syrups: 'No Syrup',
};

export function defaultTemperatureForProduct(productName?: string | null): string {
  if (productName && /iced/i.test(productName)) return 'Cold';
  return 'Hot';
}

export function productGroups(product: Product): CustomizationGroup[] {
  return (product.customizationGroups ?? [])
    .map((link) => link.group)
    .filter((g): g is CustomizationGroup => Boolean(g && g.isActive !== false));
}

export function toggleOption(
  groups: CustomizationGroup[],
  selections: SelectionMap,
  groupId: string,
  optionId: string,
): SelectionMap {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return selections;
  const current = selections[groupId] ?? [];
  const selectionType: SelectionType = group.selectionType ?? 'SINGLE';

  if (selectionType === 'SINGLE') {
    return {
      ...selections,
      [groupId]: current.includes(optionId) ? [] : [optionId],
    };
  }

  if (current.includes(optionId)) {
    return {
      ...selections,
      [groupId]: current.filter((id) => id !== optionId),
    };
  }

  const max = group.maxSelections ?? Infinity;
  if (current.length >= max) return selections;
  return { ...selections, [groupId]: [...current, optionId] };
}

export function validateSelections(
  groups: CustomizationGroup[],
  selections: SelectionMap,
): string | null {
  for (const group of groups) {
    const count = (selections[group.id] ?? []).length;
    const required = group.required || group.isRequired;
    if (required && count === 0) return `${group.name} is required`;
    if ((group.selectionType ?? 'SINGLE') === 'SINGLE' && count > 1)
      return `${group.name} allows one selection`;
    if (group.maxSelections && count > group.maxSelections)
      return `${group.name} selection limit exceeded`;
  }
  return null;
}

export function selectedOptionIds(selections: SelectionMap): string[] {
  return Object.values(selections).flat();
}

export function ensureRequiredSelections(
  groups: CustomizationGroup[],
  selections: SelectionMap,
  context?: { productName?: string },
): SelectionMap {
  const next: SelectionMap = { ...selections };

  for (const group of groups) {
    const available = group.options.filter(
      (option) => option.isActive !== false && option.isAvailable !== false,
    );
    const availableIds = new Set(available.map((o) => o.id));
    const current = (next[group.id] ?? []).filter((id) => availableIds.has(id));
    if (current.length) {
      next[group.id] = current;
      continue;
    }

    let preferred = PREFERRED_OPTION[group.name];
    if (group.name === 'Temperature') {
      preferred = defaultTemperatureForProduct(context?.productName);
    }
    const pick =
      available.find((option) => option.name === preferred) ??
      (group.required || group.isRequired ? available[0] : undefined);
    if (pick) next[group.id] = [pick.id];
    else delete next[group.id];
  }

  return next;
}

export function cartOptionsFromSelections(
  groups: CustomizationGroup[],
  selections: SelectionMap,
): CartOption[] {
  return groups.flatMap((group) => {
    const ids = selections[group.id] ?? [];
    return group.options
      .filter((option) => ids.includes(option.id))
      .map((option) => ({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        additionalPrice: option.price ?? option.additionalPrice ?? 0,
      }));
  });
}

export function selectionsFromCartOptions(
  options: CartOption[],
): SelectionMap {
  const map: SelectionMap = {};
  for (const opt of options) {
    map[opt.groupId] = [...(map[opt.groupId] ?? []), opt.optionId];
  }
  return map;
}

/** Fill missing required customizations (Size/Sugar/Ice/…) for checkout. */
export function completeCartOptions(
  product: Product,
  selectedOptions: CartOption[],
): { options: CartOption[]; error: string | null } {
  const groups = productGroups(product);
  const selections = ensureRequiredSelections(
    groups,
    selectionsFromCartOptions(selectedOptions),
    { productName: product.name },
  );
  return {
    options: cartOptionsFromSelections(groups, selections),
    error: validateSelections(groups, selections),
  };
}
