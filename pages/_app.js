import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-toward-extreme.css';
import "@/styles/tippy.css";
import '@/styles/nProgress.css';
import "@/styles/popups.css";

import { ThemeProvider } from 'next-themes';
import { Router } from "next/router";
import nProgress from 'nprogress';

// Configuração do nProgress
nProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
});

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeComplete", nProgress.done);
Router.events.on("routeChangeError", nProgress.done);

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme='LIGHT' themes={['LIGHT', 'DARK']}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}