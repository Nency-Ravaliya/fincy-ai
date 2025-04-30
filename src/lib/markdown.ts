import React from 'react';

export function formatMessage(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const formattedContent: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  lines.forEach((line, index) => {
    // Handle headers (h1 to h6)
    const headerMatch = line.match(/^(#{1,6})\s(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const className = `text-${level === 1 ? '2xl' : level === 2 ? 'xl' : 'lg'} font-bold mb-2`;
      formattedContent.push(
        React.createElement(`h${level}`, 
          { key: index, className },
          text
        )
      );
      return;
    }

    // Handle bold text
    let text = line;
    const boldPattern = /\*\*(.*?)\*\*/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(React.createElement('strong', { 
        key: `bold-${match.index}`,
        className: 'font-bold text-blue-400'
      }, match[1]));
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    // Handle tables
    if (line.includes('|')) {
      const cells = line.split('|').filter(cell => cell.trim() !== '');
      if (line.includes('---')) {
        inTable = true;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable && tableRows.length > 0) {
      formattedContent.push(
        React.createElement('div', 
          { key: index, className: 'overflow-x-auto my-4 rounded-lg border border-gray-700' },
          React.createElement('table', 
            { className: 'min-w-full divide-y divide-gray-700' },
            [
              React.createElement('thead', { key: 'head' },
                React.createElement('tr', { className: 'bg-gray-800' },
                  tableRows[0].map((header, i) =>
                    React.createElement('th', {
                      key: i,
                      className: 'px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'
                    }, header.trim())
                  )
                )
              ),
              React.createElement('tbody', 
                { key: 'body', className: 'divide-y divide-gray-700 bg-gray-900 bg-opacity-50' },
                tableRows.slice(1).map((row, i) =>
                  React.createElement('tr', { 
                    key: i,
                    className: 'hover:bg-gray-800 transition-colors duration-150'
                  },
                    row.map((cell, j) =>
                      React.createElement('td', {
                        key: j,
                        className: 'px-4 py-3 text-sm text-gray-300 whitespace-pre-wrap'
                      }, cell.trim())
                    )
                  )
                )
              )
            ]
          )
        )
      );
      tableRows = [];
      inTable = false;
      return;
    }

    // Add regular text with parts (including bold)
    if (parts.length > 0) {
      formattedContent.push(
        React.createElement('p',
          { 
            key: index, 
            className: 'mb-3 text-gray-300 leading-relaxed'
          },
          ...parts
        )
      );
    } else if (line.trim() !== '') {
      formattedContent.push(
        React.createElement('p',
          { 
            key: index, 
            className: 'mb-3 text-gray-300 leading-relaxed'
          },
          line
        )
      );
    } else {
      formattedContent.push(React.createElement('br', { key: index }));
    }
  });

  return formattedContent;
}