// store/useProjectsStore.js
import {create} from 'zustand';

const useProjectsStore = create((set) => ({
  projects: [],
  addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
  clear: () => set({ projects: [] }),
}));

export default useProjectsStore;
