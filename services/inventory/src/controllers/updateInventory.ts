import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryUpdateDTOSchema } from "@/schema";

const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found",
      });
    }

    // Validate request data
    const inventoryData = InventoryUpdateDTOSchema.safeParse(req.body);
    if (!inventoryData.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: inventoryData.error.errors,
      });
    }

    // find the last history
    const lastHistory = await prisma.history.findFirst({
      where: { inventoryId: id },
      orderBy: { createdAt: "desc" },
    });

    // calculate new quantity
    let newQuantity = inventory.quantity;
    if (inventoryData.data.actionType === "IN") {
      newQuantity += inventoryData.data.quantity;
    } else {
      newQuantity -= inventoryData.data.quantity;
    }

    // Create inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: inventoryData.data.actionType,
            quantityChanged: inventoryData.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(200).json({
      message: "Inventory updated successfully",
      data: updatedInventory,
    });
    
  } catch (error) {
    next(error);
  }
};

export default updateInventory;
