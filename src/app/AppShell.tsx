 
import { lazy, Suspense } from 'react'
import { TopBar } from '@features/top-bar'
import { PadGrid, PadListView } from '@features/pad-grid'
import { SampleBrowserPanel } from '@features/sample-browser'
import { ParameterPanel } from '@features/parameter-panel'
import { FooterBar } from '@features/footer'
import { useKeyboardController } from '@hooks/useKeyboardController'
import { usePointerRollController } from '@hooks/usePointerRollController'
import { useMidiController } from '@hooks/useMidiController'
import { useAudioEngineBinding } from '@hooks/useAudioEngineBinding'
import { useAutosave } from '@hooks/useAutosave'
import { OnboardingOverlay } from '@features/onboarding'
import { useStore } from '@state/store'
import { DialogProvider } from '@components/ui/DialogProvider'

const SampleEditorModal = lazy(() => import('@features/sample-editor').then(m => ({ default: m.SampleEditorModal })))
const SettingsModal = lazy(() => import('@features/settings').then(m => ({ default: m.SettingsModal })))
const KeyboardShortcutsModal = lazy(() => import('@features/settings').then(m => ({ default: m.KeyboardShortcutsModal })))
const ProjectsModal = lazy(() => import('@features/projects/ProjectsModal').then(m => ({ default: m.ProjectsModal })))

export function AppShell() {
  useKeyboardController()
  usePointerRollController()
  useMidiController()
  useAudioEngineBinding()
  useAutosave()
  
  const useListView = useStore(state => state.settings?.useListView ?? false)

  
  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-base)] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <SampleBrowserPanel />
        <main className="flex-1 flex items-center justify-center p-grid-margin relative touch-none select-none">
          {useListView ? <PadListView /> : <PadGrid />}
        </main>
        <ParameterPanel />
      </div>
      <FooterBar />
      <Suspense fallback={null}>
        <SampleEditorModal />
        <SettingsModal />
        <KeyboardShortcutsModal />
        <ProjectsModal />
      </Suspense>
      <DialogProvider />
      <OnboardingOverlay />
    </div>
  )
}
