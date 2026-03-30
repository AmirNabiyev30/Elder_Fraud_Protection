import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { Routes, Route } from 'react-router-dom'
import "./App.css"

function App() {
  return (
    <Routes>
      <Route path ="/" element = {<Home/>}/>
      <Route path = "/login" element ={<LoginPage/>}/>
    </Routes>
  )
}

export default App
