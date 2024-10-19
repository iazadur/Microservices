import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import {  InventoryCreateDTOSchema } from "@/schema";


const createInventory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        console.log('Creating inventory', req.body);
        // Validate request data
        const inventoryData = InventoryCreateDTOSchema.safeParse(req.body);
        if(!inventoryData.success) {
            return res.status(400).json({
                message: 'Invalid request data',
                errors: inventoryData.error.errors,
            });
        }

        // Create inventory
        const inventory = await prisma.inventory.create({
            data: {
                ...inventoryData.data,
                histories: {
                    create: {
                        actionType: 'IN',
                        quantityChanged: inventoryData.data.quantity,
                        lastQuantity: 0,
                        newQuantity: inventoryData.data.quantity,
                    }
                },
            },
            select: {
                id: true,
                quantity: true,
            },
        });
       return res.status(201).json({
            message: 'Inventory created successfully',
            data: inventory,
        });
    } catch (error) {
        next(error);
    }
}

export default createInventory;