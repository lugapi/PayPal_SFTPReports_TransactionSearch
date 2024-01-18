const express = require('express');
const SftpClient = require('ssh2-sftp-client');
require('dotenv').config();
const axios = require('axios');

const app = express();

// static file
app.use(express.static("client"));

// analyse POST params sent in JSON
app.use(express.json());

app.set("view engine", "ejs");

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('template', {
        body: 'home'
    });
});

app.get('/ListTransactions', (req, res) => {
    res.render('template', {
        body: 'transactions'
    });
});

app.post('/getListTransactions', async (req, res) => {
    console.log(req.body.start_date);
    console.log(req.body.end_date);

    try {
        const PPClientID = process.env.PAYPAL_CLIENT_ID;
        const PPSecret = process.env.PAYPAL_CLIENT_SECRET;

        const startDate = req.body.start_date.split("T")[0];
        const endDate = req.body.end_date.split("T")[0];

        // Validate and reformat dates
        const startDateTime = new Date(req.body.start_date);
        const endDateTime = new Date(req.body.end_date);

        // Reformat dates in the desired format with timezone offset
        const formattedStartDate = startDateTime.toISOString().split(".")[0] + '-0700';
        const formattedEndDate = endDateTime.toISOString().split(".")[0] + '-0700';

        // Build URL based on selected dates
        const url = `https://api-m.sandbox.paypal.com/v1/reporting/transactions?start_date=${encodeURIComponent(formattedStartDate)}&end_date=${encodeURIComponent(formattedEndDate)}`;

        console.log(url);

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${PPClientID}:${PPSecret}`).toString('base64')
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({
            error: 'Invalid date format'
        });
    }
});

app.get('/listSftpFiles', async (req, res) => {
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.PAYPAL_SFTP_HOST,
            port: process.env.PAYPAL_SFTP_PORT,
            username: process.env.SFTP_USERNAME,
            password: process.env.SFTP_PASSWORD,
        });

        const files = await sftp.list('/ppreports/outgoing');

        res.render('template', {
            body: 'sftp',
            files: files
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        sftp.end();
    }
});

app.get('/downloadFromSftp/:file', async (req, res) => {
    const { file } = req.params;
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.PAYPAL_SFTP_HOST,
            port: process.env.PAYPAL_SFTP_PORT,
            username: process.env.SFTP_USERNAME,
            password: process.env.SFTP_PASSWORD,
        });

        const contents = await sftp.get('/ppreports/outgoing/' + file);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
        res.status(200).send(contents);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        sftp.end();
    }
});

app.get('/previewFile/:fileName', async (req, res) => {
    const { fileName } = req.params;
    const sftp = new SftpClient();

    try {
        await sftp.connect({
            host: process.env.PAYPAL_SFTP_HOST,
            port: process.env.PAYPAL_SFTP_PORT,
            username: process.env.SFTP_USERNAME,
            password: process.env.SFTP_PASSWORD,
        });

        const fileContent = await sftp.get('/ppreports/outgoing/' + fileName);
        
        res.json({ content: fileContent.toString('utf-8') });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        sftp.end();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
