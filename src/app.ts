import express, { Express, Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
import response from './service/Response';
import db from './database/config/config';
import routes from './routes';
import morgan from 'morgan';
import cors from 'cors';


const app: Express = express();
dotenv.config({ path: './.env' });

const port = process.env.APP_PORT || 3000;

app.use(morgan('dev'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db.sequelize.sync({ force : false }).then(() => {
//   console.log("db has been re sync")
// });

app.use('/',routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message
  });
});

app.all('*', (req: Request, res: Response)=>{
  return response.errorResponse(res,404,`Page not found. Can't find ${req.originalUrl} on this server`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});