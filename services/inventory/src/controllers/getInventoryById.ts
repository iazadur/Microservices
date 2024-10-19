import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getInventoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        quantity: true,
      },
    });
    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found",
      });
    }
    return res.status(200).json({
      message: "Inventory found",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

export default getInventoryById;