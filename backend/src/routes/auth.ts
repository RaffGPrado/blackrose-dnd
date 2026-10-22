import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Result, ResultAsync } from 'neverthrow';
import { authenticateToken } from '../middleware/auth.js';
import { authRepository } from '../infrastructure/database/SqliteAuthRepository.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from '../application/validators/authSchemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'black_rose_dnd_super_secret_jwt_key_2026';

router.post('/register', validateBody(registerSchema), async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as RegisterInput;

  const dbOpResult = Result.fromThrowable(
    () => authRepository.findByEmail(email),
    (e) => e
  )();

  if (dbOpResult.isErr()) {
    console.error('Registration error:', dbOpResult.error);
    res.status(500).json({ error: 'Internal server error during registration' });
    return;
  }

  if (dbOpResult.value) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hashResult = await ResultAsync.fromPromise(
    bcrypt.genSalt(10).then((salt) => bcrypt.hash(password, salt)),
    (e) => e
  );

  if (hashResult.isErr()) {
    console.error('Registration error:', hashResult.error);
    res.status(500).json({ error: 'Internal server error during registration' });
    return;
  }

  const insertResult = Result.fromThrowable(
    () => authRepository.createUser(name.trim(), email.toLowerCase().trim(), hashResult.value),
    (e) => e
  )();

  if (insertResult.isErr()) {
    console.error('Registration error:', insertResult.error);
    res.status(500).json({ error: 'Internal server error during registration' });
    return;
  }

  const userId = insertResult.value;
  const user = { id: userId, name: name.trim(), email: email.toLowerCase().trim() };
  
  const tokenResult = Result.fromThrowable(
    () => jwt.sign(user, JWT_SECRET, { expiresIn: '7d' }),
    (e) => e
  )();

  if (tokenResult.isErr()) {
    console.error('Registration error:', tokenResult.error);
    res.status(500).json({ error: 'Internal server error during registration' });
    return;
  }

  res.status(201).json({ message: 'User registered successfully', token: tokenResult.value, user });
});

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const userResult = Result.fromThrowable(
    () => authRepository.findByEmail(email),
    (e) => e
  )();

  if (userResult.isErr()) {
    console.error('Login error:', userResult.error);
    res.status(500).json({ error: 'Internal server error during login' });
    return;
  }

  const user = userResult.value;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const validPasswordResult = await ResultAsync.fromPromise(
    bcrypt.compare(password, user.password_hash),
    (e) => e
  );

  if (validPasswordResult.isErr()) {
    console.error('Login error:', validPasswordResult.error);
    res.status(500).json({ error: 'Internal server error during login' });
    return;
  }

  if (!validPasswordResult.value) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const payload = { id: user.id, name: user.name, email: user.email };
  
  const tokenResult = Result.fromThrowable(
    () => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }),
    (e) => e
  )();

  if (tokenResult.isErr()) {
    console.error('Login error:', tokenResult.error);
    res.status(500).json({ error: 'Internal server error during login' });
    return;
  }

  res.json({ message: 'Login successful', token: tokenResult.value, user: payload });
});

router.get('/me', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userResult = Result.fromThrowable(
    () => authRepository.findById(req.user!.id),
    (e) => e
  )();

  if (userResult.isErr()) {
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  if (!userResult.value) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: { id: userResult.value.id, name: userResult.value.name, email: userResult.value.email, created_at: userResult.value.created_at } });
});

export default router;
