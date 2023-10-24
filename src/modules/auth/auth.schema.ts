export interface RegisterSchema {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginSchema {
  email: string;
  password: string;
}
