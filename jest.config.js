module.exports = {
  preset: 'ts-jest', 
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.ts', // Busca archivos .test.ts dentro de tests/unit
  ],
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.serverless/'
  ],
};