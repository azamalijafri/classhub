/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axiosInstance from "../lib/axios-instance";

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isError: CustomError | null;
  profile: IProfile | null;
}

interface AuthActions {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  // fetchUser: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

interface Credentials {
  email: string;
  password: string;
}

const authStorageKey = "authToken";

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isError: null,
  profile: null,

  // async fetchUser() {
  //   try {
  //     const { token } = get();
  //     if (!token) {
  //       throw new Error("No token found");
  //     }

  //     const response = await axiosInstance.get("/get/my/user");
  //     const data = response.data;

  //     set({ user: data.user });
  //   } catch (error: any) {
  //     console.error("Error fetching user:", error);
  //     set({ user: null, isError: error.message as CustomError });
  //   }
  // },

  async fetchProfile() {
    try {
      const { token } = get();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axiosInstance.get(
        `/get/my/profile?role=${localStorage.getItem("role")}`
      );
      const data = response.data;

      set({ profile: data.profile, user: data.user });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      set({ profile: null, isError: error.message as CustomError });
    }
  },

  async login(credentials: Credentials) {
    set({ isLoading: true, isError: null });

    try {
      const response = await axiosInstance.post("/login", credentials);

      if (response.status === 200) {
        const { user, token } = response.data;

        set({
          user,
          token,
          isLoading: false,
          isError: null,
        });

        localStorage.setItem(authStorageKey, token);
        localStorage.setItem("role", user?.role);

        await get().fetchProfile();
      } else {
        set({ isLoading: false, isError: response.data.message });
      }
    } catch (error: any) {
      console.log("login error: ", error);

      set({ isLoading: false, isError: error.message as CustomError });
    }
  },

  logout() {
    localStorage.removeItem(authStorageKey);
    set({ user: null, token: null, profile: null });
  },

  async initializeAuth() {
    const token = localStorage.getItem(authStorageKey);
    if (token) {
      set({ token });
      await get().fetchProfile();
    }
  },
}));

export default useAuthStore;
