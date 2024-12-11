import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Home;
