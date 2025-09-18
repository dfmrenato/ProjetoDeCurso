if(sessionStorage.getItem('VerificacaoEmail')) {
    document.getElementById('CaixaVerificarEmailTexto').innerHTML = `Enviamos um código de verificação por email para <strong>${sessionStorage.getItem('VerificacaoEmail')}</strong>. Insira-o para verificar seu email e criar sua conta empresarial.`;
} else {
    location.replace('./.');
};

document.getElementById('FormularioVerificarEmail').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = sessionStorage.getItem('VerificacaoEmail');
    const codigo = document.getElementById('FormularioVerificarEmail').elements["codigo"].value;

    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/verify-email-success', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, codigo })
        });

        const data = await response.json();
        
        if(data.errorMessage) return Notificar(`Erro de verificação`, `${data.errorMessage}`, 'OK');

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        // Código específico
        console.log('Usuário adicionado:', data);
        Notificar('Bem-vindo!', 'Usuário cadastrado com sucesso!', 'Prosseguir', () => {window.location.replace("./dashboard")});

        sessionStorage.setItem('UsuarioLogado', data.email);
        sessionStorage.setItem('UsuarioLogadoNome', data.nome);
        sessionStorage.setItem('UsuarioLogadoEmpresa', data.empresa);
        sessionStorage.removeItem('VerificacaoEmail');
        
    } catch (error) {
        console.error(error);
        Notificar('Erro ao realizar verificação', error, 'OK');
    }
})