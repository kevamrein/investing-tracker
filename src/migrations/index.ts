import * as migration_20250526_154737 from './20250526_154737';
import * as migration_20250529_115021_investor_on_investment from './20250529_115021_investor_on_investment';

export const migrations = [
  {
    up: migration_20250526_154737.up,
    down: migration_20250526_154737.down,
    name: '20250526_154737',
  },
  {
    up: migration_20250529_115021_investor_on_investment.up,
    down: migration_20250529_115021_investor_on_investment.down,
    name: '20250529_115021_investor_on_investment'
  },
];
