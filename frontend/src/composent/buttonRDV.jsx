import {Link} from 'react-router-dom';

function PrendreRendezVous(){

    return(
        <div  className=" inline bg-green-400 pt-2 pb-2 pr-8 pl-8 rounded-xl border border-gray-500">
            <Link to={"/administrations"} className="font-bold text-yellow-700">Prendre rendez-vous</Link>
        </div>
    )
}

export default PrendreRendezVous ;