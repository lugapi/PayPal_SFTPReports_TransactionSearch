// Get the search bar and table
const fileSearch = document.getElementById('fileSearch');
const table = document.querySelector('table');

// Listen for changes in the search bar
fileSearch.addEventListener('input', function () {
    const searchTerm = fileSearch.value.toLowerCase();

    // Get all rows except the header
    const rows = table.querySelectorAll('tbody tr');

    // Hide rows that don't match the search
    rows.forEach(row => {
        const fileName = row.querySelector('td').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

function filterByLetter(letter) {
    fileSearch.value = letter;
    fileSearch.dispatchEvent(new Event('input'));
}

function texteVersTableauHTML(texte) {
    //  Delete the carriage return characters and split the text into lines
    const lignes = texte.trim().split('\n');

    // Create the table HTML with Tailwind classes
    let tableauHTML = '<table class="border-collapse border">\n';

    // Each line of the text
    for (const ligne of lignes) {
        // Cut the line into columns
        const colonnes = ligne.split(',');

        // Create a table row
        tableauHTML += '  <tr class="border-b">\n';

        for (const colonne of colonnes) {
            // Add a cell to the table row with Tailwind classes
            tableauHTML += `    <td class="border p-2">${colonne}</td>\n`;
        }

        // Close the table row
        tableauHTML += '  </tr>\n';
    }

    // Close the table
    tableauHTML += '</table>';

    return tableauHTML;
}

//  Function to display the preview of the file
function previewFile(button, fileName) {
    const previewRows = document.querySelectorAll('.preview-row');
    const previewCells = document.querySelectorAll('.preview-cell');

    // Hide all preview rows and reset their content
    previewRows.forEach(row => {
        row.style.display = 'none';
    });
    previewCells.forEach(cell => {
        cell.innerHTML = '';
    });

    //  Find the parent row of the current button
    const parentRow = button.closest('tr');

    // Find the preview row and preview cell
    const previewRow = parentRow.nextElementSibling;
    const previewCell = previewRow.querySelector('.preview-cell');
    previewCell.innerHTML = '<span class="text-center text-xl p-5 w-full flex justify-around">... LOADING ...</span>';

    // Display the preview row
    previewRow.style.display = '';

    // Load the file content
    fetch("/previewFile/" + fileName, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            // Display the content in the preview cell
            console.log(data.content);
            previewCell.innerHTML = texteVersTableauHTML(data.content);
        })
        .catch(error => {
            console.error(error);
        });

}


document.addEventListener('DOMContentLoaded', function () {
    const letterDescriptions = {
        '': 'All',
        'STL': 'Settlement',
        'ORT': 'Order Report',
        'TRR': 'Transaction Detail',
    };

    // Replace these values with the ones sent from the server
    const uniqueLetters = ["", "STL", "ORT", "TRR"];

    const filterButtonsContainer = document.getElementById('filterButtons');

    uniqueLetters.forEach((letter, key) => {
        const description = letterDescriptions[letter] || letter;
        const isFirst = key === 0;
        const isLast = key === uniqueLetters.length - 1;

        const button = document.createElement('button');
        button.textContent = description;

        const classes = [
            key !== undefined ? `${key}` : '',
            'px-4', 'py-2', 'text-sm', 'font-medium', 'text-white',
            'bg-blue-600', 'border', 'border-blue-200',
            isFirst ? 'rounded-l-lg' : '',
            isLast ? 'rounded-r-lg' : '',
            'hover:bg-blue-700', 'focus:z-10', 'focus:ring-2',
            'focus:ring-blue-700', 'focus:text-white',
            'dark:bg-gray-700', 'dark:border-gray-600', 'dark:text-white',
            'dark:hover:text-white', 'dark:hover:bg-gray-600',
            'dark:focus:ring-blue-500', 'dark:focus:text-white'
        ];

        // Filter the empty classes
        button.classList.add(...classes.filter(cls => cls)); 

        button.addEventListener('click', () => {
            filterByLetter(letter);
        });

        filterButtonsContainer.appendChild(button);
    });
});