export interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin?: boolean;
}

const users: { [key: string]: { password: string; user: User } } = {
  'ivan@pardon.rs': {
    password: 'password123',
    user: {
      id: '1',
      email: 'ivan@pardon.rs',
      fullName: 'Ivan',
      isAdmin: true
    }
  },
  'andrej@pardon.rs': {
    password: 'password123',
    user: {
      id: '2',
      email: 'andrej@pardon.rs',
      fullName: 'Andrej'
    }
  },
  'gara@pardon.rs': {
    password: 'password123',
    user: {
      id: '3',
      email: 'gara@pardon.rs',
      fullName: 'Gara'
    }
  },
  'milan@pardon.rs': {
    password: 'password123',
    user: {
      id: '4',
      email: 'milan@pardon.rs',
      fullName: 'Milan'
    }
  },
  'miladin@pardon.rs': {
    password: 'password123',
    user: {
      id: '5',
      email: 'miladin@pardon.rs',
      fullName: 'Miladin'
    }
  },
  'albert@pardon.rs': {
    password: 'password123',
    user: {
      id: '6',
      email: 'albert@pardon.rs',
      fullName: 'Albert'
    }
  }
};

export const authenticate = (email: string, password: string): User | null => {
  const userRecord = users[email];
  if (userRecord && userRecord.password === password) {
    return userRecord.user;
  }
  return null;
};

export const getAllUsers = (): User[] => {
  return Object.values(users).map(record => record.user);
};

export const getUserByEmail = (email: string): User | null => {
  return users[email]?.user || null;
};

export const isRegistrationEnabled = true;

export const registerUser = (email: string, password: string, fullName: string): User => {
  if (users[email]) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: String(Object.keys(users).length + 1),
    email,
    fullName,
    isAdmin: false
  };

  users[email] = {
    password,
    user: newUser
  };

  return newUser;
};