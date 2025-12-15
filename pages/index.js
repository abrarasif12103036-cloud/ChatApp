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
    
    if ((username === validBoyUser && password === validBoyPass) || 
        (username === validGirlUser && password === validGirlPass)) {
      localStorage.setItem('currentUser', username);
      setLoading(true);
      setTimeout(() => router.push('/chat'), 500);
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>💬 Chat</h1>
        <p className={styles.subtitle}>FOR US</p>

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
