import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // ts-jest для обработки TypeScript
  testEnvironment: 'jsdom', // окружение для тестов (jsdom для React-компонентов)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // для дополнительной настройки (React Testing Library)
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy', // mock для css
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
};

export default config;