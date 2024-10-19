import { Express, Response, Request } from "express";
import config from "./config.json";
import axios from "axios";

const createHandler = (hostName: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostName}${path}`;
      req.params &&
        Object.keys(req.params).forEach((key) => {
          url = url.replace(`:${key}`, req.params[key]);
        });
      const {data} = await axios({
        method,
        url,
        data: req.body,
        headers:{
            origin: 'http://localhost:8081'
        }
      });
     return res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        return res
          .status(error.response?.status || 500)
          .json(error.response?.data);
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

export const configureRoutes = (app: Express): void => {
  Object.entries(config.services).forEach(([_name, service]) => {
    const hostName = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostName, route.path, method);
        app[method](`/api${route.path}`, handler);
      });
    });
  });
};
