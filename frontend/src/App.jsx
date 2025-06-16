import { Route, Routes } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import User from './components/User'
import Movie from './components/Movie'
import Review from './components/Review'
import Playlist from './components/Playlist'
import Analytic from './components/Analytic'
import History from './components/History'

function App() {

  return (
    <>
      <Sidebar />
      <main className='w-full'>
        <Routes>
          <Route path='/' element={<User />} />
          <Route path='/movie' element={<Movie />} />
          <Route path='/playlist' element={<Playlist />} />
          <Route path='/review' element={<Review />} />
          <Route path='/analytic' element={<Analytic />} />
          <Route path='/history' element={<History />} />
        </Routes>
      </main>
    </>
  )
}

export default App
