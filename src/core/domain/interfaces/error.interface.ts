export interface IErrorResponse {
  message: string;
  code: string;
  position?: {
    line: number;
    column: number;
  };
}
