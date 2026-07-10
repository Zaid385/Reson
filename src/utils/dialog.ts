import { create } from 'zustand'

interface DialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  isDanger: boolean
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
        useDialogStore.setState({ isOpen: false })
        resolve(true)
      },
      onCancel: () => {
        useDialogStore.setState({ isOpen: false })
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
        useDialogStore.setState({ isOpen: false })
        resolve()
      }
    })
  })
}
