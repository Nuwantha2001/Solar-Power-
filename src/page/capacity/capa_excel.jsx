
import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import styles from '/src/page/upload_file.module.css';

const capa_excel = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const parsedData = XLSX.utils.sheet_to_json(sheet, { range: 0 });
        const parsedSummary = parsedData
          .filter( (row) => row["Site ID"]?.trim().toLowerCase() !== null && row["Capacity(kW)"] <= 50)
          .map((row, index) => ({
            index: index + 1,
            site_id: row["Site ID"],
            site: row["Site name"],
            sub_region: row["Sub Region"],
            capacity:
              row["Capacity(kW)"] === "N/A" ||
              row["Capacity(kW)"] == null
                ? 0
                : parseFloat(row["Capacity(kW)"]),
            max: row["Max Generated"],
            avg: row["Average Generated"]
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
    console.log("Summary being uploaded:", summary);
    try {
      const response = await axios.post("http://localhost:5000/cap-upload", { summary });
      alert("Data uploaded successfully");
    } catch (error) {
      console.error("Error uploading data", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to upload the data.");
      }
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
      <h1 className={styles.uploadFileHeader}>Solar Site Capacity </h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className={styles.uploadFileInput}/>
      {loading && <div className={styles.loadingBar}>Processing...</div>}
      <button onClick={handleUpload} disabled={loading || summary.length === 0} className={styles.uploadFileButton}>
        Check & Upload </button>
      {summary.length > 0 && (
        <div>
          <h2 className={styles.uploadFileSummaryHeader}>
           Connected Sites Details
          </h2>
          <div className={styles.tableContainer}>
            <table className={styles.uploadFileTable} border="1">
              <thead>
                <tr>
                  <th>No:</th>
                  <th>Site ID</th>
                  <th>Sites</th>
                  <th>Sub Region</th>
                  <th>Capacity</th>
                  <th>Max Geneartion</th>
                  <th>Ang Generation</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.index}>
                    <td>{row.index}</td>
                    <td>{row.site_id}</td>
                    <td>{row.site}</td>
                    <td>{row.sub_region}</td>
                    <td>{row.capacity}</td>
                    <td>{row.max}</td>
                    <td>{row.avg}</td>
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

export default capa_excel;
