// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT: number;
    DATABASE: string;
    DATABASE_PASSWORD: string;
    JWT_SECRET: jwt.Secret;
    JWT_EXPIRES_IN: jwt.ExpirationFormat;
    JWT_COOKIE_EXPIRES_IN: jwt.ExpirationFormat;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
    // Add any other custom environment variables here
  }
}
