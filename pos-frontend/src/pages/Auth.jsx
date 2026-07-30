import { useState } from "react"
import sec from '../assets/images/authenticate.jpg'
import logo from '../assets/images/loginlogo.png'
import Register from '../components/auth/Register'
import Login from '../components/auth/Login'
import OtpLogin from "../components/auth/OtpLogin";
const Auth = () => {

  const [isRegister, setIsRegister] = useState(false);
  const [loginMode, setLoginMode] = useState("password");

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden">
      <div className="hidden lg:block relative lg:w-1/2 h-full">
        <img className='w-full h-full object-cover brightness-50' src={sec} alt="authenticate" />
        <blockquote className='absolute bottom-10 px-8 mb-10 text-white font-medium text-2xl italic'>
          "Simplifying Business, One Solution at a Time."
          <br />
          <span className='block mt-4 text-yellow-400'>Founder of Clothing</span>
        </blockquote>
      </div>
      <div className='w-full lg:w-1/2 h-full bg-[#1a1a1a] px-6 sm:px-8 lg:px-12 py-8 overflow-y-auto'>
        <div className='flex flex-col items-center gap-2 pb-3'>
          <img src={logo} alt="Restro Logo" className='w-104 border-2 rounded-lg p-2' />
        </div>
        <h2 className='text-4xl text-center mt-2 font-semibold text-yellow-400 mb-4'>
          Employee {isRegister ? " Registration" : " Login"}
        </h2>

        {
          isRegister ? (
          <Register setIsRegister={setIsRegister} />
          ) : loginMode === "password" ? (
            <Login setLoginMode={setLoginMode} />
          ) : (
            <OtpLogin setLoginMode={setLoginMode} />
          )
        }

        <div className='flex justify-center mt-6'>
          <p className='text-sm text-[#ababab] font-light'>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <a onClick={() => setIsRegister(!isRegister)} className='text-yellow-400 font-semibold hover:underline pl-2' href="#">
              {isRegister ? " Sign In" : " Sign Up"}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
