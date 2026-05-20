import app from './src/app';
import dotenv from 'dotenv';

dotenv.config();

// Fail fast — do not start the server if critical env vars are missing
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DevPulse server running on port ${PORT}`);
});
