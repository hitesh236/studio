
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'Admin' | 'Accountant' | 'Auditor' | 'Guest';

interface UserRoleState {
  role: Role;
  setRole: (role: Role) => void;
}

const useUserRole = create<UserRoleState>()(
  persist(
    (set) => ({
      role: 'Admin',
      setRole: (role) => set({ role }),
    }),
    {
      name: 'user-role-storage', // name of the item in the storage (must be unique)
    }
  )
);

export default useUserRole;
