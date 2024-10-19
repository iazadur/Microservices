import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";


const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<any> => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                sku: true,
                description: true,
                inventoryId: true,
            },
        });
        // TODO: Add pagination
        // TODO: Add filter

        return res.status(200).json({
        message: "Products found",
        data: products,
        });
    } catch (error) {
        next(error);
    }

}

export default getProducts;