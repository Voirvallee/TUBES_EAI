import { Route, Routes } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import User from './components/User'
import Movie from './components/Movie'
import Review from './components/Review'

function App() {

  return (
    <>
      <Sidebar />
      <main className='w-full'>
        <Routes>
          <Route path='/' element={<User />} />
          <Route path='/movie' element={<Movie />} />
          <Route path='/review' element={<Review />} />
        </Routes>
      </main>
    </>
  )
}

export default App
