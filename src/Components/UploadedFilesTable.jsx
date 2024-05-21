import React from 'react';
const UploadedFilesTable = () => (
    <div className="mt-8 relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        File Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Uploaded Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Uploaded By
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody>
                {uploadedFiles.map((file, index) => (
                    <tr key={index} className={`border-b dark:bg-gray-800 dark:border-gray-700`}>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {file.name}
                        </td>
                        <td className="px-6 py-4">
                            {file.uploadedTime}
                        </td>
                        <td className="px-6 py-4">
                            {file.uploadedBy}
                        </td>
                        <td className="px-6 py-4">
                            {file.status}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export default UploadedFilesTable;