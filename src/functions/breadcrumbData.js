// breadcrumbData.js
const breadcrumbData = {
    Home: [{ text: 'Home', link: '/' }],
    Customer: [{ text: 'Home', link: '/' }, { text: 'Customer', link: '/Dashboard' }],
    Banks: (customerId) => [{ text: 'Home', link: '/' }, { text: 'Customer', link: '/Dashboard' },{ text: 'Banks', link: `/BankDetails/${customerId}` }],
    Atms: (bankId) => [{ text: 'Home', link: '/' }, { text: 'Customer', link: '/Dashboard' },{ text: 'Atms', link: `/AtmDetails/${bankId}` }],
    User: [{ text: 'Home', link: '/' }, { text: 'User', link: '/UserSettings' }],
  };
  
  export default breadcrumbData;
  