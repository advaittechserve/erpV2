import React from "react";
import { useLocation } from "react-router-dom";
import "../css/list.css"; // Import the CSS file

const DetailsPage = () => {
  const location = useLocation();
  const { atmRegion, services, employee, customer, atm, bank } = location.state || {};

  if (!atmRegion || !services || !employee || !customer || !atm || !bank) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4zm-2-7.291A7.962 7.962 0 0120 12h4c0-3.042-1.135-5.824-3-7.938l-3 2.647z"></path>
        </svg>
      </div>
    );
  }

  const data = [
    {
      section: "Customer Details",
      fields: [
        { label: "Customer Id:", value: customer[0]?.CustomerId },
        { label: "Customer Name:", value: customer[0]?.CustomerName },
      ],
    },
    {
      section: "Bank Details",
      fields: [
        { label: "Bank ID:", value: bank[0]?.BankId },
        { label: "Bank Name:", value: bank[0]?.BankName },
      ]
    },
    {
      section: "ATM Details",
      fields: [
        { label: "ATM ID:", value: atm[0]?.AtmId },
        { label: "State:", value: atm[0]?.State },
        { label: "City:", value: atm[0]?.City },
        { label: "Address:", value: atm[0]?.Address },
        { label: "Branch Code:", value: atm[0]?.BranchCode },
        { label: "Site ID:", value: atm[0]?.SiteId },
        { label: "Lho:", value: atm[0]?.Lho },
        { label: "Region:", value: atm[0]?.Region },
        { label: "Old ATM ID:", value: atm[0]?.OldAtmId },
        { label: "New ATM ID:", value: atm[0]?.NewAtmId },
        { label: "Site Status:", value: atm[0]?.SiteStatus },
      ],
    },
    {
      section: "Region Details",
      fields: [
        { label: "Region ID:", value: atmRegion[0]?.RegionId },
        { label: "Region Name:", value: atmRegion[0]?.RegionName },
        { label: "GST State Code:", value: atmRegion[0]?.GstStateCode },
      ],
    },
    {
      section: "Employee Details",
      fields: [
        { label: "Employee ID:", value: employee[0]?.EmployeeId },
        { label: "Employee Name:", value: employee[0]?.EmployeeName },
        { label: "Employee Role:", value: employee[0]?.EmployeeRole },
        { label: "Employee Contact Number:", value: employee[0]?.EmployeeContactNumber },
        { label: "Type of Work:", value: employee[0]?.TypeOfWork },
      ],
    },
    {
      section: "Service Details",
      fields: [
        { label: "Service ID:", value: services[0]?.ServiceId },
        { label: "Service Type:", value: services[0]?.ServiceType },
        { label: "Takeover Date:", value: services[0]?.TakeoverDate },
        { label: "Handover Date:", value: services[0]?.HandoverDate },
        { label: "Cost To Client:", value: services[0]?.CostToClient },
      ],
    },
  ];

  return (
    <div className="table-container">
      <div className="page-header">
      
        </div>
      <table className="table">
        <tbody>
          {data.map((section, index) => (
            <React.Fragment key={index}>
              <tr>
                <th colSpan="2" className="section-header">
                  {section.section}
                </th>
              </tr>
              {section.fields.map((field, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
                  <th className="field-header">{field.label}</th>
                  <td>{field.value}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailsPage;
