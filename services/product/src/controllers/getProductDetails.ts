import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { INVENTORY_URL } from "@/config";
import axios from "axios";

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    console.log("Product found", product);
    if (product.inventoryId === null) {
      const { data: inventory } = await axios.post(
        `${INVENTORY_URL}/inventories`,
        {
          productId: product.id,
          sku: product.sku,
        }
      );
      console.log("Inventory created successfully", inventory.id);
      await prisma.product.update({
        where: { id: product.id },
        data: {
          inventoryId: inventory.id,
        },
      });

      return res.status(200).json({
        message: "Product found",
        data: {
          ...product,
          inventoryId: inventory.id,
          stock: inventory.quantity || 0,
          stockStatus: inventory.quantity > 0 ? "In stock" : "Out of stock",
        },
      });
    }

    const { data } = await axios.get(
      `${INVENTORY_URL}/inventories/${product.inventoryId}`
    );
    const { data: inventory } = await data;
    return res.status(200).json({
      message: "Product found",
      data: {
        ...product,
        stock: inventory.quantity || 0,
        stockStatus: inventory.quantity > 0 ? "In stock" : "Out of stock",
      },
    });
  } catch (error) {
    next(error);
  }
};

export default getProductDetails;
