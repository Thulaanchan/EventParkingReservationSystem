export enum ToastType {
  Success = 'Success',
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info'
}

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}
