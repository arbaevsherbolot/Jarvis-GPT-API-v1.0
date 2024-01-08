type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

type Languages = 'RU' | 'EN';

type RequestType = 'STREAM' | 'SINGLE';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  nationality?: string;
  email: string;
  username: string;
  phone?: string;
  photo?: string;
  location: Location[];
  messages: Message[];
  chats: Chat[];
  password: string;
  refreshToken?: string;
  resetPasswordSecret?: string;
  isActive: boolean;
  isVerified: boolean;
  lastVisit: string;
  createdAt: string;
  updatedAt: string;
};

type Requests = {
  userId: number;
  user: User;
  chatId: number;
  chat: Chat;
  type: RequestType;
  route: string;
  tries: number;
};

type Location = {
  id: number;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  user: User;
  userId: number;
};

type Message = {
  id: number;
  userId: number;
  user: User;
  text: string;
  ai?: boolean;
  chat: Chat;
  chatId: number;
  audioSource?: string;
  createdAt: string;
  updatedAt: string;
};

type Chat = {
  id: number;
  userId: number;
  user: User;
  title: string;
  messages: Message[];
  language: Languages;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};

type Image = {
  id: number;
  chatId: number;
  chat: Chat;
  url: string;
  text: string;
  output: string;
  audioSource?: string;
  createdAt: string;
};
