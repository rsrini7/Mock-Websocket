import React, { useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';
import { GridApi, StockData } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { useTheme } from './context/ThemeContext';

// Remove the module registration line

function App(): JSX.Element {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const rowData = useWebSocket();

  const columnDefs: ColDef<StockData>[] = [
    { 
      field: 'symbol', 
      headerName: 'Symbol',
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'price', 
      headerName: 'Price',
      flex: 1,
      minWidth: 120,
      valueFormatter: params => `$${params.value.toFixed(2)}`
    },
    { 
      field: 'change', 
      headerName: 'Change',
      flex: 1,
      minWidth: 120,
      cellStyle: params => ({
        color: params.value >= 0 ? '#4CAF50' : '#FF5722'
      }),
      valueFormatter: params => `${params.value.toFixed(2)}%`
    },
    { 
      field: 'volume', 
      headerName: 'Volume',
      flex: 1,
      minWidth: 120,
      valueFormatter: params => params.value.toLocaleString()
    }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (gridApi) {
        gridApi.sizeColumnsToFit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridApi]);

  return (
    <div className="app">
      <h1>Real-time Stock Market</h1>
      <div 
        className="ag-theme-alpine"
        style={{ 
          height: '80vh',
          width: '100%'
        }}
      >
        <AgGridReact<StockData>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          onGridReady={onGridReady}
          suppressScrollOnNewData={true}
          enableCellTextSelection={true}
          domLayout="normal"
          rowHeight={48}
          headerHeight={56}
          suppressMovableColumns={true}
          getRowId={params => params.data.symbol}
        />
      </div>
    </div>
  );
}

export default App;
