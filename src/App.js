import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react'; 
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { useQueryState } from "nuqs";
import data from "./sample-app.json";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const gridRef = useRef(null);
  const [sortModel, setSortModel] = useQueryState("sortValue", { defaultValue: '' });
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", { defaultValue: '' });
  const [filters, setFilters] = useQueryState("filters", { defaultValue: [] });
  const [page, setPage] = useQueryState("page", { defaultValue: 0 });
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: 15 });
  const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" });

  const [rowData] = useState(
  data.map((item) => ({
    ...item,
    skills : item.skills ? item.skills.map((skill) => skill.name).join(", ") : "" 
  }))
);
  const [colDefs, setColDefs] = useState(
    Object.keys(data[0]).map((key) => ({
      field: key, 
      filter: true, 
      floatingFilter: true, 
    }))
  );

useEffect(() => {
  window.history.replaceState(null, '', window.location.pathname);
}, []);

  

  useEffect(() => {
    const updatedColDefs = Object.keys(data[0]).map((key) => ({
      field: key, 
      filter: true, 
      floatingFilter: true, 
    }));

    if (JSON.stringify(updatedColDefs) !== JSON.stringify(colDefs)) {
      setColDefs(updatedColDefs);
    }
  }, [colDefs]); 

  
  const onSortChanged = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const newSortModel = gridRef.current.api.getColumnState()
        .filter(col => col.sort)
        .map(({ colId, sort }) => ({ colId, sort }));
        if(newSortModel.length !== 0){
      setSortModel(newSortModel[0]?.colId);
      setSortOrder(newSortModel[0]?.sort);
    }
    else{
      setSortModel('')
      setSortOrder('')
    }
    }
  }, [setSortModel]);
  
  
  

  const onFilterChanged = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const newFilters = gridRef.current.api.getFilterModel();
    
      setFilters(Object.keys(newFilters));
    }
  }, [setFilters]);

  const onPaginationChanged = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const newPage = gridRef.current.api.paginationGetCurrentPage() + 1;
      setPage(newPage);
    }
  }, [setPage]);

  const onPageSizeChanged = useCallback((event) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption(newSize);
    }
  }, [setPageSize]);
  

  const exportToCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv();
    }
  };

  const onGridReady = () => {
    if (gridRef.current && gridRef.current.columnApi) {
      gridRef.current.columnApi.applyColumnState({
        state: sortModel,
        applyOrder: true,
      });
    }
  
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setFilterModel(filters);
      gridRef.current.api.paginationGoToPage(page - 1);
    }
  };
  

  return (
    <div className="ag-theme-alpine" style={{ height: 900, width: "100%" }}>
      <div style={{ padding: '20px' }}>
        <button onClick={exportToCSV}>Export CSV</button>
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <select onChange={onPageSizeChanged} value={pageSize}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={true}
        paginationPageSizeSelectorValues={[10, 20, 50]}
        paginationCurrentPage={page - 1}
        defaultColDef={{ sortable: true, resizable: true }}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onGridReady={onGridReady}  
      />
    </div>
  );
}

export default App;
