(
echo import { defineConfig } from "vite";
echo import react from "@vitejs/plugin-react";
echo export default defineConfig({
echo ^  plugins:[react()],
echo ^  server:{ host:true, port:5173, strictPort:true, hmr:{ clientPort:5173 } },
echo ^  preview:{ host:true, port:5173, strictPort:true }
echo });
) > C:\crm-gas\frontend\vite.config.ts

