import { create } from 'zustand'

interface DialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  isDanger: boolean
  isPrompt: boolean
  promptValue: string
  onPromptChange: (val: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDanger: false,
  isPrompt: false,
  promptValue: '',
  onPromptChange: (val: string) => set({ promptValue: val }),
  onConfirm: () => {},
  onCancel: () => {}
}))

export const showConfirmDialog = (options: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}): Promise<boolean> => {
  return new Promise((resolve) => {
    useDialogStore.setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isDanger: options.isDanger || false,
      onConfirm: () => {
        useDialogStore.setState({ isOpen: false, isPrompt: false, promptValue: '' })
        resolve(true)
      },
      onCancel: () => {
        useDialogStore.setState({ isOpen: false, isPrompt: false, promptValue: '' })
        resolve(false)
      }
    })
  })
}

export const showAlertDialog = (options: {
  title: string
  message: string
}): Promise<void> => {
  return new Promise((resolve) => {
    useDialogStore.setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: 'OK',
      cancelText: '', 
      isDanger: false,
      onConfirm: () => {
        useDialogStore.setState({ isOpen: false })
        resolve()
      },
      onCancel: () => {
        useDialogStore.setState({ isOpen: false, isPrompt: false, promptValue: '' })
        resolve()
      }
    })
  })
}

export const showPromptDialog = (options: {
  title: string
  message: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}): Promise<string | null> => {
  return new Promise((resolve) => {
    useDialogStore.setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      isDanger: false,
      isPrompt: true,
      promptValue: options.defaultValue || '',
      onConfirm: () => {
        const val = useDialogStore.getState().promptValue
        useDialogStore.setState({ isOpen: false, isPrompt: false, promptValue: '' })
        resolve(val)
      },
      onCancel: () => {
        useDialogStore.setState({ isOpen: false, isPrompt: false, promptValue: '' })
        resolve(null)
      }
    })
  })
}
