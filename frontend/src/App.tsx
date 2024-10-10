import EditPage from "./pages/EditPage"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/edit' element={<EditPage />}>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
