import Dashboard from './Components/Dashboard/Dashboard';
import Home from './Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:roomId" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}
