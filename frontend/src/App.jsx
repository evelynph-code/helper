import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import CreateRequest from "./pages/CreateRequest";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Review from "./pages/Review";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";


function App() {
  return (
    <Routes>
      <Route path="/" element = {<Landing />} />
      <Route path="/login" element = {<Login />} />
      <Route path="/signup" element = {<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element = {<Dashboard />} />
      <Route path="/browse" element = {<Browse />} />
      <Route path="/create" element = {<CreateRequest />} />
      <Route path="/profile/:id" element = {<Profile />} />
      <Route path="/chat/:exchangeId" element = {<Chat />} />
      <Route path="/review/:exchangeId" element = {<Review />} />
    </Routes>
  )
}

export default App