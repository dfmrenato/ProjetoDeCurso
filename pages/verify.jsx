import styles from "@/styles/pages/index.module.css";
import Head from "next/head";
import Header from "@/components/Header";
import MainLayout from "@/layout/MainLayout";

export default function Verify() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        <meta name="description" content="Gerencie sua empresa de forma eletrônica, gratuita e eficiente com o Hermes." />
        <meta name="keywords" content="hermes, business, pro, projeto, curso, renato, ovidio" />
        <meta name="author" content="Renato Augusto" />

        <title>Hermes</title>
        <link rel="shortcut icon" href="img/Hermes.png" />
      </Head>
      <Header />
      <MainLayout id={styles.main}>
        <div class="CaixaVerificarEmail">
            <p id="CaixaVerificarEmailTexto">Enviamos um código de verificação por email para . Insira-o para verificar seu email e criar sua conta empresarial.</p>
            <form id="FormularioVerificarEmail">
                <label for="CodigoVerificacao">Código de verificação</label>
                <div>
                    <input type="text" id="CodigoVerificacao" name="codigo" placeholder="******" class="FormularioCampoPrimario" />
                    <button class="BotaoPrimario" type="submit"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </form>
        </div>
      </MainLayout>
    </>
  );
}
