import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Accueil from "./pages/accueil";
import ChoixAdministratif from "./pages/choixAdministratif";
import ChoixDemarche from "./pages/choixDemarche";
import ChoixCreneau from "./pages/creneau";

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

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
