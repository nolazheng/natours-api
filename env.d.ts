// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT: number;
    DATABASE: string;
    DATABASE_PASSWORD: string;
    // Add any other custom environment variables here
  }
}
