import React, { useState } from 'react';
import axios from 'axios';

const Add_site = () => {
  const [newRow, setNewRow] = useState({
    site_id: '',
    site:'',
    sub_region: '',
    capacity: '',
  });

  // internal styles
  const styles = {
    container: {padding:'20px',maxWidth:'500px',margin:'auto', border:'1px solid #ccc',borderRadius:'10px',backgroundColor: '#f9f9f9',},
    heading: {textAlign: 'center',marginBottom: '20px',color: '#333',},
    form: {display: 'flex',flexDirection: 'column',gap: '10px',},
    input: {padding:'10px',fontSize:'16px',border:'1px solid #ccc',borderRadius:'5px',width:'100%',boxSizing:'border-box',},
    button: {padding:'10px 20px',fontSize:'16px',backgroundColor:'#007bff',color: '#fff',border: 'none',borderRadius: '5px',
      cursor: 'pointer',transition: 'background-color 0.3s ease',},
    buttonHover: {backgroundColor: '#0056b3',},
  };

  // Handle new row form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRow((prevRow) => ({ ...prevRow, [name]: value }));
  };

  // Add a new row to the capacity table
  const handleAddRow = (e) => {
    e.preventDefault(); // Prevent form submission reload
    axios
      .post('http://localhost:5000/cap_insert', newRow)
      .then((response) => {
        // Clear the form
        setNewRow({ site_id: '',site:'', sub_region: '',capacity: '',});
        alert('Site added successfully!');})
      .catch((error) => console.error('Error adding new row:', error));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add New Site</h2>
      <form onSubmit={handleAddRow} style={styles.form}>

        <input type="text"name="site_id"placeholder="Site ID"value={newRow.site_id}onChange={handleInputChange}
          style={styles.input} required/>
        <input type="text"name="site"placeholder="Site Name"value={newRow.site}onChange={handleInputChange}
          style={styles.input} required/>
        <input type="text"name="sub_region"placeholder="Sub Region"value={newRow.sub_region}onChange={handleInputChange}
          style={styles.input} required/>
        <input type="number"name="capacity"placeholder="Capacity"value={newRow.capacity}onChange={handleInputChange}
          style={styles.input} required/>
        
      
        <button type="submit" style={styles.button}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}>
          Add </button>
      </form>
    </div>
  );
};

export default Add_site;