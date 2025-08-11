import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import './color.scss'
import NavBar from "./componets/navs/NavBar";
import FeedState from "./context/FeedState";
import Home from "./pages/HOme";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";

function App() {

  return (
    <>
      <FeedState >
      <BrowserRouter>

        <div>
          <NavBar />
        </div>

        <Routes>

          <Route path="/" element={<Home />} ></Route>
          <Route path="/signup" element={<SignUp />} ></Route>
          <Route path="/login" element={<Login />} ></Route>
          <Route path="/userprofile/:id" element={<UserProfile />} ></Route>
        </Routes>
      </BrowserRouter>
      </FeedState>
    </>
  )
}

export default App
