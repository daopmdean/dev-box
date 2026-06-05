import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Pure lib helpers need no DOM; node avoids jose/jsdom realm issues.
    environment: "node",
    globals: true,
  },
});
