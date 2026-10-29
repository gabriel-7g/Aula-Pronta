import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import AreaLogada from './pages/AreaLogada';
import AdminUsuarios from './pages/AdminUsuarios';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import './theme/variables.css';

setupIonicReact();

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />}/>
          <Route path="/planejamentos" element={<AreaLogada />} />
          <Route path="/" element={<Login />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
