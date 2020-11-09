import express from 'express';
import bodyParser from 'body-parser';
import {DAOFactory} from './DAOFactory';
import serverlessExpress from 'aws-serverless-express';
import * as path from 'path';

const app = express();
const PORT = 8000;
const guestBookDAO:GuestbookDAO = new DAOFactory().getDAO();

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/demo-site/', async(req, res) => {
    let baseLambdaURL = process.env.BASE_URL || "";
      res.render('index', { baseURL: baseLambdaURL });
});

app.post('/demo-site/add-entry', async (req, res) => {
    guestBookDAO.addGuest(req.body.firstName, req.body.lastName);
    res.send("{status:'OK'");
});

app.get('/demo-site/get-entries', async (req, res) => {
    var result = await guestBookDAO.getEntries();
    res.send(JSON.stringify(result));
});

if ( process.env.LOCAL_MODE ) {
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
    });
}
else {
    const server = serverlessExpress.createServer(app);
    exports.handler = (event:any = {}, context:any) => {
        serverlessExpress.proxy(server, event, context);
    }
}
