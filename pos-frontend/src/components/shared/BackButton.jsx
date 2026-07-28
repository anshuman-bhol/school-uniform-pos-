import { useNavigate } from "react-router-dom";
import { GiFastBackwardButton } from "react-icons/gi";
const BackButton = () => {
    const navigate=useNavigate();
  return (
    <button onClick={()=> navigate(-1)} className="bg-[#025cca] p-3 text-xl font-bold rounded-full text-white">
      <GiFastBackwardButton />
    </button>
  )
}

export default BackButton
