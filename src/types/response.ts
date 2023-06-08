export interface VillaResponse<T extends object> {
  retcode: number;
  message: string;
  data: T;
}
