import Papa from 'papaparse';

const CSVDownloadButton = ({ data, filename }) => {
  const handleDownload = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    
<button  className="delete-btn" onClick={handleDownload}>Download</button>
  );
};

export default CSVDownloadButton;
