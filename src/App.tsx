import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;