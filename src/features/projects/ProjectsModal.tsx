 
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from 'react'
import { useStore } from '@state/store'
import { X, FolderOpen, Plus, Trash2, Edit2, Play } from 'lucide-react'
import { projectRepository } from '@persistence/repositories/ProjectRepository'
import { projectBootstrapService } from '@persistence/ProjectBootstrapService'
import { ProjectData } from '@models/models'
import { showConfirmDialog, showPromptDialog } from '@utils/dialog'
import { db } from '@persistence/db'

import { motion, AnimatePresence } from 'framer-motion'

export const ProjectsModal: React.FC = () => {
  const isOpen = useStore(state => state.activeModal === 'projects')
  const closeModal = useStore(state => state.closeModal)
  const activeProject = useStore(state => state.activeProject)
  
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const loadProjects = async () => {
    await projectRepository.cleanupEmptyProjects()
    const list = await projectRepository.listProjects()
    setProjects(list)
  }

  useEffect(() => {
    if (isOpen) {
      loadProjects()
    }
  }, [isOpen])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleNewProject = async () => {
    const name = await showPromptDialog({
      title: 'New Kit',
      message: 'Enter a name for your new kit:',
      defaultValue: 'My Kit',
      confirmText: 'Create'
    })
    
    if (name) {
      const newProject = await projectBootstrapService.createAndSaveDefaultProject()
      await db.projects.update(newProject.id, { name: name.trim(), updatedAt: Date.now() })
      await projectRepository.setActiveProject(newProject.id)
      window.location.reload()
    }
  }

  const handleSwitchProject = async (projectId: string) => {
    if (projectId === activeProject?.id) return
    await projectRepository.setActiveProject(projectId)
    window.location.reload()
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const p = projects.find(p => p.id === projectId)
    if (!p) return

    const confirmed = await showConfirmDialog({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${p.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      isDanger: true
    })
    
    if (confirmed) {
      if (projectId === activeProject?.id) {
        await projectRepository.deleteProject(projectId)
        const newProject = await projectBootstrapService.createAndSaveDefaultProject()
        await projectRepository.setActiveProject(newProject.id)
        window.location.reload()
      } else {
        await projectRepository.deleteProject(projectId)
        await loadProjects()
      }
    }
  }

  const startEditing = (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(project.id)
    setEditName(project.name)
  }

  const saveRename = async () => {
    if (editingId && editName.trim()) {
      await db.projects.update(editingId, { 
        name: editName.trim(), 
        updatedAt: Date.now() 
      })
      if (editingId === activeProject?.id) {
        const updated = await projectRepository.getActiveProject()
        if (updated) {
          useStore.getState().setActiveProject(updated)
        }
      }
      await loadProjects()
    }
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveRename()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="projects-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div 
            key="projects-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-2xl h-[70vh] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-title"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 id="projects-title" className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[var(--accent-cyan)]" />
            Project Manager
          </h2>
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 bg-[var(--accent-cyan)] text-black hover:opacity-90 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              onClick={handleNewProject}
            >
              <Plus className="w-4 h-4" /> New Kit
            </button>
            <div className="w-px h-6 bg-[var(--border-subtle)] mx-2" />
            <button 
              className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              onClick={closeModal}
              aria-label="Close projects"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3">
            {projects.map(project => {
              const isActive = project.id === activeProject?.id
              return (
                <div 
                  key={project.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors bg-[var(--kit-list-bg)] ${
                    isActive 
                      ? 'border-[var(--accent-cyan)]' 
                      : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex-1 flex flex-col items-start overflow-hidden mr-4">
                    {editingId === project.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        className="w-full max-w-xs bg-[var(--bg-base)] border border-[var(--accent-cyan)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={handleKeyDown}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center gap-3 w-full">
                        <span className={`font-semibold text-lg truncate ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-primary)]'}`}>
                          {project.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] capitalize tracking-wider bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-sm text-[var(--text-muted)] mt-1">
                      Last edited: {new Date(project.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <button 
                        className="p-2 bg-[var(--bg-base)] hover:bg-[var(--accent-cyan)]/20 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] rounded-lg transition-colors flex items-center gap-2"
                        onClick={() => handleSwitchProject(project.id)}
                        title="Load Project"
                      >
                        <Play className="w-4 h-4" /> Load
                      </button>
                    )}
                    <button 
                      className="p-2 hover:bg-[var(--bg-surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                      onClick={(e) => startEditing(project, e)}
                      title="Rename Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-[var(--accent-danger)]/20 text-[var(--text-muted)] hover:text-[var(--accent-danger)] rounded-lg transition-colors"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
