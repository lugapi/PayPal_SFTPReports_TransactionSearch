const express = require('express');
const SftpClient = require('ssh2-sftp-client');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// static file
app.use(express.static("client"));

// analyse POST params sent in JSON
app.use(express.json());

app.set("view engine", "ejs");

const port = process.env.PORT || 3000;

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

        res.render('sftp', { files });
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
