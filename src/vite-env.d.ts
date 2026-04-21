/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare const __BUILD_DATE__: string;
declare const __GIT_SHA__: string;
