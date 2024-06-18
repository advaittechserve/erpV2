const templateData = [
    {
        section: "Customer Details",
        fields: [
            { 
                label: "Customer Id:", 
                key: "CustomerId",
                required: true,
                description: "The customer ID",
                suggested_mappings: ["CustomerID", "ID"],
            },
            { 
                label: "Customer Name:", 
                key: "CustomerName",
                required: true,
                description: "The customer name",
                suggested_mappings: ["CustomerName", "Name"],
            },
            { 
                label: "Customer Site Status:", 
                key: "CustomerSiteStatus",
                required: true,
                description: "Customer Site Status",
                suggested_mappings: ["CustomerSiteStatus"],
            },
            { 
                label: "Start Date:", 
                key: "StartDate",
                description: "Start date of the customer",
                suggested_mappings: ["StartDate"],
            },
            { 
                label: "End Date:", 
                key: "EndDate",
                description: "End date of the customer",
                suggested_mappings: ["EndDate"],
            },
        ],
    },
    {
        section: "Bank Details",
        fields: [
            { 
                label: "Bank ID:", 
                key: "BankId",
                required: true,
                description: "The bank ID",
           
            },
            { 
                label: "Bank Name:", 
                key: "BankName",
                required: true,
                description: "The bank name",
                
            },
        ]
    },
    {
        section: "ATM Details",
        fields: [
            { 
                label: "ATM ID:", 
                key: "AtmId",
                description: "The ATM ID",
                
            },
            { 
                label: "Country:", 
                key: "Country",
                description: "The country of the ATM",
                suggested_mappings: ["Country"],
            },
            { 
                label: "State:", 
                key: "State",
                description: "The state of the ATM",
                suggested_mappings: ["State"],
            },
            { 
                label: "City:", 
                key: "City",
                description: "The city of the ATM",
                suggested_mappings: ["City"],
            },
            { 
                label: "Address:", 
                key: "Address",
                description: "The address of the ATM",
                suggested_mappings: ["Address"],
            },
            { 
                label: "Branch Code:", 
                key: "BranchCode",
                description: "The branch code of the ATM",
                suggested_mappings: ["BranchCode"],
            },
            { 
                label: "Site ID:", 
                key: "SiteId",
                description: "The site ID of the ATM",
                suggested_mappings: ["SiteID"],
            },
            { 
                label: "Lho:", 
                key: "Lho",
                description: "The Lho of the ATM",
                suggested_mappings: ["Lho"],
            },
            { 
                label: "New ATM ID:", 
                key: "NewAtmId",
                description: "The new ATM ID",
                suggested_mappings: ["NewATMID", "NewID"],
            },
            { 
                label: "Site Status:", 
                key: "SiteStatus",
                description: "The site status of the ATM",
                suggested_mappings: ["SiteStatus"],
            },
            { 
                label: "From Date:", 
                key: "FromDate",
                description: "The starting date of the ATM service",
                suggested_mappings: ["FromDate"],
            },
            { 
                label: "To Date:", 
                key: "ToDate",
                description: "The ending date of the ATM service",
                suggested_mappings: ["ToDate"],
            },
        ],
    },
    {
        section: "Employee Details",
        fields: [
            { 
                label: "Requested By:", 
                key: "RequestedBy",
                description: "The person who requested the service",
                
            },
            { 
                label: "Employee ID:", 
                key: "EmployeeId",
                description: "The employee ID",
                
            },
            { 
                label: "Employee Name:", 
                key: "EmployeeName",
                description: "The employee name",
               
            },
            { 
                label: "Employee Role:", 
                key: "EmployeeRole",
                description: "The employee role",
                suggested_mappings: ["EmployeeRole", "Role"],
            },
            { 
                label: "Employee Contact Number:", 
                key: "EmployeeContactNumber",
                description: "The employee contact number",
                suggested_mappings: ["EmployeeContactNumber", "ContactNumber"],
            },
            { 
                label: "Type of Work:", 
                key: "TypeOfWork",
                description: "The type of work",
                suggested_mappings: ["TypeOfWork", "WorkType"],
            },
        ],
    },
    {
        section: "Service Details",
        fields: [
            { 
                label: "Service ID:", 
                key: "ServiceId",
                description: "The service ID",
                
            },
            { 
                label: "Service Type:", 
                key: "ServiceType",
                description: "The service type",
                suggested_mappings: ["ServiceType", "Type"],
            },
            { 
                label: "Takeover Date:", 
                key: "TakeoverDate",
                description: "The takeover date",
                suggested_mappings: ["TakeoverDate"],
            },
            { 
                label: "Handover Date:", 
                key: "HandoverDate",
                description: "The handover date",
                suggested_mappings: ["HandoverDate"],
            },
            { 
                label: "Pay Out:", 
                key: "PayOut",
                description: "The pay out",
                suggested_mappings: ["PayOut"],
            },
            { 
                label: "Cost To Client:", 
                key: "CostToClient",
                description: "The cost to the client",
                suggested_mappings: ["CostToClient", "ClientCost"],
            },
        ],
    },
    {
        section: "Region Details",
        fields: [
            { 
                label: "Region ID:", 
                key: "RegionId",
                description: "The region ID",
              
            },
            { 
                label: "Region Name:", 
                key: "RegionName",
                description: "The region name",
                
            },
            { 
                label: "GST State Code:", 
                key: "GstStateCode",
                description: "The GST state code",
                suggested_mappings: ["GSTStateCode", "StateCode"],
            },
        ],
    },
];

export default templateData;
