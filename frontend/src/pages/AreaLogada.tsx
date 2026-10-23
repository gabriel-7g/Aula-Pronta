import { useEffect, useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { obterPerfil, sair } from '../services/auth';
import type { Usuario } from '../services/auth';
import './Auth.css';
import './AreaLogada.css';

export default function AreaLogada({ somenteAdmin = false }: { somenteAdmin?: boolean }) {
  const router = useIonRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState('');
  useEffect(() => {
    let ativo = true;
    obterPerfil().then(perfil => {
      if (!ativo) return;
      if (somenteAdmin && perfil.tipo !== 'admin') {
        router.push('/planejamentos', 'root', 'replace');
        return;
      }
      setUsuario(perfil);
    }).catch(() => {
      if (ativo) setErro('A sessão é inválida ou o servidor está indisponível.');
    });
    return () => { ativo = false; };
  }, [router, somenteAdmin]);

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-auth">
        <div className="pagina-auth">
          <main className="auth-container">
            <div className="auth-marca"><span className="auth-marca-simbolo" />Lousa</div>
            <section className="auth-card area-card">
              <span className="auth-fita" aria-hidden="true" />
              {erro ? <><h1>Não foi possível validar o acesso</h1><p role="alert">{erro}</p></> :
                usuario ? <>
                  <span className="auth-etiqueta">acesso autorizado!</span>
                  <h1>Olá, {usuario.nome}!</h1>
                  <p>Você entrou com uma conta do tipo <strong>{usuario.tipo}</strong>.</p>
                  <p>E-mail: <strong>{usuario.email}</strong></p>
                  <p className="area-aviso">Esta é apenas a tela de confirmação da apresentação. As demais funcionalidades do AulaPronta não estão incluídas nesta etapa.</p>
                </> : <p>Validando sua sessão com a API...</p>}
              <button className="auth-botao-principal" type="button" onClick={() => {
                sair(); router.push('/login', 'root', 'replace');
              }}>Sair / Voltar ao login</button>
            </section>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
