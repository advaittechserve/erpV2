import React from 'react';

// Breadcrumb component
const Breadcrumb =  ({ items }) => {
  return (
    <nav className="flex " aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {items.map((item, index) => (
          <li key={index} aria-current={index === items.length - 1 ? 'page' : null}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="rtl:rotate-180 w-3 h-3 text-gray-900 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              {item.link ? (
                <a
                  href={item.link}
                  className="inline-flex items-center text-sm font-large text-black hover:text-yellow-600 bg-green-100 px-3 py-1 rounded-full"
                >
                  {item.text}
                </a>
              ) : (
                <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">
                  {item.text}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
