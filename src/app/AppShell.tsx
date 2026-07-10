import { TopBar } from '@features/top-bar'
import { PadGrid, PadListView } from '@features/pad-grid'
import { SampleBrowserPanel } from '@features/sample-browser'
import { ParameterPanel } from '@features/parameter-panel'
import { FooterBar } from '@features/footer'
import { useKeyboardController } from '@hooks/useKeyboardController'
import { usePointerRollController } from '@hooks/usePointerRollController'
import { useAudioEngineBinding } from '@hooks/useAudioEngineBinding'
import { useAutosave } from '@hooks/useAutosave'
import { SampleEditorModal } from '@features/sample-editor'
import { SettingsModal, KeyboardShortcutsModal } from '@features/settings'
import { OnboardingOverlay } from '@features/onboarding'
import { useStore } from '@state/store'

export function AppShell() {
  useKeyboardController()
  usePointerRollController()
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
      <SampleEditorModal />
      <SettingsModal />
      <KeyboardShortcutsModal />
      <OnboardingOverlay />
    </div>
  )
}
