export interface FetchError {
  statusCode: number;
  message?: string;
  data?: {
    message: string;
    error: string;
    statusCode: number;
  };
}
