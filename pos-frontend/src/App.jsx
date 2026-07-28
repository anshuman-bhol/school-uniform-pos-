import { BrowserRouter as Router,Routes,Route, useLocation } from "react-router-dom"
import {Home, Auth, Orders, Tailors, Products} from "./pages"
import Header from "./components/shared/Header.jsx"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import useLoadData from "./hooks/useLoadData.js"
import FullScreenLoader from "./components/shared/FullScreenLoader.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import More from "./pages/More.jsx"
import UserApprovals from "./pages/UserApprovals.jsx"

function Layout(){
  const location = useLocation()
  const isLoading= useLoadData()
  const hideHeaderRoutes = ["/auth"]
  const { isAuth } = useSelector(state => state.user)

  if(isLoading) return <FullScreenLoader/>
  return (
    <div className="min-h-screen bg-[#252323]">
        {!hideHeaderRoutes.includes(location.pathname) && <Header />}
        <Routes>
          <Route path="/" element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
            } />
          <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth/>} />
          <Route path="/orders" element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          } />
          <Route path="/tailors" element={
            <ProtectedRoutes>
              <Tailors />
            </ProtectedRoutes>
          } />
          <Route path="/products" element={
            <ProtectedRoutes>
              <Products/>
            </ProtectedRoutes>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          } />
          <Route path="/more" element={
            <ProtectedRoutes>
              <More />
            </ProtectedRoutes>
          } />
          <Route path="/user-approvals" element={
            <ProtectedRoutes>
              <UserApprovals  />
            </ProtectedRoutes>
          } />
          <Route path="/8" element={<div>NotFound</div>} />
        </Routes>
    </div>
  )
}

function ProtectedRoutes({children}){
  const {isAuth} = useSelector (state =>state.user)
  if(!isAuth){
    return <Navigate to="/auth"/>
  }
  return children
}

function App() {
  return(
    <Router>
      <Layout/>
    </Router>
  )
}

export default App