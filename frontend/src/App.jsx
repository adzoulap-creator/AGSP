import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Accueil from "./pages/accueil";
import ChoixAdministratif from "./pages/choixAdministratif";
import ChoixDemarche from "./pages/choixDemarche";
import ChoixCreneau from "./pages/creneau";
import Formulaire from "./pages/formulaire";
import Confirmation from "./pages/confirmation";
import AgentConnexion from "./pages/agentConnexion";
import TableauDeBord from "./pages/TableauDeBord";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element = {<Accueil/>} />
          <Route path="/administrations" element={<ChoixAdministratif/>} />
          <Route path="/administrations/:administrationId/demarches" element={<ChoixDemarche/>} />
          <Route path="/demarches/:demarcheId/creneau" element={<ChoixCreneau/>} />
          <Route path="/demarches/:demarcheId/creneau" element={<ChoixCreneau/>} />
          <Route path="/formulaire" element={<Formulaire/>} />
          <Route path="/confirmation" element={<Confirmation/>} />
          <Route path="/agent/connexion" element={<AgentConnexion/>} />
          <Route path="/agent/tableau-de-bord" element={<TableauDeBord/>} />
          

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
