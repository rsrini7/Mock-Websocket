import { GridApi as AgGridApi } from 'ag-grid-community';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

// Update the GridApi type to match the newer version
export type GridApi = AgGridApi;
