import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname === 'undefined' ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(dirname, 'src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/fuel-savings-utils.ts',
        'src/lib/utils.ts',
        'src/hooks/use-current-role.ts',
        'src/hooks/use-current-user.ts',
        'src/components/ui/button.tsx',
        'src/components/ui/badge.tsx',
        'src/components/ui/spinner.tsx',
        'src/components/ui/error-state.tsx',
        'src/components/ui/card.tsx',
        'src/components/shared/kpi-card.tsx',
        'src/lib/api/bus-models.ts',
        'src/lib/api/energy.ts',
        'src/lib/api/fuel-savings.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test.ts,test.tsx}'],
          environment: 'jsdom',
          setupFiles: ['./src/setupTests.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
