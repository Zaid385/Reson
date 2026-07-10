import { StateCreator } from 'zustand'
import { StoreState } from '../store'
import { ProjectData } from '@models/models'

export interface ProjectSlice {
  activeProject: ProjectData | null
  setActiveProject: (project: ProjectData) => void
}

export const createProjectSlice: StateCreator<StoreState, [], [], ProjectSlice> = (set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project })
})
