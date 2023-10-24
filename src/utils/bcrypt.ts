import * as bcrypt from 'bcrypt';

export const hash = (password: string) => bcrypt.hash(password, 7);
export const compare = (password1: string, password2: string) =>
  bcrypt.compare(password1, password2);
