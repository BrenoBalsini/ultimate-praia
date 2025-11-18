import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/toaster';
import { Provider } from './components/ui/provider';

function App() {
  return (
    <Provider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
