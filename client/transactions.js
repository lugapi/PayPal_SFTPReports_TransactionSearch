document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('filterButton').addEventListener('click', function () {
        document.getElementById('noData').classList.add('hidden');
        document.getElementById('numbers').classList.add('hidden');
        document.getElementById('numberOfTransaction').innerText = "Number of transactions : ";
        document.getElementById('sumOfAmount').innerText = "Total amount : ";
        document.getElementById('transactionTable').classList.add('hidden');

        var startDate = new Date(document.getElementById('start_date').value);
        var endDate = new Date(document.getElementById('end_date').value);

        // Calculate the difference in milliseconds
        var timeDifference = Math.abs(endDate.getTime() - startDate.getTime());

        // Calculate the difference in days
        var differenceInDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

        // Verify if the difference is greater than 30 days
        if (differenceInDays > 32) {
            alert('The difference between the two dates cannot exceed 30 days.');
            return;
        }

        var startDate = document.getElementById('start_date').value;
        var endDate = document.getElementById('end_date').value;

        var totalAmount = 0;

        // Add minutes and seconds to the format
        startDate += ':00:00';
        endDate += ':00:00';

        const formData = {
            start_date: document.getElementById('start_date').value,
            end_date: document.getElementById('end_date').value,
        };

        console.log(formData)

        fetch('/getListTransactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {

                if (!data || !data.transaction_details || data.transaction_details.length === 0) {
                    document.getElementById('noData').classList.remove('hidden');
                    return;
                }

                // Update the table content
                var transactions = data.transaction_details;
                var tableBody = document.getElementById('transactionTableBody');
                tableBody.innerHTML = '';
                document.getElementById('transactionTable').classList.remove('hidden');

                document.getElementById('numberOfTransaction').innerText += data.total_items;
                document.getElementById('numbers').classList.remove('hidden');

                transactions.forEach(transaction => {
                    // Format the date
                    var transactionDate = new Date(transaction.transaction_info.transaction_initiation_date);
                    var formattedDate = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getDate()).padStart(2, '0')} ${String(transactionDate.getHours()).padStart(2, '0')}:${String(transactionDate.getMinutes()).padStart(2, '0')}:${String(transactionDate.getSeconds()).padStart(2, '0')}`;

                    var row = `<tr>
                        <td class="px-6 py-4 whitespace-nowrap"><a class="text-blue-600 hover:underline" target="_blank" href='https://www.sandbox.paypal.com/activity/payment/${transaction.transaction_info.transaction_id}'>${transaction.transaction_info.transaction_id}</a></td>
                        <td class="px-6 py-4 whitespace-nowrap">${formattedDate}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${transaction.transaction_info.transaction_amount.value} ${transaction.transaction_info.transaction_amount.currency_code}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${transaction.transaction_info.transaction_status}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${transaction.transaction_info.transaction_event_code}</td>
                    </tr>`;
                    tableBody.innerHTML += row;

                    // Calculate the total amount
                    totalAmount = transactions.reduce((total, transaction) => total + parseFloat(transaction.transaction_info.transaction_amount.value), 0);
                });
                // Display the total amount
                document.getElementById('sumOfAmount').innerText += " " + totalAmount.toFixed(2) + " " + transactions[0].transaction_info.transaction_amount.currency_code;
                document.getElementById('transactionTable').classList.remove('hidden');
            })
            .catch(error => console.error('Error:', error));
    });
});

document.getElementById('last7DaysButton').addEventListener('click', function () {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    document.getElementById('start_date').value = startDate.toISOString().slice(0, -8);
    document.getElementById('end_date').value = endDate.toISOString().slice(0, -8);
});

document.getElementById('yesterdayButton').addEventListener('click', function () {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    document.getElementById('start_date').value = startDate.toISOString().slice(0, -8);
    document.getElementById('end_date').value = endDate.toISOString().slice(0, -8);
});

document.getElementById('todayButton').addEventListener('click', function () {
    var endDate = new Date();
    var startDate = new Date();

    // Define the current time to 00:00:00
    // 1 because of timezone
    startDate.setHours(1, 0, 0, 0);

    // Convert the date to the format YYYY-MM-DD
    var startDateString = startDate.toISOString().slice(0, -8);

    document.getElementById('start_date').value = startDateString;
    document.getElementById('end_date').value = endDate.toISOString().slice(0, -8);
});


document.getElementById('lastMonthButton').addEventListener('click', function () {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    document.getElementById('start_date').value = startDate.toISOString().slice(0, -8);
    document.getElementById('end_date').value = endDate.toISOString().slice(0, -8);
});