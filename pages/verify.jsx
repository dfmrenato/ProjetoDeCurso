import styles from "@/styles/pages/verify.module.css";
import Head from "next/head";
import Header from "@/components/Header";
import MainLayout from "@/layout/MainLayout";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import Popup from "reactjs-popup";

export default function Verify() {
  const [popupData, setPopupData] = useState(undefined);

  useEffect(() => {
    const email = sessionStorage.getItem('VerificacaoEmail');
    if (!email) {
      location.replace('./.');
    }
  }, []);

  /**
  * @param {FormDataEvent} e 
  */
  async function handleVerifyFormSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const formDataObject = Object.fromEntries(formData.entries());

      const email = sessionStorage.getItem('VerificacaoEmail');
      const codigo = formDataObject["codigo"];

      // Comunicação com o backend
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, codigo })
      });
      const result = await response.json();

      if (response.ok) {
        sessionStorage.setItem('UsuarioLogado', data.email);
        sessionStorage.setItem('UsuarioLogadoNome', data.nome);
        sessionStorage.setItem('UsuarioLogadoEmpresa', data.empresa);
        sessionStorage.removeItem('VerificacaoEmail');
        location.replace('./dashboard');
      } else {
        setPopupData(<>
          <h2>Erro ao efetuar cadastro</h2>
          <p>{result.errorMessage || 'Ocorreu um erro ao tentar efetuar cadastro. Tente novamente.'}</p>
        </>);
      }
    } catch (err) {
      console.error(err);
      setPopupData(<>
        <h2>Erro ao efetuar cadastro</h2>
        <p>{err.message || 'Ocorreu um erro ao tentar efetuar cadastro. Tente novamente.'}</p>
      </>);
    }
  };

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
        <div class={styles.verifyBox}>
          <p>Enviamos um código de verificação por email para {typeof window !== 'undefined' && sessionStorage?.getItem('VerificacaoEmail')}. Insira-o para verificar seu email e criar sua conta empresarial.</p>
          <form onSubmit={handleVerifyFormSubmit}>
              <input type="text" id="CodigoVerificacao" name="codigo" placeholder="******" class={styles.camp} />
              <Button type="submit" class={styles.button}>Verificar</Button>
          </form>
        </div>
        {popupData &&
          <Popup modal nested open={true} onClose={() => setPopupData(undefined)}>
            {close => { return popupData }}
          </Popup>
        }
      </MainLayout>
    </>
  );
}
