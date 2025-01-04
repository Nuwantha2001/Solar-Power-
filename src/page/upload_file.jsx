import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import styles from "./upload_file.module.css";

const UploadFile = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const timeRange = sheet["B2"]?.v;
        if (!timeRange) {
          alert("Invalid file: Time Range not found.");
          setLoading(false);
          return;
        }

        if (localStorage.getItem("uploadedTimeRange") === timeRange) {
          alert("This file has already been uploaded.");
          setLoading(false);
          return;
        }
        localStorage.setItem("uploadedTimeRange", timeRange);

        const parsedData = XLSX.utils.sheet_to_json(sheet, { range: 12 });
        const parsedSummary = parsedData
          .filter( (row) => row["Site ID"]?.trim().toLowerCase() !== null && row["Solar Supply (kWh)"] <= 100)
          .map((row, index) => ({
            index: index + 1,
            site: row.Site,
            site_id: row["Site ID"],
            date: row.Date,
            solar_supply_kwh:
              row["Solar Supply (kWh)"] === "N/A" ||
              row["Solar Supply (kWh)"] == null
                ? 0
                : parseFloat(row["Solar Supply (kWh)"])
          }));

        setSummary(parsedSummary);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error processing the file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    try {
      const response = await axios.post("http://localhost:5000/upload", summary);
      alert("Data uploaded successfully");
    } catch (error) {
      console.error("Error uploading data", error);
      alert("Failed to upload the data.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      handleFileUpload(file);
    }
  };

  return (
    <div className={styles.uploadFileApp}>
      <h1 className={styles.uploadFileHeader}>Solar Power Management</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className={styles.uploadFileInput}/>
      {loading && <div className={styles.loadingBar}>Processing...</div>}
      <button onClick={handleUpload} disabled={loading || summary.length === 0} className={styles.uploadFileButton}>
        Check & Upload </button>
      {summary.length > 0 && (
        <div>
          <h2 className={styles.uploadFileSummaryHeader}>
            Daily Connected Sites Details
          </h2>
          <div className={styles.tableContainer}>
            <table className={styles.uploadFileTable} border="1">
              <thead>
                <tr>
                  <th>No:</th>
                  <th>Sites</th>
                  <th>Site ID</th>
                  <th>Date</th>
                  <th>Solar Supply (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.index}>
                    <td>{row.index}</td>
                    <td>{row.site}</td>
                    <td>{row.site_id}</td>
                    <td>{row.date}</td>
                    <td>{row.solar_supply_kwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
