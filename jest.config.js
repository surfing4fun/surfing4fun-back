module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },

  // ←–––– add this
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^prisma/(.*)$': '<rootDir>/../prisma/$1',
  },

  collectCoverage: true,
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
