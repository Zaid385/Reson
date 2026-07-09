import { TopBar } from '@features/top-bar'
import { PadGrid } from '@features/pad-grid'
import { SampleBrowserPanel } from '@features/sample-browser'
import { ParameterPanel } from '@features/parameter-panel'
import { FooterBar } from '@features/footer'
import { useKeyboardController } from '@hooks/useKeyboardController'
import { usePointerRollController } from '@hooks/usePointerRollController'
import { useAudioEngineBinding } from '@hooks/useAudioEngineBinding'
import { useAutosave } from '@hooks/useAutosave'
import { SampleEditorModal } from '@features/sample-editor'

export function AppShell() {
  useKeyboardController()
  usePointerRollController()
  useAudioEngineBinding()
  useAutosave()
  
  return (
    <div className="flex flex-col h-screen w-screen bg-bg-base overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <SampleBrowserPanel />
        <main className="flex-1 flex items-center justify-center p-grid-margin relative touch-none select-none">
          <PadGrid />
        </main>
        <ParameterPanel />
      </div>
      <FooterBar />
      <SampleEditorModal />
    </div>
  )
}
