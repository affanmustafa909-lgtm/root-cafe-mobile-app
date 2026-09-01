import { calcLineTotal, calcTax, formatPrice, roundMoney } from '../src/utils/pricing';
import {
  selectedOptionIds,
  toggleOption,
  validateSelections,
} from '../src/utils/customization';
import type { CustomizationGroup } from '../src/types';

describe('pricing', () => {
  it('calculates line total with options', () => {
    const total = calcLineTotal(
      5,
      [
        {
          groupId: 'g1',
          groupName: 'Size',
          optionId: 'o1',
          optionName: 'Large',
          additionalPrice: 1,
        },
        {
          groupId: 'g2',
          groupName: 'Milk',
          optionId: 'o2',
          optionName: 'Oat',
          additionalPrice: 0.5,
        },
      ],
      1,
    );
    expect(total).toBe(6.5);
  });

  it('formats EUR prices', () => {
    expect(formatPrice(7.3)).toContain('7');
  });

  it('calculates tax', () => {
    expect(calcTax(10, 0.19)).toBe(roundMoney(1.9));
  });
});

describe('customization', () => {
  const groups: CustomizationGroup[] = [
    {
      id: 'size',
      name: 'Size',
      required: true,
      selectionType: 'SINGLE',
      options: [
        { id: 'sm', name: 'Small', price: 0 },
        { id: 'lg', name: 'Large', price: 1 },
      ],
    },
  ];

  it('toggles single-select options', () => {
    const next = toggleOption(groups, {}, 'size', 'lg');
    expect(next.size).toEqual(['lg']);
  });

  it('validates required groups', () => {
    expect(validateSelections(groups, {})).toMatch(/required/i);
    expect(validateSelections(groups, { size: ['lg'] })).toBeNull();
  });

  it('collects selected option ids', () => {
    expect(selectedOptionIds({ size: ['lg'], milk: ['oat'] })).toEqual([
      'lg',
      'oat',
    ]);
  });
});
