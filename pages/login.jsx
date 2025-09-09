import Button from "@/components/Button";
import Header from "@/components/Header";
import MainLayout from "@/layout/MainLayout";
import styles from "@/styles/pages/login.module.css";
import Head from "next/head";
import { useState } from "react";

const Options = {
  REGISTER: 1,
  LOGIN: 2
};

export default function Login() {
  const [selectedOption, setSelectedOption] = useState(Options.REGISTER);

  /**
   * @param {FormDataEvent} e 
   */
  async function handleLoginFormSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const response = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentData(result);
        setCurrentStep('payment');
        startPaymentPolling(result.paymentId);
      } else {
        setError(result.message || 'Erro ao processar compra');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
  * @param {FormDataEvent} e 
  */
  async function handleRegisterFormSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const response = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentData(result);
        setCurrentStep('payment');
        startPaymentPolling(result.paymentId);
      } else {
        setError(result.message || 'Erro ao processar compra');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
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

        <title>Entrada</title>
        <link rel="shortcut icon" href="img/Hermes.png" />
      </Head>
      <Header />
      <MainLayout id={styles.main}>
        <main>

          <div className={styles.selector}>
            <button id="RegistroOpcao" data-selected={selectedOption == Options.REGISTER} onClick={() => setSelectedOption(Options.REGISTER)}>cadastrar nova conta</button>
            <button id="LoginOpcao" data-selected={selectedOption == Options.LOGIN} onClick={() => setSelectedOption(Options.LOGIN)}>entrar em conta existente</button>
          </div>

          {selectedOption == Options.REGISTER ?
            <div className={styles.form}>
              <h1>Criar uma nova conta</h1>
              <form id="RegistroFormulario">
                <label htmlFor="NomeR">Nome</label>
                <input type="text" id="NomeR" name="nome" placeholder="Ovídio Antoninho Marques" required />

                <label htmlFor="EmpresaR">Empresa</label>
                <input type="text" id="EmpresaR" name="empresa" placeholder="Nome da empresa" required />

                <label htmlFor="EmailR">E-mail</label>
                <input type="email" id="EmailR" name="email" placeholder="fulano@email.com" required />

                <label htmlFor="SenhaR">Senha</label>
                <input type="password" id="SenhaR" name="senha" placeholder="****" required />

                <input type="hidden" name="tipo" value="empresarial" />

                <footer>
                  <Button hierarchy={3} type="reset">Limpar dados</Button>
                  <Button type="submit">Realizar cadastro</Button>
                </footer>
              </form>
            </div>
            :
            <div className={styles.form}>
              <h1>Entrar na sua conta</h1>
              <form id="LoginFormulario">
                <label htmlFor="EmailL">E-mail</label>
                <input type="email" id="EmailL" name="email" placeholder="fulano@email.com" required />

                <label htmlFor="SenhaL">Senha</label>
                <input type="password" id="SenhaL" name="senha" placeholder="****" required />

                <input type="hidden" name="tipo" value="login" />
                <footer>
                  <Button hierarchy={3}>Esqueci minha senha</Button>
                  <Button type="submit">Realizar cadastro</Button>
                </footer>
              </form>
            </div>
          }

        </main>
      </MainLayout>
    </>
  );
}
