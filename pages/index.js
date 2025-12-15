import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const validBoyUser = process.env.NEXT_PUBLIC_BOY_USER;
    const validBoyPass = process.env.NEXT_PUBLIC_BOY_PASS;
    const validGirlUser = process.env.NEXT_PUBLIC_GIRL_USER;
    const validGirlPass = process.env.NEXT_PUBLIC_GIRL_PASS;
    
    console.log('Login attempt:');
    console.log('Entered username:', username);
    console.log('Entered password:', password);
    console.log('Valid credentials - Boy:', validBoyUser, '/', validBoyPass);
    console.log('Valid credentials - Girl:', validGirlUser, '/', validGirlPass);
    console.log('Username match Abrar?', username === validBoyUser);
    console.log('Password match Abrarasif?', password === validBoyPass);
    console.log('Username match Mohona?', username === validGirlUser);
    console.log('Password match Mohona2024?', password === validGirlPass);
    
    if ((username === validBoyUser && password === validBoyPass) || 
        (username === validGirlUser && password === validGirlPass)) {
      console.log('✅ LOGIN SUCCESS! User:', username);
      localStorage.setItem('currentUser', username);
      setLoading(true);
      setTimeout(() => router.push('/chat'), 500);
    } else {
      console.log('❌ LOGIN FAILED! Invalid credentials');
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>MOHONA AND ABRAR</h1>
        <p className={styles.subtitle}>A SMALL GLIMPSE THAT DEPICTS HOW ABRAR LOVES MOHONA</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <p className={styles.demo}>Hope, you'd love this</p>
      </div>
    </div>
  );
}
