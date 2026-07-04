export interface IPageProps<T> {
  [key: string]: any;
  data: T[];
  total: number;
}
